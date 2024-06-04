const Blackjack = require('../games/blackjack');
const BlackjackModel = require('../models/Blackjack');

module.exports = {
    name: 'blackjack',
    async execute(interaction) {
        const betAmount = interaction.options.getInteger('bet');
        const playerId = interaction.user.id;
        const playerName = interaction.user.username;

        if (betAmount < 10 || betAmount > 50) {
            await interaction.reply({ content: 'You can only bet between 10 and 50 Dodo Coins.', ephemeral: true });
            return;
        }

        // Check if user has enough coins
        const user = await User.findOne({ discordId: playerId });
        if (!user || user.coins < betAmount) {
            await interaction.reply({ content: 'You do not have enough Dodo Coins.', ephemeral: true });
            return;
        }

        // Create a new game instance
        const newGame = new BlackjackModel({
            gameId: interaction.id,
            players: [{ discordId: playerId, bet: betAmount }],
            dealerHand: [],
            gameState: 'waiting'
        });

        // Save the new game
        await newGame.save();

        const blackjack = new Blackjack(newGame);
        await blackjack.startGame(interaction, betAmount);

        console.log(`Blackjack game started by ${playerName} with bet amount ${betAmount}`);
    }
};
