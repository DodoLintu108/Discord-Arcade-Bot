const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { v4: uuidv4 } = require('uuid');  // Add this line to import UUID generator
const TicTacToe = require('../games/tictactoe');
const User = require('../models/User');
const Game = require('../models/Game');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start-tictactoe')
        .setDescription('Start a Tic-Tac-Toe game with a bet')
        .addUserOption(option => option.setName('opponent').setDescription('The user you want to play against').setRequired(true))
        .addIntegerOption(option => option.setName('bet').setDescription('The amount of Dodo Coins to bet').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply(); // Acknowledge the interaction immediately

        const playerX = interaction.user;
        const playerO = interaction.options.getUser('opponent');
        const betAmount = interaction.options.getInteger('bet');

        if (playerX.id === playerO.id) {
            await interaction.followUp('You cannot play against yourself.');
            return;
        }

        try {
            const playerXData = await User.findOne({ discordId: playerX.id });
            const playerOData = await User.findOne({ discordId: playerO.id });

            if (!playerXData || playerXData.coins < betAmount) {
                await interaction.followUp('You do not have enough Dodo Coins to place this bet.');
                return;
            }

            if (!playerOData || playerOData.coins < betAmount) {
                await interaction.followUp('Your opponent does not have enough Dodo Coins to place this bet.');
                return;
            }

            const gameId = uuidv4();  // Generate a unique game ID
            const game = new Game({
                gameId,
                playerX: playerX.id,
                playerO: playerO.id,
                currentPlayer: playerX.id,
                betAmount,
            });
            await game.save();

            const boardButtons = game.board.map((cell, index) => ({
                type: 2,
                style: cell === null ? ButtonStyle.Secondary : (cell === 'X' ? ButtonStyle.Primary : ButtonStyle.Danger),
                label: cell === null ? `${index}` : cell,
                custom_id: `tictactoe_${gameId}_${index}`,  // Include gameId in the custom ID
                disabled: cell !== null,
            })).reduce((rows, button, index) => {
                if (index % 3 === 0) rows.push([]);
                rows[rows.length - 1].push(button);
                return rows;
            }, []).map(row => new ActionRowBuilder().addComponents(row.map(button => new ButtonBuilder()
                .setCustomId(button.custom_id)
                .setLabel(button.label)
                .setStyle(button.style)
                .setDisabled(button.disabled)
            )));

            await interaction.followUp({ 
                content: `**Tic-Tac-Toe game started between ${playerX.username} and ${playerO.username}**\n\n**Bet amount:** ${betAmount} Dodo Coins\n\n**Player X:** ${playerX.username}\n**Player O:** ${playerO.username}\n\n**Player X starts the game.**\n\n**Board:**\n\n${game.board.map((cell, index) => cell === null ? `\`${index}\`` : cell).reduce((rows, key, index) => (index % 3 == 0 ? rows.push([key]) : rows[rows.length-1].push(key)) && rows, []).map(row => row.join(' | ')).join('\n---------\n')}`, 
                components: boardButtons 
            });
        } catch (error) {
            console.error(error);
            await interaction.followUp('There was an error while executing this command.');
        }
    },
};
