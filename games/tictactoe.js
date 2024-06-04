const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../models/User');

class TicTacToe {
    constructor(game) {
        this.game = game;
    }

    async handleAction(interaction, position) {
        console.log('Handling action for Tic-Tac-Toe');  // Debug log
        const playerId = interaction.user.id;

        if ((this.game.currentPlayer === this.game.playerX && playerId !== this.game.playerX) || (this.game.currentPlayer === this.game.playerO && playerId !== this.game.playerO)) {
            await interaction.reply({ content: 'It is not your turn.', ephemeral: true });
            return;
        }

        const positionInt = parseInt(position);
        if (this.game.board[positionInt] !== null) {
            await interaction.reply({ content: 'Invalid move. Try again.', ephemeral: true });
            return;
        }

        this.game.board[positionInt] = this.game.currentPlayer === this.game.playerX ? 'X' : 'O';
        this.game.currentPlayer = this.game.currentPlayer === this.game.playerX ? this.game.playerO : this.game.playerX;

        const boardButtons = this.game.board.map((cell, index) => ({
            type: 2,
            style: cell === null ? ButtonStyle.Secondary : (cell === 'X' ? ButtonStyle.Primary : ButtonStyle.Danger),
            label: cell === null ? `${index}` : cell,
            custom_id: `tictactoe_${this.game.gameId}_${index}`,
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
                return this.game.board[a] !== null && this.game.board[a] === this.game.board[b] && this.game.board[a] === this.game.board[c];
            });
        };

        const isDraw = () => {
            return this.game.board.every(cell => cell !== null);
        };

        if (checkWinner()) {
            this.game.winner = this.game.currentPlayer === this.game.playerX ? this.game.playerO : this.game.playerX;

            const winnerId = this.game.winner;
            const loserId = this.game.winner === this.game.playerX ? this.game.playerO : this.game.playerX;

            const winner = await User.findOne({ discordId: winnerId });
            const loser = await User.findOne({ discordId: loserId });

            winner.coins += this.game.betAmount;
            loser.coins -= this.game.betAmount;

            await winner.save();
            await loser.save();

            await this.game.deleteOne();

            await interaction.update({
                content: `🎉 **Player ${this.game.winner} wins!** ${interaction.user.username} wins ${this.game.betAmount} Dodo Coins.\n\n**Board:**\n\n${this.game.board.map((cell, index) => cell === null ? `\`${index}\`` : cell).reduce((rows, key, index) => (index % 3 === 0 ? rows.push([key]) : rows[rows.length-1].push(key)) && rows, []).map(row => row.join(' | ')).join('\n---------\n')}`,
                components: [],
            });
        } else if (isDraw()) {
            await this.game.deleteOne();
            await interaction.update({
                content: `It's a draw!\n\n**Board:**\n\n${this.game.board.map((cell, index) => cell === null ? `\`${index}\`` : cell).reduce((rows, key, index) => (index % 3 === 0 ? rows.push([key]) : rows[rows.length-1].push(key)) && rows, []).map(row => row.join(' | ')).join('\n---------\n')}`,
                components: [],
            });
        } else {
            await this.game.save();
            await interaction.update({
                content: `Move accepted. Current board:\n\n${this.game.board.map((cell, index) => cell === null ? `\`${index}\`` : cell).reduce((rows, key, index) => (index % 3 === 0 ? rows.push([key]) : rows[rows.length-1].push(key)) && rows, []).map(row => row.join(' | ')).join('\n---------\n')}`,
                components: boardButtons,
            });
        }
    }
}

module.exports = TicTacToe;
