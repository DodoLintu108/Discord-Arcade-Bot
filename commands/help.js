const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List all commands'),
    async execute(interaction) {
        console.log('Executing help command...');
        
        const embed = new EmbedBuilder()
            .setTitle('Dodo Arcade Bot Commands')
            .setDescription('Here are the available commands you can use:')
            .setColor('#0099ff')
            .addFields(
                { name: '/help', value: 'Displays this help message' },
                { name: '/balance', value: 'Check your Dodo Coin balance' },
                { name: '/daily', value: 'Receive your daily Dodo Coins' },
                { name: '/transfer', value: 'Transfer Dodo Coins to another user\nUsage: /transfer @user amount' }
                // Add more commands as you implement them
            )
            .setFooter({ text: 'Dodo Arcade Bot', iconURL: 'https://www.dropbox.com/scl/fi/yh0olm8gm0r0hns90fz63/DodoBotBanner.jpg?rlkey=0zr5736buj1087uhu7xsbx0s6&st=wcsexv0x&dl=0' }); // Replace with your bot's icon URL

        await interaction.reply({ embeds: [embed] });
    },
};
