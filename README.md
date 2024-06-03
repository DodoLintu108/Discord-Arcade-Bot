# Dodo Arcade Bot

Dodo Arcade Bot is a fun and interactive Discord bot that provides a variety of arcade games and a virtual currency system called Dodo Coin. Users can earn daily rewards, check their balance, transfer coins to other users, and more.

## Features

- **Virtual Currency (Dodo Coin)**
  - Check balance
  - Earn daily Dodo Coins
  - Transfer Dodo Coins between users

- **Arcade Games**
  - Rock, Paper, Scissors
  - Hangman
  - Tic-Tac-Toe
  - Trivia Quiz
  - And more!

## Commands

### General Commands

- `/help` - Displays the list of available commands
- `/balance` - Check your Dodo Coin balance
- `/daily` - Receive your daily Dodo Coins
- `/transfer @user amount` - Transfer Dodo Coins to another user

### Game Commands

- `/rps` - Play Rock, Paper, Scissors
- `/hangman` - Play Hangman
- `/tictactoe` - Play Tic-Tac-Toe
- `/trivia` - Play Trivia Quiz

## Setup

### Prerequisites

- Node.js
- npm (Node Package Manager)
- MongoDB Atlas account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/Dodo-Arcade-Bot.git
   cd Dodo-Arcade-Bot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a `.env` file**

   Create a `.env` file in the root directory and add the following environment variables:

   ```env
   DISCORD_TOKEN=your-bot-token-here
   MONGODB_URI=your-mongodb-uri-here
   CLIENT_ID=your-client-id-here
   ```

4. **Deploy the commands to Discord**

   ```bash
   node deploy-commands.js
   ```

5. **Run the bot**

   ```bash
   npm start
   ```

## MongoDB Setup

1. **Create a MongoDB cluster**

   Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a new cluster.

2. **Get your connection string**

   In the MongoDB Atlas dashboard, get your connection string and replace `<username>`, `<password>`, and `<cluster-url>` with your actual MongoDB credentials.

3. **Update the `.env` file**

   Update your `.env` file with the MongoDB URI:

   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/dodo_arcade_bot_db?retryWrites=true&w=majority
   ```

## Usage

- **Check Balance**

  ```bash
  /balance
  ```

- **Get Daily Dodo Coins**

  ```bash
  /daily
  ```

- **Transfer Dodo Coins**

  ```bash
  /transfer @user amount
  ```

- **Play Games**

  Use the game commands like `/rps`, `/hangman`, `/tictactoe`, and `/trivia` to play games with the bot.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.

## License

This project is licensed under the MIT License.
