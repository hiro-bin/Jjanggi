import { v4 as uuidv4 } from 'https://cdn.skypack.dev/uuid';

const MOCK_DEFAULT_PIECES = {
    "player1": [
        { "id": "p1-cha-left", "type": "cha", "x": 0, "y": 9, "alive": true, "owner": "player1" },
        { "id": "p1-ma-left", "type": "ma", "x": 1, "y": 9, "alive": true, "owner": "player1" },
        { "id": "p1-sang-left", "type": "sang", "x": 2, "y": 9, "alive": true, "owner": "player1" },
        { "id": "p1-sa-left", "type": "sa", "x": 3, "y": 9, "alive": true, "owner": "player1" },
        { "id": "p1-king", "type": "king", "x": 4, "y": 8, "alive": true, "owner": "player1" },
        { "id": "p1-sa-right", "type": "sa", "x": 5, "y": 9, "alive": true, "owner": "player1" },
        { "id": "p1-sang-right", "type": "sang", "x": 6, "y": 9, "alive": true, "owner": "player1" },
        { "id": "p1-ma-right", "type": "ma", "x": 7, "y": 9, "alive": true, "owner": "player1" },
        { "id": "p1-cha-right", "type": "cha", "x": 8, "y": 9, "alive": true, "owner": "player1" },
        { "id": "p1-po-left", "type": "po", "x": 1, "y": 7, "alive": true, "owner": "player1" },
        { "id": "p1-po-right", "type": "po", "x": 7, "y": 7, "alive": true, "owner": "player1" },
        { "id": "p1-b0", "type": "byeong", "x": 0, "y": 6, "alive": true, "owner": "player1" },
        { "id": "p1-b1", "type": "byeong", "x": 2, "y": 6, "alive": true, "owner": "player1" },
        { "id": "p1-b2", "type": "byeong", "x": 4, "y": 6, "alive": true, "owner": "player1" },
        { "id": "p1-b3", "type": "byeong", "x": 6, "y": 6, "alive": true, "owner": "player1" },
        { "id": "p1-b4", "type": "byeong", "x": 8, "y": 6, "alive": true, "owner": "player1" }
    ],
    "player2": [
        { "id": "p2-cha-left", "type": "cha", "x": 0, "y": 0, "alive": true, "owner": "player2" },
        { "id": "p2-ma-left", "type": "ma", "x": 1, "y": 0, "alive": true, "owner": "player2" },
        { "id": "p2-sang-left", "type": "sang", "x": 2, "y": 0, "alive": true, "owner": "player2" },
        { "id": "p2-sa-left", "type": "sa", "x": 3, "y": 0, "alive": true, "owner": "player2" },
        { "id": "p2-king", "type": "king", "x": 4, "y": 1, "alive": true, "owner": "player2" },
        { "id": "p2-sa-right", "type": "sa", "x": 5, "y": 0, "alive": true, "owner": "player2" },
        { "id": "p2-sang-right", "type": "sang", "x": 6, "y": 0, "alive": true, "owner": "player2" },
        { "id": "p2-ma-right", "type": "ma", "x": 7, "y": 0, "alive": true, "owner": "player2" },
        { "id": "p2-cha-right", "type": "cha", "x": 8, "y": 0, "alive": true, "owner": "player2" },
        { "id": "p2-po-left", "type": "po", "x": 1, "y": 2, "alive": true, "owner": "player2" },
        { "id": "p2-po-right", "type": "po", "x": 7, "y": 2, "alive": true, "owner": "player2" },
        { "id": "p2-j0", "type": "jol", "x": 0, "y": 3, "alive": true, "owner": "player2" },
        { "id": "p2-j1", "type": "jol", "x": 2, "y": 3, "alive": true, "owner": "player2" },
        { "id": "p2-j2", "type": "jol", "x": 4, "y": 3, "alive": true, "owner": "player2" },
        { "id": "p2-j3", "type": "jol", "x": 6, "y": 3, "alive": true, "owner": "player2" },
        { "id": "p2-j4", "type": "jol", "x": 8, "y": 3, "alive": true, "owner": "player2" }
    ]
};

