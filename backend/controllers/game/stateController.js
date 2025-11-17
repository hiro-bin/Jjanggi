const stateService = require("../../services/game/stateService");

exports.createRoom = async (req, res) => {
    try {
        const result = await stateService.createRoom();
        return res.json({ room_id: result });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "서버 오류" });
    }
};

exports.joinRoom = async (req, res) => {
    try {
        const { room_id, player_id } = req.body;
        const result = await stateService.joinRoom(room_id, player_id);
        return res.json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "서버 오류" });
    }
};

exports.saveGame = async (req, res) => {
    try {
        const { room_id } = req.params;
        const { board_state, turn, current_player } = req.body;

        await stateService.saveGame(room_id, board_state, turn, current_player);
        return res.json({ message: "게임 저장 완료" });
    } catch (err) {
        console.error(err);
        if (err.code === "INVALID_TURN") {
            return res.status(400).json({
                message: "잘못된 턴입니다. 상대 턴입니다!",
            });
        }

        // 일반 서버 오류
        return res.status(500).json({ message: "서버 오류" });
    }
};

exports.loadGame = async (req, res) => {
    try {
        const { room_id } = req.params;
        const result = await stateService.loadGame(room_id);
        return res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "서버 오류" });
    }
};

exports.resetGame = async (req, res) => {
    try {
        const { room_id } = req.params;
        const result = await stateService.resetGame(room_id);
        return res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "서버 오류" });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        const { room_id } = req.params;
        await stateService.deleteRoom(room_id);
        return res.json({ message: "방 삭제 완료" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "서버 오류" });
    }
};