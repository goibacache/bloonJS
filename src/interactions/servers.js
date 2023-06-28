import { SlashCommandBuilder } from 'discord.js';

export const cmd = {
	data: new SlashCommandBuilder()
		.setName('servers')
		.setDescription(`Provides information about Intruder's servers.`),
	async execute(interaction) {
		// interaction.guild is the object representing the Guild in which the command was run
		await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
	},
};