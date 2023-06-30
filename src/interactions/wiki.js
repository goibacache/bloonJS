const { SlashCommandBuilder } = require('discord.js')
const bloonUtils = require('../utils/utils.js');
const config = require('../config.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wiki')
		.setDescription('Search the wiki for an specified article')
		.addStringOption(option =>
			option
				.setName('searchterm')
				.setDescription('What are you looking for in the wiki?')
				.setRequired(true)
		),
	async execute(interaction) {
		// sharklootgilt.superbossgames.com/wiki/
		const searchTerm = interaction.options.getString('searchterm');
		const parameters = `?action=opensearch&format=json&formatversion=2&search=${searchTerm}&namespace=0&limit=10`
		const queryUrl = `${config.wikiAPI}${parameters}`;
		const result = await bloonUtils.getHHTPResult(queryUrl);

		const wikiDoc = result[3][0]; // Oh,god.

		if (wikiDoc){
			await interaction.reply(`${wikiDoc}`);	
		}else{
			await interaction.reply({ content: `Nothing was found under ${searchTerm}`, ephemeral: true });
		}
	},
};