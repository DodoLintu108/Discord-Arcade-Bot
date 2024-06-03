const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    gameId: { type: String, required: true, unique: true },
    playerX: { type: String, required: true },
    playerO: { type: String, required: true },
    board: { type: [String], required: true, default: Array(9).fill(null) },
    currentPlayer: { type: String, required: true },
    betAmount: { type: Number, required: true },
    winner: { type: String, default: null },
    createdAt: { type: Date, default: Date.now, index: { expires: '30h' } },
});

module.exports = mongoose.model('Game', gameSchema);
