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
                { name: '/help', value: 'Displays the list of available commands' },
                { name: '/balance', value: 'Check your Dodo Coin balance' },
                { name: '/daily', value: 'Receive your daily Dodo Coins' },
                { name: '/transfer @user amount', value: 'Transfer Dodo Coins to another user' },
                { name: '/rps', value: 'Play Rock, Paper, Scissors' },
                { name: '/hangman', value: 'Play Hangman' },
                { name: '/start-tictactoe betAmount', value: 'Start a game of Tic-Tac-Toe with a bet amount' },
                { name: '/start-blackjack betAmount', value: 'Start a game of Blackjack with a bet amount' }
            )
            .setFooter({ text: 'Dodo Arcade Bot', iconURL: 'https://media.discordapp.net/attachments/1247206283153772665/1247256746846584924/DodoBot.jpg?ex=665f5ddd&is=665e0c5d&hm=3c73cf58e331d8b1b125548795cb87c35e65e17353d4473cd929dfabb76facd2&=&format=webp&width=701&height=701' });

        await interaction.reply({ embeds: [embed] });
    },
};
