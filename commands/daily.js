const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Receive your daily Dodo Coins'),
    async execute(interaction) {
        const userId = interaction.user.id;
        let user = await User.findOne({ discordId: userId });

        if (!user) {
            user = new User({ discordId: userId });
        }

        const today = new Date().toISOString().slice(0, 10);
        if (user.lastClaimed && user.lastClaimed === today) {
            await interaction.reply('You have already claimed your daily Dodo Coins today.');
        } else {
            user.coins += 100;
            user.lastClaimed = today;
            await user.save();
            await interaction.reply(`💰 100 Dodo Coins received! Your balance is now ${user.coins} Dodo Coins.`);
        }
    },
};
