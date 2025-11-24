import * as MockApi from './mockApi.js';
import ErrorHandler from './errorHandler.js';
import { getPieceOwner } from './gameUtils.js';

const MOCK_MODE = true; // true: 백엔드 연결 없이 테스트
const NGROK_ADDRESS = 'https://shantylike-kimiko-unexplainably.ngrok-free.dev';

export const createRoom = async () => {
    if (MOCK_MODE) {
        return await MockApi.mockCreateRoom();
    }
    try {
        const response = await fetch(`${NGROK_ADDRESS}/api/game/rooms/create`, { method: 'POST' });
        if (!response.ok) {
            ErrorHandler.handleApiError('createRoom', { status: response.status, statusText: response.statusText });
            throw new Error(`API Error`);
        }
        return await response.json();
    } catch (error) {
        ErrorHandler.handleUnexpectedError('createRoom', error);
        throw error;
    }
};

export const joinRoom = async (joinInfo) => {
    if (MOCK_MODE) {
        return await MockApi.mockJoinRoom(joinInfo);
    }
    try {
        const response = await fetch(`${NGROK_ADDRESS}/api/game/rooms/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room_id: joinInfo.room_id, player_id: joinInfo.player_id })
        });
        if (!response.ok) {
            ErrorHandler.handleApiError('joinRoom', { status: response.status, statusText: response.statusText });
            throw new Error(`API Error`);
        }
        return await response.json();
    } catch (error) {
        ErrorHandler.handleUnexpectedError('joinRoom', error);
        throw error;
    }
};

export const setStatus = async (roomId, newStatus) => {
    if (MOCK_MODE) {
        return await MockApi.mockSetStatus(newStatus);
    }
    if (!roomId) {
        ErrorHandler.handleGameLogicWarning('setStatus', { message: "룸 정보가 없어 상태를 변경할 수 없습니다." });
        return;
    }
    try {
        const response = await fetch(`${NGROK_ADDRESS}/api/game/${roomId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (!response.ok) {
            ErrorHandler.handleApiError('setStatus', { status: response.status, statusText: response.statusText });
            throw new Error(`API Error`);
        }
        return await response.json();
    } catch (error) {
        ErrorHandler.handleUnexpectedError('setStatus', error);
        throw error;
    }
};

export const resetGame = async () => {
    if (MOCK_MODE) {
        return await MockApi.mockResetGame();
    }
    try {
        const response = await fetch(`${NGROK_ADDRESS}/api/game/reset`, { method: 'POST' });
        if (!response.ok) {
            ErrorHandler.handleApiError('resetGame', { status: response.status, statusText: response.statusText });
            throw new Error(`API Error`);
        }
        return await response.json();
    } catch (error) {
        ErrorHandler.handleUnexpectedError('resetGame', error);
        throw error;
    }
};

export const loadGame = async (roomId) => {
    if (MOCK_MODE) {
        return await MockApi.mockLoadGame();
    }
    try {
        const response = await fetch(`${NGROK_ADDRESS}/api/game/${roomId}/load`);
        if (!response.ok) {
            ErrorHandler.handleApiError('loadGame', { status: response.status, statusText: response.statusText });
            throw new Error(`API Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        ErrorHandler.handleUnexpectedError('loadGame', error);
        throw error;
    }
};

export const saveGame = async (roomId, boardState) => {
    if (MOCK_MODE) {
        console.log('[MOCK] Skipping saveGame in mock mode.');
        return;
    }
    try {
        const currentPlayer = boardState.turn === 'player1' ? 'player2' : 'player1';
        const response = await fetch(`${NGROK_ADDRESS}/api/game/${roomId}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                board_state: boardState,
                turn: boardState.turn,
                current_player: currentPlayer
            })
        });
        if (!response.ok) {
            ErrorHandler.handleApiError('saveGame', { status: response.status, statusText: response.statusText });
            throw new Error(`API Error`);
        }
    } catch (error) {
        ErrorHandler.handleUnexpectedError('saveGame', error);
    }
};

export const getMovable = async (boardState, piece) => {
    if (MOCK_MODE) {
        return await MockApi.mockGetMovable(boardState, piece);
    }
    try {
        const response = await fetch(`${NGROK_ADDRESS}/api/game/movable`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ piece: piece, board_state: boardState })
        });
        if (!response.ok) {
            ErrorHandler.handleApiError('getMovable', { status: response.status, statusText: response.statusText });
            throw new Error(`API Error`);
        }
        return await response.json();
    } catch (error) {
        ErrorHandler.handleUnexpectedError('getMovable', error);
        throw error;
    }
};

export const movePiece = async (boardState, pieceId, targetCoords) => {
    if (MOCK_MODE) {
        return await MockApi.mockMovePiece(boardState, pieceId, targetCoords);
    }
    const newBoardState = JSON.parse(JSON.stringify(boardState));
    const pieceOwner = getPieceOwner(pieceId, newBoardState);

    if (pieceOwner === 'unknown') {
        ErrorHandler.handleGameLogicWarning('movePiece', { message: `알 수 없는 기물 ID: ${pieceId}` });
        return { newBoardState: boardState, capturedPiece: null };
    }

    const movingPiece = newBoardState.pieces[pieceOwner].find(p => p.id === pieceId);
    if (!movingPiece) {
        ErrorHandler.handleGameLogicWarning('movePiece', { message: `이동할 기물을 찾을 수 없습니다: ${pieceId}` });
        return { newBoardState: boardState, capturedPiece: null };
    }

    const opponentPlayer = movingPiece.owner === 'player1' ? 'player2' : 'player1';
    const opponentPieces = newBoardState.pieces[opponentPlayer];
    let capturedPiece = null;

    const capturedPieceIndex = opponentPieces.findIndex(p => p.x === targetCoords.x && p.y === targetCoords.y && p.alive);
    if (capturedPieceIndex !== -1) {
        capturedPiece = opponentPieces[capturedPieceIndex];
        console.log(`기물 잡음: ${capturedPiece.id}`);
        capturedPiece.alive = false;
    }

    movingPiece.x = targetCoords.x;
    movingPiece.y = targetCoords.y;
    newBoardState.turn = opponentPlayer;

    return { newBoardState, capturedPiece };
};

export const getHistory = async (roomId) => {
    if (MOCK_MODE) {
        return await MockApi.mockGetHistory(roomId);
    }
    try {
        const response = await fetch(`${NGROK_ADDRESS}/api/game/${roomId}/replay`);
        if (!response.ok) {
            ErrorHandler.handleApiError('getHistory', { status: response.status, statusText: response.statusText });
            throw new Error(`API Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        ErrorHandler.handleUnexpectedError('getHistory', error);
        throw error;
    }
};