// --- Helper Functions ---
const BOARD_WIDTH = 9;
const BOARD_HEIGHT = 10;

const isOnBoard = (x, y) => x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;

const PALACES = {
    player1: { x: [3, 5], y: [7, 9] }, // Han Palace
    player2: { x: [3, 5], y: [0, 2] }  // Cho Palace
};

const isInPalace = (x, y, owner) => {
    const palace = owner ? PALACES[owner] : (y < 5 ? PALACES.player2 : PALACES.player1);
    return x >= palace.x[0] && x <= palace.x[1] && y >= palace.y[0] && y <= palace.y[1];
};

const getPieceAt = (x, y, allPieces) => allPieces.find(p => p.x === x && p.y === y && p.alive);

const getAllPieces = (boardState) => [
    ...boardState.pieces.player1.filter(p => p.alive),
    ...boardState.pieces.player2.filter(p => p.alive)
];

// --- Piece-specific Move Logic ---

// 차 (Chariot)
const getChaMoves = (piece, allPieces) => {
    const moves = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    const palace = isInPalace(piece.x, piece.y);

    // 직선 이동
    for (const [dx, dy] of directions) {
        for (let i = 1; ; i++) {
            const newX = piece.x + i * dx;
            const newY = piece.y + i * dy;
            if (!isOnBoard(newX, newY)) break;
            const targetPiece = getPieceAt(newX, newY, allPieces);
            if (targetPiece) {
                if (targetPiece.owner !== piece.owner) moves.push({ x: newX, y: newY });
                break;
            }
            moves.push({ x: newX, y: newY });
        }
    }

    // 궁성 내 대각선 이동
    if (palace) {
        const palaceCorners = [[3, 0], [5, 0], [3, 2], [5, 2], [3, 7], [5, 7], [3, 9], [5, 9]];
        const center = (piece.y < 5) ? {x: 4, y: 1} : {x: 4, y: 8};

        if (palaceCorners.some(c => c[0] === piece.x && c[1] === piece.y) || (piece.x === center.x && piece.y === center.y)) {
             const diag_directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
             for (const [dx, dy] of diag_directions) {
                for (let i = 1; i <= 2; i++) {
                     const newX = piece.x + i * dx;
                     const newY = piece.y + i * dy;
                     if (!isInPalace(newX, newY)) continue;
                     const targetPiece = getPieceAt(newX, newY, allPieces);
                     if (targetPiece) {
                        if(targetPiece.owner !== piece.owner) moves.push({ x: newX, y: newY});
                        break;
                     }
                     moves.push({ x: newX, y: newY});
                }
             }
        }
    }
    return moves;
};

// 마 (Horse)
const getMaMoves = (piece, allPieces) => {
    const moves = [];
    const potentialMoves = [
        [1, 2], [1, -2], [-1, 2], [-1, -2],
        [2, 1], [2, -1], [-2, 1], [-2, -1]
    ];
    const blockerOffsets = {
        '1,2': [0, 1], '1,-2': [0, -1], '-1,2': [0, 1], '-1,-2': [0, -1],
        '2,1': [1, 0], '2,-1': [1, 0], '-2,1': [-1, 0], '-2,-1': [-1, 0]
    };

    for (const [dx, dy] of potentialMoves) {
        const newX = piece.x + dx;
        const newY = piece.y + dy;
        const [blockerDx, blockerDy] = blockerOffsets[`${dx},${dy}`];
        const blockerX = piece.x + blockerDx;
        const blockerY = piece.y + blockerDy;

        if (isOnBoard(newX, newY) && !getPieceAt(blockerX, blockerY, allPieces)) {
            const targetPiece = getPieceAt(newX, newY, allPieces);
            if (!targetPiece || targetPiece.owner !== piece.owner) {
                moves.push({ x: newX, y: newY });
            }
        }
    }
    return moves;
};

