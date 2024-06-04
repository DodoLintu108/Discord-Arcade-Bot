const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const TicTacToe = require('../models/TicTacToe');
const User = require('../models/User');

module.exports = {
    handleInteraction: async (interaction, gameId, position) => {
        const playerId = interaction.user.id;
        const game = await TicTacToe.findOne({ gameId });

        if (!game) {
            await interaction.reply({ content: 'You are not currently in a Tic-Tac-Toe game.', ephemeral: true });
            return;
        }

        if ((game.currentPlayer === game.playerX && playerId !== game.playerX) || (game.currentPlayer === game.playerO && playerId !== game.playerO)) {
            await interaction.reply({ content: 'It is not your turn.', ephemeral: true });
            return;
        }

        const positionInt = parseInt(position);
        if (game.board[positionInt] !== null) {
            await interaction.reply({ content: 'Invalid move. Try again.', ephemeral: true });
            return;
        }

        game.board[positionInt] = game.currentPlayer === game.playerX ? 'X' : 'O';
        game.currentPlayer = game.currentPlayer === game.playerX ? game.playerO : game.playerX;

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

        const checkWinner = () => {
            const winningCombinations = [
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
                [0, 3, 6],
                [1, 4, 7],
                [2, 5, 8],
                [0, 4, 8],
                [2, 4, 6]
            ];
            return winningCombinations.some(combination => {
                const [a, b, c] = combination;
                return game.board[a] !== null && game.board[a] === game.board[b] && game.board[a] === game.board[c];
            });
        };

        const isDraw = () => {
            return game.board.every(cell => cell !== null);
        };

        if (checkWinner()) {
            game.winner = game.currentPlayer === game.playerX ? game.playerO : game.playerX;

            const winnerId = game.winner;
            const loserId = game.winner === game.playerX ? game.playerO : game.playerX;

            const winner = await User.findOne({ discordId: winnerId });
            const loser = await User.findOne({ discordId: loserId });

            winner.coins += game.betAmount;
            loser.coins -= game.betAmount;

            await winner.save();
            await loser.save();

            await game.deleteOne();  // Correct method

            await interaction.update({
                content: '🎉 **Player ' + game.winner + ' wins!** ' + interaction.user.username + ' wins ' + game.betAmount + ' Dodo Coins.\n\n**Board:**\n\n' + game.board.map((cell, index) => cell === null ? '[' + index + ']' : cell).reduce((rows, key, index) => (index % 3 == 0 ? rows.push([key]) : rows[rows.length-1].push(key)) && rows, []).map(row => row.join(' | ')).join('\n---------\n'),
                components: [],
            });
        } else if (isDraw()) {
            await game.deleteOne();  // Correct method
            await interaction.update({
                content: 'It\'s a draw!\n\n**Board:**\n\n' + game.board.map((cell, index) => cell === null ? '[' + index + ']' : cell).reduce((rows, key, index) => (index % 3 == 0 ? rows.push([key]) : rows[rows.length-1].push(key)) && rows, []).map(row => row.join(' | ')).join('\n---------\n'),
                components: [],
            });
        } else {
            await game.save();
            await interaction.update({
                content: 'Move accepted. Current board:\n\n' + game.board.map((cell, index) => cell === null ? '[' + index + ']' : cell).reduce((rows, key, index) => (index % 3 == 0 ? rows.push([key]) : rows[rows.length-1].push(key)) && rows, []).map(row => row.join(' | ')).join('\n---------\n'),
                components: boardButtons,
            });
        }
    }
};
