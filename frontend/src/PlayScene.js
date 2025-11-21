import * as Phaser from 'phaser';
import { getPixelCoords, getPieceAssetKey, getPieceOwner, getGridCoordsFromPixels } from './utils/coords.js';
import { v4 as uuidv4 } from 'https://cdn.skypack.dev/uuid';
import * as MockApi from './utils/mockApi.js';
import ErrorHandler from './utils/errorHandler.js';

const MOCK_MODE = true; // true: 백엔드 연결 없이 테스트

class PlayScene extends Phaser.Scene {

    constructor() {
        super('PlayScene');
        
        this.room = {
            id: null,
            status: null,
            players: [],
        };

        this.selectedPieceId = null;
        this.movablePositions = [];
        this.movableMarkers = null;

        this.board_state = {
            turn: null,
            pieces: {
                player1: [],
                player2: []
            }
        };
    }

    preload() {
        this.load.setPath('assets/');

        const imageFiles = [
            'board.png', 'wood.png',
            'chocha.png', 'chojol.png', 'choma.png', 'chopo.png', 'chosa.png', 'chosang.png', 'chowang.png',
            'hancha.png', 'hanjol.png', 'hanma.png', 'hanpo.png', 'hansa.png', 'hansang.png', 'hanwang.png'
        ];

        imageFiles.forEach(file => {
            const key = file.replace('.png', '');
            this.load.image(key, file);
        });
    }

