import * as Phaser from 'phaser';
import { getPixelCoords, getPieceAssetKey, getGridCoordsFromPixels } from './utils/gameUtils.js';
import * as GameApi from './utils/gameApi.js';
import { initializeUI } from './utils/ui.js';

class PlayScene extends Phaser.Scene {

    constructor() {
        super('PlayScene');
        
        this.room = { id: null, status: null, players: [] };
        this.board_state = { turn: null, pieces: { player1: [], player2: [] }};
        this.finalBoardState = null;
        this.winnerInfo = null;
        
        this.selectedPieceId = null;
        this.movablePositions = [];
        this.movableMarkers = null;

        this.gameOver = false;
        this.isReplayMode = false;
        
        this.gameHistory = [];
        this.currentHistoryIndex = -1;

        this.uiManager = null;
    }

    preload() {
        this.load.setPath('assets/');
        const imageFiles = [
            'board.png',
            'chocha.png', 'chojol.png', 'choma.png', 'chopo.png', 'chosa.png', 'chosang.png', 'chowang.png',
            'hancha.png', 'hanjol.png', 'hanma.png', 'hanpo.png', 'hansa.png', 'hansang.png', 'hanwang.png'
        ];
        imageFiles.forEach(file => this.load.image(file.replace('.png', ''), file));
    }

    create() {
        const { width, height } = this.sys.game.config;
        this.pieceSpriteMap = {};

        let board = this.add.image(width / 2, height / 2, 'board').setInteractive();
        board.setScale(Math.min(width / board.width, height / board.height));

        const boardPaddingX = 50, boardPaddingY = 30;
        const scaledPaddingX = boardPaddingX * board.scale;
        const scaledPaddingY = boardPaddingY * board.scale;
        const gridTopLeftX = (width - board.displayWidth) / 2 + scaledPaddingX;
        const gridTopLeftY = (height - board.displayHeight) / 2 + scaledPaddingY;
        const gridWidth = board.displayWidth - (scaledPaddingX * 2);
        const gridHeight = board.displayHeight - (scaledPaddingY * 2);
        
        this.gridConfig = { 
            gridTopLeftX, gridTopLeftY, 
            tileWidth: gridWidth / 8, 
            tileHeight: gridHeight / 9 
        };

        this.uiManager = initializeUI(this);

        board.on('pointerdown', (pointer) => {
            if (this.isReplayMode || this.gameOver || !this.selectedPieceId) return;
            const targetCoords = getGridCoordsFromPixels(pointer.x, pointer.y, this.gridConfig);
            if (this.movablePositions.some(p => p.x === targetCoords.x && p.y === targetCoords.y)) {
                this.movePiece(this.selectedPieceId, targetCoords);
            } else {
                this.deselectPiece();
            }
        });

        this.input.on('gameobjectdown', (pointer, gameObject) => {
            if (this.isReplayMode || !this.pieceSpriteMap[gameObject.id]) return;
            this.clickPiece(pointer, gameObject);
        });

        this.createRoom();
    }

    updateBoardState(newBoardState) {
        if (!newBoardState) return console.error('업데이트할 새로운 board_state가 없습니다.');
        
        const hasStateChanged = JSON.stringify(this.board_state) !== JSON.stringify(newBoardState);
        this.board_state = newBoardState;
        this.renderBoard(this.board_state.pieces);
        this.uiManager.updateTurnDisplay(this.board_state, this.room.players);
        
        if (hasStateChanged && !this.isReplayMode) {
            GameApi.saveGame(this.room.id, this.board_state);
        }
    }

    renderBoard(pieceState) {
        if (!pieceState) return;
        Object.values(this.pieceSpriteMap).forEach(sprite => sprite.destroy());
        this.pieceSpriteMap = {};
        const allPieces = [...pieceState.player1, ...pieceState.player2];
        allPieces.forEach(piece => {
            if (piece.alive) {
                const assetKey = getPieceAssetKey(piece);
                const pixelCoords = getPixelCoords(piece.x, piece.y, this.gridConfig);
                const sprite = this.add.sprite(pixelCoords.x, pixelCoords.y, assetKey).setInteractive();
                sprite.id = piece.id;
                this.pieceSpriteMap[piece.id] = sprite;
            }
        });
    }

    displayMovablePositions() {
        if (this.movableMarkers) this.movableMarkers.destroy();
        this.movableMarkers = this.add.graphics();
        this.movableMarkers.fillStyle(0x0000ff, 0.4);
        const radius = this.gridConfig.tileWidth / 4;
        this.movablePositions.forEach((pos) => {
            const pixelCoords = getPixelCoords(pos.x, pos.y, this.gridConfig);
            this.movableMarkers.fillCircle(pixelCoords.x, pixelCoords.y, radius);
        });
    }

    deselectPiece() {
        if (this.selectedPieceId && this.pieceSpriteMap[this.selectedPieceId]) {
            this.pieceSpriteMap[this.selectedPieceId].setScale(1);
        }
        this.selectedPieceId = null;
        this.movablePositions = [];
        this.displayMovablePositions();
    }


    endGame(winnerRole) {
        if (this.gameOver) return;
        this.gameOver = true;
        this.finalBoardState = JSON.parse(JSON.stringify(this.board_state));
        this.deselectPiece();

        this.uiManager.setSurrenderButtonEnabled(false);

        const winnerPlayer = this.room.players.find(p => p.role === winnerRole);
        const winnerInfo = { nickname: winnerPlayer ? winnerPlayer.nickname : (winnerRole === 'player1' ? '초' : '한') };
        this.winnerInfo = winnerInfo;
        this.uiManager.showGameOverModal(winnerInfo);
    }

