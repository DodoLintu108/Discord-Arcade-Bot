const { SlashCommandBuilder } = require('@discordjs/builders');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Blackjack = require('../games/blackjack');
const Game = require('../models/Blackjack');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start-blackjack')
        .setDescription('Start a Blackjack game with a bet')
        .addIntegerOption(option => option.setName('bet').setDescription('The amount of Dodo Coins to bet').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply(); // Acknowledge the interaction immediately

        const betAmount = interaction.options.getInteger('bet');
        if (betAmount < 10 || betAmount > 50) {
            await interaction.followUp('Bet amount must be between 10 and 50 Dodo Coins.');
            return;
        }

        const playerData = await User.findOne({ discordId: interaction.user.id });
        if (!playerData || playerData.coins < betAmount) {
            await interaction.followUp('You do not have enough Dodo Coins to place this bet.');
            return;
        }

        const gameId = uuidv4();
        const game = new Game({
            gameId,
            players: [{ discordId: interaction.user.id, hand: [], bet: betAmount, hasDoubled: false }],
            currentPlayer: interaction.user.id,
        });
        await game.save();

        const blackjack = new Blackjack(game);
        await blackjack.startGame(interaction, betAmount);
    },
};
