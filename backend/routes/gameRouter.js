const express = require("express");
const router = express.Router();

// controllers/game/index.js 묶음 import
const controllers = require("../controllers/game");


// Rooms
router.post("/rooms/create", controllers.state.createRoom);
router.post("/rooms/join", controllers.state.joinRoom);
router.delete("/rooms/:room_id", controllers.state.deleteRoom);

// Game State (save/load/reset)
router.post("/:room_id/save", controllers.state.saveGame);
router.get("/:room_id/load", controllers.state.loadGame);
router.post("/:room_id/reset", controllers.state.resetGame);

// History
router.get("/:room_id/replay", controllers.history.replayGame);

// Movable Positions (rules)
router.post("/movable", controllers.rules.getMovablePositions);

// Pieces Status
router.get("/pieces-status", controllers.piece.getPieceStatus);

module.exports = router;
