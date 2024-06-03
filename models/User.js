const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    discordId: { type: String, required: true, unique: true },
    coins: { type: Number, default: 0 },
    lastClaimed: { type: String }, // Store as YYYY-MM-DD string
    wins: {
        trivia: { type: Number, default: 0 },
        rps: { type: Number, default: 0 },
        hangman: { type: Number, default: 0 },
        tictactoe: { type: Number, default: 0 },
        slots: { type: Number, default: 0 },
        // Add other games as needed
    },
    losses: {
        trivia: { type: Number, default: 0 },
        rps: { type: Number, default: 0 },
        hangman: { type: Number, default: 0 },
        tictactoe: { type: Number, default: 0 },
        slots: { type: Number, default: 0 },
        // Add other games as needed
    },
    items: { type: [String], default: [] },
});

module.exports = mongoose.model('User', userSchema);
