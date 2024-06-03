const mongoose = require('mongoose');

const blackjackSchema = new mongoose.Schema({
    gameId: { type: String, required: true, unique: true },
    players: [{ discordId: String, hand: [String], bet: Number, hasDoubled: Boolean }],
    dealerHand: { type: [String], required: true, default: [] },
    currentPlayer: { type: String, required: true },
    gameState: { type: String, required: true, default: 'waiting' },
    createdAt: { type: Date, default: Date.now, index: { expires: '30h' } },
});

module.exports = mongoose.model('Blackjack', blackjackSchema);
