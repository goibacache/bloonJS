import { SlashCommandBuilder } from 'discord.js';

export const cmd = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
		
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};