    surrenderGame() {
        if (this.gameOver) return;
        const myPlayerId = localStorage.getItem('myPlayerId');
        const myPlayer = this.room.players.find(p => p.id === myPlayerId);
        const winnerRole = myPlayer ? (myPlayer.role === 'player1' ? 'player2' : 'player1') : (this.board_state.turn === 'player1' ? 'player2' : 'player1');
        this.endGame(winnerRole);
    }

    async createRoom() {
        try {
            const { room_id } = await GameApi.createRoom();
            this.room.id = room_id;
            this.uiManager.showNicknameModal();
        } catch (error) { console.error("룸 생성 실패:", error); }
    }

    async joinRoomWithNickname(nickname) {
        let playerId = localStorage.getItem('myPlayerId');
        if (!playerId) {
            const {v4: uuidv4} = await import('https://cdn.skypack.dev/uuid');
            playerId = uuidv4();
            localStorage.setItem('myPlayerId', playerId);
        }
        try {
            const joinInfo = { room_id: this.room.id, player_id: playerId, nickname: nickname };
            const { room } = await GameApi.joinRoom(joinInfo);
            const myPlayer = room.players.find(p => p.id === joinInfo.player_id);
            if (myPlayer) myPlayer.nickname = joinInfo.nickname;
            this.room = room;
            this.handleGameStart();
        } catch (error) { console.error("룸 참가 실패:", error); }
    }

    async handleGameStart() {
        if (this.room.players.length === 2) {
            try {
                const { board_state } = await GameApi.resetGame();
                this.updateBoardState(board_state);
                const updatedStatus = await GameApi.setStatus(this.room.id, 'playing');
                if (updatedStatus?.status) this.room.status = updatedStatus.status;
            } catch (error) { console.error("게임 시작 처리 중 오류:", error); }
        }
    }

    async loadGame() {
        if (!this.room.id) return console.error("방 ID가 없습니다.");
        try {
            const data = await GameApi.loadGame(this.room.id);
            this.updateBoardState(data.board_state);
        } catch(error) { console.error("게임 불러오기 실패:", error); }
    }
    
    async enterReplayMode() {
        if (!this.room.id) return alert("게임 기록을 불러올 방 정보가 없습니다.");
        try {
            const history = await GameApi.getHistory(this.room.id);
            if (!history || history.length === 0) return alert("저장된 게임 기록이 없습니다.");

            this.isReplayMode = true;
            this.gameHistory = history;
            this.currentHistoryIndex = 0;
            this.uiManager.showReplayControls();
            this.showHistoryStep(this.currentHistoryIndex);
        } catch (error) {
            console.error("게임 기록 로딩 실패:", error);
            alert("게임 기록을 불러오는 데 실패했습니다.");
        }
    }

    exitReplayMode() {
        this.isReplayMode = false;
        this.currentHistoryIndex = -1;
        this.gameHistory = [];
        this.updateBoardState(this.finalBoardState);
        this.uiManager.showGameControls();
    }
    
    showHistoryStep(index) {
        if (index < 0 || index >= this.gameHistory.length) return;
        const historyEntry = this.gameHistory[index];
        this.renderBoard(historyEntry.board_state.pieces);
        this.uiManager.updateTurnDisplay(historyEntry.board_state, this.room.players);
        this.uiManager.updateHistoryTurnDisplay(index, this.gameHistory.length);
    }
    
    showNextStep() {
        if (this.currentHistoryIndex < this.gameHistory.length - 1) {
            this.currentHistoryIndex++;
            this.showHistoryStep(this.currentHistoryIndex);
        }
    }
    
    showPreviousStep() {
        if (this.currentHistoryIndex > 0) {
            this.currentHistoryIndex--;
            this.showHistoryStep(this.currentHistoryIndex);
        }
    }

    async clickPiece(pointer, clickedSprite) {
        if (this.gameOver) return;

        const clickedPieceId = clickedSprite.id;
        const allPieces = [...this.board_state.pieces.player1, ...this.board_state.pieces.player2];
        const clickedPieceObject = allPieces.find(p => p.id === clickedPieceId);

        if (!clickedPieceObject) return;
        
        if (this.selectedPieceId === clickedPieceId) {
            this.deselectPiece();
            return;
        }

        if (clickedPieceObject.owner !== this.board_state.turn) {
            if (this.selectedPieceId) {
                const targetCoords = getGridCoordsFromPixels(pointer.x, pointer.y, this.gridConfig);
                if (this.movablePositions.some(p => p.x === targetCoords.x && p.y === targetCoords.y)) {
                    this.movePiece(this.selectedPieceId, targetCoords);
                } else {
                    this.deselectPiece();
                }
            }
            return;
        }

        this.deselectPiece();
        this.selectedPieceId = clickedPieceId;
        this.pieceSpriteMap[this.selectedPieceId].setScale(1.1);

        try {
            const { movablePositions } = await GameApi.getMovable(this.board_state, clickedPieceObject);
            this.movablePositions = movablePositions;
            this.displayMovablePositions();
        } catch (error) {
            this.movablePositions = [];
            this.displayMovablePositions();
        }
    }

    async movePiece(pieceId, targetCoords) {
        try {
            const { newBoardState, capturedPiece } = await GameApi.movePiece(this.board_state, pieceId, targetCoords);
            this.deselectPiece();
            this.updateBoardState(newBoardState);
            
            if (capturedPiece && (capturedPiece.type === 'king' || capturedPiece.type === 'hanwang' || capturedPiece.type === 'chowang')) {
                this.endGame(capturedPiece.owner === 'player1' ? 'player2' : 'player1');
            }
        } catch(error) { console.error("기물 이동 실패:", error); this.deselectPiece(); }
    }
}

export default PlayScene;