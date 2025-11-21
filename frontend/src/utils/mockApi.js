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

export const mockGetMovable = async (piece) => {
    console.log('[MOCK] 이동 가능한 위치를 요청합니다.');
    const mockPositions = [
        { x: piece.x, y: piece.y - 1 },
        { x: piece.x, y: piece.y + 1 },
        { x: piece.x - 1, y: piece.y },
        { x: piece.x + 1, y: piece.y },
    ].filter(p => p.x >= 0 && p.x <= 8 && p.y >= 0 && p.y <= 9);
    return { movablePositions: mockPositions };
};

export const mockMovePiece = async (boardState, pieceId, targetCoords) => {
    console.log(`[MOCK] 기물 이동 요청: ${pieceId} ->`, targetCoords);
    const newBoardState = JSON.parse(JSON.stringify(boardState));
    let movingPiece = newBoardState.pieces.player1.find(p => p.id === pieceId) || newBoardState.pieces.player2.find(p => p.id === pieceId);
    const opponentPlayer = movingPiece.owner === 'player1' ? 'player2' : 'player1';
    const opponentPieces = newBoardState.pieces[opponentPlayer];
    const capturedPiece = opponentPieces.find(p => p.x === targetCoords.x && p.y === targetCoords.y && p.alive);
    if (capturedPiece) {
        console.log(`[MOCK] 기물 잡음: ${capturedPiece.id}`);
        capturedPiece.alive = false;
    }
    movingPiece.x = targetCoords.x;
    movingPiece.y = targetCoords.y;
    newBoardState.turn = opponentPlayer;
    return newBoardState;
};