    create() {
        // --- 변수 및 기본 설정 ---
        let playerId = localStorage.getItem('myPlayerId');
        if(!playerId) {
            playerId = uuidv4();
            localStorage.setItem('myPlayerId', playerId);
        }

        const { width, height } = this.sys.game.config;
        this.pieceSpriteMap = {};

        let bg = this.add.image(0, 0, 'wood').setOrigin(0, 0);
        bg.displayWidth = width;
        bg.displayHeight = height;

        let board = this.add.image(width / 2, height / 2, 'board');
        board.setInteractive();
        board.setScale(Math.min(width / board.width, height / board.height)*0.9);

        const gridWidth = board.displayWidth;
        const gridHeight = board.displayHeight;
        const tileWidth = gridWidth / 8;
        const tileHeight = gridHeight / 9;
        const gridTopLeftX = (width - gridWidth) / 2;
        const gridTopLeftY = (height - gridHeight) / 2;

        const gridConfig = { gridTopLeftX, gridTopLeftY, tileWidth, tileHeight };

        const newGameButton = document.querySelector('.new-game');
        const nicknameModal = document.querySelector('#nickname-modal');
        const nicknameForm = document.querySelector('#nickname-form');
        const nicknameInput = document.querySelector('#nickname-input');

        // --- DOM & UI 핸들러 ---
        const showNicknameModal = () => {
            nicknameModal.classList.add('show');
            nicknameInput.focus();
        };

        const hideNicknameModal = () => {
            nicknameModal.classList.remove('show');
        };

        // --- 렌더링 및 화면 업데이트 ---
        const renderBoard = () => {
            if (!this.board_state) return;
            Object.values(this.pieceSpriteMap).forEach(sprite => sprite.destroy());
            this.pieceSpriteMap = {};
            const allPieces = [ ...this.board_state.pieces.player1, ...this.board_state.pieces.player2 ];
            allPieces.forEach(piece => {
                if (piece.alive) {
                    const assetKey = getPieceAssetKey(piece);
                    if (assetKey) {
                        const pixelCoords = getPixelCoords(piece.x, piece.y, gridConfig);
                        const sprite = this.add.sprite(pixelCoords.x, pixelCoords.y, assetKey);
                        this.pieceSpriteMap[piece.id] = sprite;
                        sprite.setInteractive();
                        sprite.id = piece.id;
                    }
                }
            });
        };

        const updateTurnDisplay = () => {
            const turnDisplay = document.querySelector('.turn-name');
            if (!turnDisplay) return;
            
            if (!this.board_state || !this.board_state.turn || !this.room.players || this.room.players.length === 0) {
                turnDisplay.innerText = '대기 중...';
                turnDisplay.style.color = 'black';
                return;
            }

            const currentPlayerTurnRole = this.board_state.turn; // 'player1' or 'player2'
            const currentPlayer = this.room.players.find(p => p.role === currentPlayerTurnRole);

            const nickname = currentPlayer ? currentPlayer.nickname : '';
            
            let turnText = '';
            let turnColor = 'black';

            if (currentPlayerTurnRole === 'player1') {
                turnText = `${nickname} (초)`;
                turnColor = 'green';
            } else if (currentPlayerTurnRole === 'player2') {
                turnText = `${nickname} (한)`;
                turnColor = 'red';
            } else {
                turnText = '대기 중...';
            }

            turnDisplay.innerText = turnText;
            turnDisplay.style.color = turnColor;
        };

        const displayMovablePositions = () => {
            if (this.movableMarkers) {
                this.movableMarkers.destroy();
            }
            this.movableMarkers = this.add.graphics();
            this.movableMarkers.fillStyle(0x0000ff, 0.4);
            const radius = tileWidth / 4;
            this.movablePositions.forEach((pos) => {
                const pixelCoords = getPixelCoords(pos.x, pos.y, gridConfig);
                this.movableMarkers.fillCircle(pixelCoords.x, pixelCoords.y, radius);
            });
        };

        // --- 상태 관리 및 핵심 로직 ---
        const updateBoardState = (newBoardState) => {
            if(!newBoardState) {
                ErrorHandler.handleGameLogicWarning('updateBoardState', { message: '업데이트할 새로운 board_state가 없습니다.' });
                return;
            }
            this.board_state = newBoardState;
            renderBoard();
            updateTurnDisplay();
        }

        const movePiece = async (pieceId, targetCoords) => {
            if (MOCK_MODE) {
                const newBoardState = await MockApi.mockMovePiece(this.board_state, pieceId, targetCoords);
                this.selectedPieceId = null;
                this.movablePositions = [];
                displayMovablePositions();
                updateBoardState(newBoardState);
            } else {
                try {
                    const response = await fetch('api/game/move', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pieceId: pieceId, to: targetCoords, board_state: this.board_state })
                    });
                    if(!response.ok) {
                        ErrorHandler.handleApiError('movePiece', { status: response.status, statusText: response.statusText });
                        throw new Error('API Error');
                    }
                    const newBoardState = await response.json();
                    updateBoardState(newBoardState);
                } catch(error) {
                    ErrorHandler.handleUnexpectedError('movePiece', error);
                }
            }
        };

        const clickPiece = async(pointer, clickedSprite) => {
            const clickedPieceId = clickedSprite.id;
            
            if (this.selectedPieceId && this.pieceSpriteMap[this.selectedPieceId]) {
                this.pieceSpriteMap[this.selectedPieceId].setScale(1);
            }

            if (this.selectedPieceId === clickedPieceId) {
                this.selectedPieceId = null;
                this.movablePositions = [];
                displayMovablePositions();
                return;
            }
            
            const owner = getPieceOwner(clickedPieceId);
            if (owner !== this.board_state.turn) {
                ErrorHandler.handleGameLogicWarning('clickPiece', { 
                    message: '잘못된 턴에 기물 이동을 시도했습니다.',
                    expected: this.board_state.turn,
                    actual: owner 
                });
                this.selectedPieceId = null;
                return;
            }

            this.selectedPieceId = clickedPieceId;
            if (this.pieceSpriteMap[this.selectedPieceId]) {
                this.pieceSpriteMap[this.selectedPieceId].setScale(1.1);
            }

            const allPieces = [ ...this.board_state.pieces.player1, ...this.board_state.pieces.player2 ];
            const selectedPieceObject = allPieces.find(p => p.id === this.selectedPieceId);

            try {
                if (MOCK_MODE) {
                    const { movablePositions } = await MockApi.mockGetMovable(selectedPieceObject);
                    this.movablePositions = movablePositions;
                } else {
                    const response = await fetch('/api/game/movable', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ piece: selectedPieceObject, board_state: this.board_state })
                    });
                    if (!response.ok) {
                        ErrorHandler.handleApiError('clickPiece', { status: response.status, statusText: response.statusText });
                        throw new Error(`API Error`);
                    }
                    const data = await response.json();
                    this.movablePositions = data.movablePositions;
                }
                displayMovablePositions();
            } catch(error) {
                ErrorHandler.handleUnexpectedError('clickPiece', error);
                this.movablePositions = [];
                displayMovablePositions();
            }
        };

        // --- 초기화 및 게임 흐름 ---
        const resetGame = async () => {
            if (MOCK_MODE) {
                const { board_state } = await MockApi.mockResetGame();
                return board_state;
            }

            try {
                const response = await fetch('/api/game/reset', {method: 'POST'});
                if (!response.ok) {
                    ErrorHandler.handleApiError('resetGame', { status: response.status, statusText: response.statusText });
                    throw new Error(`API Error`);
                }
                const data = await response.json();
                return data.board_state;
            } catch(error) {
                ErrorHandler.handleUnexpectedError('resetGame', error);
                return null;
            }
        };

        const setStatus = async (newStatus) => {
            if (MOCK_MODE) {
                const { status } = await MockApi.mockSetStatus(newStatus);
                this.room.status = status;
                return;
            }

            if (!this.room || !this.room.id) {
                ErrorHandler.handleGameLogicWarning('setStatus', { message: "룸 정보가 없어 상태를 변경할 수 없습니다." });
                return;
            }

            try {
                const response = await fetch(`/api/game/${this.room.id}/status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                if (!response.ok) {
                    ErrorHandler.handleApiError('setStatus', { status: response.status, statusText: response.statusText });
                    throw new Error(`API Error`);
                }
                const updatedRoom = await response.json();
                this.room = updatedRoom;
                console.log(`룸 상태가 서버에 의해 '${this.room.status}'(으)로 업데이트되었습니다.`);
            } catch (error) {
                ErrorHandler.handleUnexpectedError('setStatus', error);
            }
        };
        
        const handleGameStart = async () => {
            if (this.room.players.length === 2) {
                console.log("두 명의 플레이어가 모두 입장했습니다. 게임을 시작합니다.");
                try {
                    const newBoardState = await resetGame();
                    updateBoardState(newBoardState);
                    await setStatus('playing');
                } catch (error) {
                    ErrorHandler.handleUnexpectedError('handleGameStart', error);
                }
            } else {
                console.log("아직 플레이어가 모두 입장하지 않았습니다. 현재 인원:", this.room.players.length);
            }
        };

        const joinRoom = async(joinInfo) => {
            if (MOCK_MODE) {
                const { room } = await MockApi.mockJoinRoom(joinInfo);
                
                // MockApi가 반환한 플레이어 목록에서 현재 플레이어를 찾아 닉네임을 주입합니다.
                const myPlayer = room.players.find(p => p.id === joinInfo.player_id);
                if (myPlayer) {
                    myPlayer.nickname = joinInfo.nickname;
                }

                this.room = room;
                handleGameStart();
                return;
            }

            try {
                const response = await fetch('/api/game/rooms/join', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ room_id: joinInfo.room_id, player_id: joinInfo.player_id })
                });
                if(!response.ok) {
                    ErrorHandler.handleApiError('joinRoom', { status: response.status, statusText: response.statusText });
                    throw new Error(`API Error`);
                }
                const { room } = await response.json();
                this.room = room;
                handleGameStart();
            } catch (error) {
                ErrorHandler.handleUnexpectedError('joinRoom', error);
            }
        }

        const createRoom = async() => {
            if (MOCK_MODE) {
                const { room_id } = await MockApi.mockCreateRoom();
                this.room.id = room_id;
                showNicknameModal();
                return;
            }

            try {
                const response = await fetch('/api/game/rooms/create', {method: 'POST'});
                if(!response.ok) {
                    ErrorHandler.handleApiError('createRoom', { status: response.status, statusText: response.statusText });
                    throw new Error(`API Error`);
                }
                const { room_id } = await response.json();
                this.room.id = room_id;
                console.log(`룸이 생성되었습니다. ID: ${this.room.id}`);
                showNicknameModal();
            } catch (error) {
                ErrorHandler.handleUnexpectedError('createRoom', error);
            }
        }

        // --- 이벤트 리스너 설정 ---
        nicknameForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const nickname = nicknameInput.value;
            if (nickname) {
                console.log(`입력된 닉네임: ${nickname}`);
                hideNicknameModal();
                joinRoom({
                    room_id: this.room.id,
                    player_id: playerId,
                    nickname: nickname
                });
            }
        });

        board.on('pointerdown', (pointer) => {
            if(!this.selectedPieceId) return;

            const targetCoords = getGridCoordsFromPixels(pointer.x, pointer.y, gridConfig);
            const isValidMove = this.movablePositions.some(p => p.x === targetCoords.x && p.y === targetCoords.y);

            if(isValidMove) {
                movePiece(this.selectedPieceId, targetCoords);
            } else {
                if (this.pieceSpriteMap[this.selectedPieceId]) {
                    this.pieceSpriteMap[this.selectedPieceId].setScale(1);
                }
                this.selectedPieceId = null;
                this.movablePositions = [];
                displayMovablePositions();
            }
        });

        this.input.on('gameobjectdown', (pointer, gameObject) => {
            if (this.pieceSpriteMap[gameObject.id]) {
                clickPiece(pointer, gameObject);
            }
        });

        if (newGameButton) {
            newGameButton.addEventListener('click', () => createRoom());
        }

        createRoom();
    }
}

export default PlayScene;