// Load environment variables from .env file
require('dotenv').config();

// Import the discord.js and mongoose modules
const { Client, GatewayIntentBits, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const Game = require('./models/Game');  // Correct import

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // Add timeout setting
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Could not connect to MongoDB', err);
});

// Load command files
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Ready!');
});

// Command handler
client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            console.log(`Executing command: ${interaction.commandName}`);
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    } else if (interaction.isButton()) {
        const [action, gameId, position] = interaction.customId.split('_');
        if (action === 'tictactoe') {
            const playerId = interaction.user.id;
            const game = await Game.findOne({ gameId });

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
                    content: `🎉 **Player ${game.winner} wins!** ${interaction.user.username} wins ${game.betAmount} Dodo Coins.\n\n**Board:**\n\n${game.board.map((cell, index) => cell === null ? `\`${index}\`` : cell).reduce((rows, key, index) => (index % 3 == 0 ? rows.push([key]) : rows[rows.length-1].push(key)) && rows, []).map(row => row.join(' | ')).join('\n---------\n')}`,
                    components: [],
                });
            } else if (isDraw()) {
                await game.deleteOne();  // Correct method
                await interaction.update({
                    content: `It's a draw!\n\n**Board:**\n\n${game.board.map((cell, index) => cell === null ? `\`${index}\`` : cell).reduce((rows, key, index) => (index % 3 == 0 ? rows.push([key]) : rows[rows.length-1].push(key)) && rows, []).map(row => row.join(' | ')).join('\n---------\n')}`,
                    components: [],
                });
            } else {
                await game.save();
                await interaction.update({
                    content: `Move accepted. Current board:\n\n${game.board.map((cell, index) => cell === null ? `\`${index}\`` : cell).reduce((rows, key, index) => (index % 3 == 0 ? rows.push([key]) : rows[rows.length-1].push(key)) && rows, []).map(row => row.join(' | ')).join('\n---------\n')}`,
                    components: boardButtons,
                });
            }
        }
    }
});

// Login to Discord with your app's token
client.login(process.env.DISCORD_TOKEN);