// 상 (Elephant)
const getSangMoves = (piece, allPieces) => {
    const moves = [];
    const potentialMoves = [
        [2, 3], [2, -3], [-2, 3], [-2, -3],
        [3, 2], [3, -2], [-3, 2], [-3, -2]
    ];
    const blockers = {
      '2,3': [[0,1], [1,2]], '2,-3': [[0,-1], [1,-2]], '-2,3': [[0,1], [-1,2]], '-2,-3': [[0,-1], [-1,-2]],
      '3,2': [[1,0], [2,1]], '3,-2': [[1,0], [2,-1]], '-3,2': [[-1,0], [-2,1]], '-3,-2': [[-1,0], [-2,-1]]
    };

    for (const [dx, dy] of potentialMoves) {
        const newX = piece.x + dx;
        const newY = piece.y + dy;
        const [blocker1_offset, blocker2_offset] = blockers[`${dx},${dy}`];

        const blocker1 = getPieceAt(piece.x + blocker1_offset[0], piece.y + blocker1_offset[1], allPieces);
        const blocker2 = getPieceAt(piece.x + blocker2_offset[0], piece.y + blocker2_offset[1], allPieces);

        if (isOnBoard(newX, newY) && !blocker1 && !blocker2) {
            const targetPiece = getPieceAt(newX, newY, allPieces);
            if (!targetPiece || targetPiece.owner !== piece.owner) {
                moves.push({ x: newX, y: newY });
            }
        }
    }
    return moves;
};

// 포 (Cannon)
const getPoMoves = (piece, allPieces) => {
    const moves = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    for (const [dx, dy] of directions) {
        let jump = null;
        for (let i = 1; ; i++) {
            const checkX = piece.x + i * dx;
            const checkY = piece.y + i * dy;

            if (!isOnBoard(checkX, checkY)) break;
            const targetPiece = getPieceAt(checkX, checkY, allPieces);

            if (!jump) { // 아직 뛰어넘을 기물을 못 찾음
                if (targetPiece) {
                    if (targetPiece.type === 'po') break; // 포는 포를 못넘음
                    jump = targetPiece;
                }
            } else { // 뛰어넘을 기물을 찾음
                if (targetPiece) { // 경로에 두 번째 기물이 있음
                    // 포는 포를 못잡음
                    if (targetPiece.owner !== piece.owner && targetPiece.type !== 'po') {
                        moves.push({ x: checkX, y: checkY });
                    }
                    break;
                } else { // 경로가 비어있음
                    moves.push({ x: checkX, y: checkY });
                }
            }
        }
    }
    
    // 궁성 대각선 점프
    const palace = isInPalace(piece.x, piece.y);
    if (palace) {
      const diagCorners = [[3,0], [5,2], [3,2], [5,0], [3,7], [5,9], [3,9], [5,7]];
      const center = piece.y < 5 ? {x:4, y:1} : {x:4, y:8};
      
      const isCorner = diagCorners.some(c => c[0] === piece.x && c[1] === piece.y);
      if(isCorner) {
        const jump = getPieceAt(center.x, center.y, allPieces);
        if (jump && jump.type !== 'po') {
           const targetX = center.x + (center.x - piece.x);
           const targetY = center.y + (center.y - piece.y);
           const targetPiece = getPieceAt(targetX, targetY, allPieces);
           if (!targetPiece || (targetPiece.owner !== piece.owner && targetPiece.type !== 'po')) {
             moves.push({x: targetX, y: targetY});
           }
        }
      }
    }

    return moves;
};


// 궁 & 사 (King & Guard)
const getPalaceMoves = (piece, allPieces) => {
    const moves = [];
    const directions = [
        [0, 1], [0, -1], [1, 0], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];

    for (const [dx, dy] of directions) {
        const newX = piece.x + dx;
        const newY = piece.y + dy;

        if (isInPalace(newX, newY, piece.owner)) {
            const targetPiece = getPieceAt(newX, newY, allPieces);
            if (!targetPiece || targetPiece.owner !== piece.owner) {
                moves.push({ x: newX, y: newY });
            }
        }
    }
    return moves;
};


