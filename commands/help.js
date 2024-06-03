const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List all commands'),
    async execute(interaction) {
        console.log('Executing help command...');
        const commands = interaction.client.commands.map(command => command.data.name).join('\n');
        await interaction.reply(`Available commands:\n${commands}`);
    },
};
