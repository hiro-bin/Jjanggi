const pool = require("../../db/db");
const { v4: uuidv4 } = require("uuid");

exports.createRoom = async () => {
    const roomId = uuidv4();
    await pool.query(`INSERT INTO rooms (room_id) VALUES (?)`, [roomId]);
    return roomId;
};

exports.joinRoom = async (roomId, playerId) => {
    const [[room]] = await pool.query(`SELECT * FROM rooms WHERE room_id = ?`, [
        roomId,
    ]);

    if (!room) throw new Error("방 없음");

    if (!room.player1_id) {
        await pool.query(`UPDATE rooms SET player1_id = ? WHERE room_id = ?`, [
            playerId,
            roomId,
        ]);
        return { role: "player1" };
    }

    if (!room.player2_id) {
        await pool.query(`UPDATE rooms SET player2_id = ? WHERE room_id = ?`, [
            playerId,
            roomId,
        ]);
        return { role: "player2" };
    }

    throw new Error("방 꽉참");
};

exports.saveGame = async (roomId, boardState, turn, currentPlayer) => {
    // 1. DB에서 현재 턴 조회
    const [[state]] = await pool.query(
        `SELECT turn FROM game_state WHERE room_id = ?`,
        [roomId]
    );

    // 저장된 기록이 없다면 (첫 저장이면 통과)
    const savedTurn = state ? state.turn : null;

    // 2. 턴 검증
    if (savedTurn && savedTurn !== currentPlayer) {
        const err = new Error("INVALID_TURN");
        err.code = "INVALID_TURN";
        throw err;
    }

    // 3. 정상 저장
    await pool.query(
        `REPLACE INTO game_state (room_id, board_state, turn)
         VALUES (?, ?, ?)`,
        [roomId, JSON.stringify(boardState), turn]
    );

    await pool.query(
        `INSERT INTO game_history (room_id, turn, board_state, current_player)
         VALUES (?, ?, ?, ?)`,
        [roomId, turn, JSON.stringify(boardState), currentPlayer]
    );
};


exports.loadGame = async (roomId) => {
    const [rows] = await pool.query(
        `SELECT * FROM game_state WHERE room_id = ?`,
        [roomId]
    );

    if (!rows.length) throw new Error("저장 없음");

    return {
        board_state: JSON.parse(rows[0].board_state),
        turn: rows[0].turn,
        updated_at: rows[0].updated_at,
    };
};

exports.resetGame = async (roomId) => {
    const defaultState = {
        turn: "player1",
        pieces: require("./defaultPieces.json"), // ▼ 별도 JSON 파일 추천
    };

    await pool.query(
        `REPLACE INTO game_state (room_id, board_state, turn)
         VALUES (?, ?, 'player1')`,
        [roomId, JSON.stringify(defaultState)]
    );

    return {
        message: "게임 리셋 완료",
        board_state: defaultState,
    };
};

exports.deleteRoom = async (roomId) => {
    const [rows] = await pool.query(`SELECT * FROM rooms WHERE room_id = ?`, [
        roomId,
    ]);

    if (!rows.length) throw new Error("방 없음");

    await pool.query(`DELETE FROM rooms WHERE room_id = ?`, [roomId]);
};

