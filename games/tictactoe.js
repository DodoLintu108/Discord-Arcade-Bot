const { ButtonStyle } = require('discord.js');

class TicTacToe {
    constructor(playerX, playerO, betAmount) {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.playerX = playerX;
        this.playerO = playerO;
        this.betAmount = betAmount;
        this.winner = null;
    }

    makeMove(position) {
        if (this.board[position] !== null || this.winner !== null) {
            return false;
        }
        this.board[position] = this.currentPlayer;
        if (this.checkWinner()) {
            this.winner = this.currentPlayer;
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }
        return true;
    }

    checkWinner() {
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
            return this.board[a] !== null && this.board[a] === this.board[b] && this.board[a] === this.board[c];
        });
    }

    isDraw() {
        return this.board.every(cell => cell !== null) && this.winner === null;
    }

    generateBoardMessage() {
        return this.board.map((cell, index) => cell === null ? `\`${index}\`` : cell).reduce((rows, key, index) => (index % 3 == 0 ? rows.push([key]) : rows[rows.length-1].push(key)) && rows, []).map(row => row.join(' | ')).join('\n---------\n');
    }

    generateBoardButtons() {
        const rows = [];
        for (let i = 0; i < this.board.length; i += 3) {
            const row = this.board.slice(i, i + 3).map((cell, index) => ({
                type: 2,
                style: cell === null ? ButtonStyle.Secondary : (cell === 'X' ? ButtonStyle.Primary : ButtonStyle.Danger),
                label: cell === null ? `${i + index}` : cell,
                custom_id: `tictactoe_${i + index}`,
                disabled: cell !== null,
            }));
            rows.push(row);
        }
        return rows;
    }
}

module.exports = TicTacToe;