// 병 & 졸 (Soldier)
const getByeongJolMoves = (piece, allPieces) => {
    const moves = [];
    const forwardDir = piece.owner === 'player1' ? -1 : 1; // p1(Han) is bottom, p2(Cho) is top

    const potentialMoves = [
        { x: piece.x, y: piece.y + forwardDir }, // Forward
        { x: piece.x - 1, y: piece.y },         // Left
        { x: piece.x + 1, y: piece.y },         // Right
    ];
    
    // 상대 궁성에 들어갔을 때 대각선 이동 추가
    const opponentPalace = piece.owner === 'player1' ? PALACES.player2 : PALACES.player1;
    if (isInPalace(piece.x, piece.y) && !isInPalace(piece.x, piece.y, piece.owner)) {
        potentialMoves.push({ x: piece.x - 1, y: piece.y + forwardDir }); // Diag Left
        potentialMoves.push({ x: piece.x + 1, y: piece.y + forwardDir }); // Diag Right
    }


    for (const move of potentialMoves) {
        if (isOnBoard(move.x, move.y)) {
            const targetPiece = getPieceAt(move.x, move.y, allPieces);
            if (!targetPiece || targetPiece.owner !== piece.owner) {
                moves.push(move);
            }
        }
    }
    return moves;
};


export const mockGetMovable = async (boardState, piece) => {
    console.log('[MOCK] 이동 가능한 위치를 요청합니다 for', piece.type);
    const allPieces = getAllPieces(boardState);
    let movablePositions = [];

    switch (piece.type) {
        case 'cha':
            movablePositions = getChaMoves(piece, allPieces);
            break;
        case 'ma':
            movablePositions = getMaMoves(piece, allPieces);
            break;
        case 'sang':
            movablePositions = getSangMoves(piece, allPieces);
            break;
        case 'po':
            movablePositions = getPoMoves(piece, allPieces);
            break;
        case 'king':
        case 'sa':
            movablePositions = getPalaceMoves(piece, allPieces);
            break;
        case 'byeong':
        case 'jol':
            movablePositions = getByeongJolMoves(piece, allPieces);
            break;
        default:
            console.warn(`Unknown piece type: ${piece.type}`);
            break;
    }
    
    // 중복 제거
    const uniquePositions = movablePositions.filter((pos, index, self) =>
        index === self.findIndex((p) => p.x === pos.x && p.y === pos.y)
    );

    return { movablePositions: uniquePositions };
};


// --- Original Mock Functions (Unchanged) ---

export const mockCreateRoom = async () => {
    const roomId = `mock-room-${uuidv4()}`;
    console.log(`[MOCK] 룸이 생성되었습니다. ID: ${roomId}`);
    return { room_id: roomId };
};

export const mockJoinRoom = async (joinInfo) => {
    const room = {
        id: joinInfo.room_id,
        players: [
            { id: joinInfo.player_id, nickname: joinInfo.nickname, role: 'player1' },
            { id: 'mock-player-2', nickname: '컴퓨터', role: 'player2' }
        ],
        status: 'ready'
    };
    console.log(`[MOCK] 룸에 참가했습니다.`, room);
    return { role: 'player1', room: room };
};

export const mockResetGame = async () => {
    console.log('[MOCK] 게임을 초기화합니다.');
    const mockBoardState = {
        turn: 'player1',
        pieces: JSON.parse(JSON.stringify(MOCK_DEFAULT_PIECES))
    };
    return { board_state: mockBoardState };
};

export const mockSetStatus = async (newStatus) => {
    console.log(`[MOCK] 룸 상태가 '${newStatus}'(으)로 변경되었습니다.`);
    return { status: newStatus };
};

