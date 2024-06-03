const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Transfer Dodo Coins to another user')
        .addUserOption(option => option.setName('target').setDescription('The user to transfer coins to').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('The amount of Dodo Coins to transfer').setRequired(true)),
    async execute(interaction) {
        const senderId = interaction.user.id;
        const targetUser = interaction.options.getUser('target');
        const amount = interaction.options.getInteger('amount');

        if (amount <= 0) {
            await interaction.reply('You must transfer a positive amount of Dodo Coins.');
            return;
        }

        let sender = await User.findOne({ discordId: senderId });
        let receiver = await User.findOne({ discordId: targetUser.id });

        if (!sender) {
            sender = new User({ discordId: senderId });
            await sender.save();
        }

        if (!receiver) {
            receiver = new User({ discordId: targetUser.id });
            await receiver.save();
        }

        if (sender.coins < amount) {
            await interaction.reply('You do not have enough Dodo Coins to transfer.');
            return;
        }

        sender.coins -= amount;
        receiver.coins += amount;
        await sender.save();
        await receiver.save();

        await interaction.reply(`💰 You have successfully transferred ${amount} Dodo Coins to <@${targetUser.id}>.`);
    },
};
