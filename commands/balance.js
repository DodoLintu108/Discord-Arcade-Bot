const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your Dodo Coin balance'),
    async execute(interaction) {
        const userId = interaction.user.id;
        let user = await User.findOne({ discordId: userId });

        if (!user) {
            user = new User({ discordId: userId });
            await user.save();
        }

        await interaction.reply(`💰 You have ${user.coins} Dodo Coins.`);
    },
};
