// Load environment variables from .env file
require('dotenv').config();

// Import the discord.js and mongoose modules
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

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
        console.log(`Button interaction: action=${action}, gameId=${gameId}, position=${position}`);
        if (action === 'tictactoe') {
            const TicTacToeGame = require('./games/tictactoe');
            const game = await require('./models/TicTacToe').findOne({ gameId });

            if (!game) {
                await interaction.reply({ content: 'You are not currently in a Tic-Tac-Toe game.', ephemeral: true });
                return;
            }

            const ticTacToe = new TicTacToeGame(game);
            console.log('Instantiated TicTacToeGame:', ticTacToe);  // Debug log
            console.log('Handle Action Method:', ticTacToe.handleAction);  // Debug log
            await ticTacToe.handleAction(interaction, position);
        } else if (['hit', 'stand', 'double'].includes(action)) {
            const BlackjackGame = require('./games/blackjack');
            const game = await require('./models/Blackjack').findOne({ gameId });

            if (!game) {
                await interaction.reply({ content: 'Game not found.', ephemeral: true });
                return;
            }

            const blackjack = new BlackjackGame(game);
            await blackjack.handleAction(interaction, action);
        }
    }
});

// Login to Discord with your app's token
client.login(process.env.DISCORD_TOKEN);