export const mockMovePiece = async (boardState, pieceId, targetCoords) => {
    console.log(`[MOCK] 기물 이동 요청: ${pieceId} ->`, targetCoords);
    const newBoardState = JSON.parse(JSON.stringify(boardState));
    let movingPiece = null;
    let capturedPiece = null;
    
    // 기물 찾기 및 소유자 확인
    for (const player of ['player1', 'player2']) {
        const piece = newBoardState.pieces[player].find(p => p.id === pieceId);
        if (piece) {
            movingPiece = piece;
            break;
        }
    }

    if (!movingPiece) {
        console.error("Moving piece not found!");
        return { newBoardState: boardState, capturedPiece: null }; // 변경 없이 반환
    }

    const opponentPlayer = movingPiece.owner === 'player1' ? 'player2' : 'player1';
    const opponentPieces = newBoardState.pieces[opponentPlayer];

    // 상대방 기물 잡기
    const capturedPieceIndex = opponentPieces.findIndex(p => p.x === targetCoords.x && p.y === targetCoords.y && p.alive);
    if (capturedPieceIndex !== -1) {
        capturedPiece = opponentPieces[capturedPieceIndex];
        console.log(`[MOCK] 기물 잡음: ${capturedPiece.id}`);
        capturedPiece.alive = false;
    }

    // 기물 이동
    movingPiece.x = targetCoords.x;
    movingPiece.y = targetCoords.y;

    // 턴 변경
    newBoardState.turn = opponentPlayer;

    return { newBoardState, capturedPiece };
};

export const mockLoadGame = async () => {
    console.log('[MOCK] 저장된 게임을 불러옵니다.');
    
    // Create a deep copy of the default pieces to avoid modifying the original
    const loadedPieces = JSON.parse(JSON.stringify(MOCK_DEFAULT_PIECES));
    
    // Find and modify a piece to simulate a loaded state
    const pieceToMove = loadedPieces.player1.find(p => p.id === 'p1-b2');
    if (pieceToMove) {
        pieceToMove.y = 5; // Move the central byeong forward
    }

    const mockBoardState = {
        turn: 'player2', // Let's say it's player2's turn in the loaded game
        pieces: loadedPieces
    };

    // The backend returns an object with board_state, turn, and updated_at
    return { 
        board_state: mockBoardState,
        turn: mockBoardState.turn,
        updated_at: new Date().toISOString()
    };
};

export const mockGetHistory = async (roomId) => {
    console.log(`[MOCK] 게임 기록을 요청합니다 for room: ${roomId}`);
    
    const history = [];
    
    // Turn 0: Initial State
    const state0 = {
        turn: 'player1',
        pieces: JSON.parse(JSON.stringify(MOCK_DEFAULT_PIECES))
    };
    history.push({ id: 1, turn: 'player1', board_state: state0, current_player: 'player1', created_at: new Date().toISOString() });

    // Turn 1: Player 1 moves byeong
    const state1 = JSON.parse(JSON.stringify(state0));
    const p1_byeong = state1.pieces.player1.find(p => p.id === 'p1-b2');
    if (p1_byeong) p1_byeong.y = 5;
    state1.turn = 'player2';
    history.push({ id: 2, turn: 'player2', board_state: state1, current_player: 'player1', created_at: new Date().toISOString() });

    // Turn 2: Player 2 moves jol
    const state2 = JSON.parse(JSON.stringify(state1));
    const p2_jol = state2.pieces.player2.find(p => p.id === 'p2-j2');
    if (p2_jol) p2_jol.y = 4;
    state2.turn = 'player1';
    history.push({ id: 3, turn: 'player1', board_state: state2, current_player: 'player2', created_at: new Date().toISOString() });
    
    // Turn 3: Player 1 moves ma
    const state3 = JSON.parse(JSON.stringify(state2));
    const p1_ma = state3.pieces.player1.find(p => p.id === 'p1-ma-left');
    if (p1_ma) {
        p1_ma.x = 2;
        p1_ma.y = 7;
    }
    state3.turn = 'player2';
    history.push({ id: 4, turn: 'player2', board_state: state3, current_player: 'player1', created_at: new Date().toISOString() });

    return history;
};
