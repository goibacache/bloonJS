const { SlashCommandBuilder } = require('discord.js')
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

module.exports = {
	cooldown: 15,
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription(`Shows the available command list, only for you ;)`),
	async execute(interaction) {
		try{
			console.log(`\nhelp.js: ${interaction.member.id}`);
			const helpEmbed = bloonUtils.createHelpEmbed();
			await interaction.reply({ embeds: [helpEmbed], ephemeral: true});
		}catch(error){
			await interaction.reply({ content: `There was an error in the /help command, sorry.`, ephemeral: true});
			console.error(`\nError in help.js for ID ${interaction.member.id}: ` + error);
		}
	},
};