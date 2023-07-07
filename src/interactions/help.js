const { SlashCommandBuilder } = require('discord.js')
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription(`Shows the available command list, only for you ;)`),
	async execute(interaction) {
		try{
			const helpEmbed = bloonUtils.createHelpEmbed();
			await interaction.reply({ embeds: [helpEmbed], ephemeral: true});
		}catch(error){
			console.error("\nError in Servers.js: " + error);
		}
	},
};