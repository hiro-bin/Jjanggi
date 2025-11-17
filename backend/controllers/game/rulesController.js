const rulesEngine = require("../../services/game/rulesEngine");

exports.getMovablePositions = (req, res) => {
    const { piece, position, board_state } = req.body;

    const moves = rulesEngine.getMovablePositions(piece, position, board_state);

    return res.json({ movablePositions: moves });
};
