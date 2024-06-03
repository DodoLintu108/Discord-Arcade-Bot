const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../models/User');

class Blackjack {
    constructor(game) {
        this.game = game;
        this.deck = this.createDeck();
        this.shuffleDeck();
    }

    createDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        let deck = [];
        for (const suit of suits) {
            for (const value of values) {
                deck.push(`${value} of ${suit}`);
            }
        }
        return deck;
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCard() {
        return this.deck.pop();
    }

    calculateHandValue(hand) {
        let value = 0;
        let aceCount = 0;
        for (const card of hand) {
            const cardValue = card.split(' ')[0];
            if (['J', 'Q', 'K'].includes(cardValue)) {
                value += 10;
            } else if (cardValue === 'A') {
                value += 11;
                aceCount++;
            } else {
                value += parseInt(cardValue);
            }
        }
        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount--;
        }
        return value;
    }

    async startGame(interaction, betAmount) {
        // Initialize player hands and dealer hand
        this.game.players = this.game.players.map(player => ({
            ...player,
            hand: [this.dealCard(), this.dealCard()],
            hasDoubled: false,
        }));
        this.game.dealerHand = [this.dealCard(), this.dealCard()];
        this.game.currentPlayer = this.game.players[0].discordId;
        this.game.gameState = 'playing';
        await this.game.save();

        await interaction.followUp({
            content: `**Blackjack game started!**\n\n**Dealer's Hand:** ${this.game.dealerHand[0]}, ???\n**Players:**\n${this.getPlayersStatus()}`,
            components: this.getActionButtons(),
        });
    }

    getPlayersStatus() {
        return this.game.players.map(player => {
            const handValue = this.calculateHandValue(player.hand);
            return `**<@${player.discordId}>**: ${player.hand.join(', ')} (Value: ${handValue})`;
        }).join('\n');
    }

    getActionButtons() {
        return [
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId(`hit_${this.game.gameId}`).setLabel('Hit').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`stand_${this.game.gameId}`).setLabel('Stand').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`double_${this.game.gameId}`).setLabel('Double Down').setStyle(ButtonStyle.Success),
                )
        ];
    }

    async handleAction(interaction, action) {
        const player = this.game.players.find(p => p.discordId === interaction.user.id);
        if (!player) {
            await interaction.reply({ content: 'You are not a part of this game.', ephemeral: true });
            return;
        }
        if (this.game.currentPlayer !== interaction.user.id) {
            await interaction.reply({ content: 'It is not your turn.', ephemeral: true });
            return;
        }

        if (action === 'hit') {
            player.hand.push(this.dealCard());
        } else if (action === 'stand') {
            this.game.currentPlayer = this.getNextPlayerId();
        } else if (action === 'double') {
            if (player.hasDoubled) {
                await interaction.reply({ content: 'You can only double down once.', ephemeral: true });
                return;
            }
            player.hand.push(this.dealCard());
            player.bet *= 2;
            player.hasDoubled = true;
        }

        const handValue = this.calculateHandValue(player.hand);
        if (handValue > 21) {
            this.game.currentPlayer = this.getNextPlayerId();
        }

        await this.game.save();
        await interaction.update({
            content: `**Dealer's Hand:** ${this.game.dealerHand[0]}, ???\n**Players:**\n${this.getPlayersStatus()}`,
            components: this.game.currentPlayer !== 'dealer' ? this.getActionButtons() : [],
        });

        if (this.game.currentPlayer === 'dealer') {
            await this.handleDealerTurn(interaction);
        }
    }

    getNextPlayerId() {
        const currentIndex = this.game.players.findIndex(p => p.discordId === this.game.currentPlayer);
        if (currentIndex === this.game.players.length - 1) {
            return 'dealer';
        }
        return this.game.players[currentIndex + 1].discordId;
    }

    async handleDealerTurn(interaction) {
        while (this.calculateHandValue(this.game.dealerHand) < 17) {
            this.game.dealerHand.push(this.dealCard());
        }

        await this.game.save();

        // Determine winners and update player balances
        const dealerValue = this.calculateHandValue(this.game.dealerHand);
        let results = `**Dealer's Hand:** ${this.game.dealerHand.join(', ')} (Value: ${dealerValue})\n**Players:**\n`;

        for (const player of this.game.players) {
            const playerValue = this.calculateHandValue(player.hand);
            const playerUser = await User.findOne({ discordId: player.discordId });

            if (playerValue > 21 || (dealerValue <= 21 && dealerValue >= playerValue)) {
                // Player loses
                results += `<@${player.discordId}> loses with ${player.hand.join(', ')} (Value: ${playerValue})\n`;
                playerUser.coins -= player.bet;
            } else {
                // Player wins
                results += `<@${player.discordId}> wins with ${player.hand.join(', ')} (Value: ${playerValue})\n`;
                playerUser.coins += player.bet;
            }

            await playerUser.save();
        }

        await interaction.followUp({ content: results });

        await this.game.deleteOne();
    }
}

module.exports = Blackjack;
