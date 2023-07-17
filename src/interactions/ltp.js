const { SlashCommandBuilder } = require('discord.js')
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('ltp')
		.setDescription(`Assigns or removes the "Looking to play" role`),
	async execute(interaction) {
		try{
			console.log(`\nltp.js: ${interaction.member.id}`);

			const 	member  	= interaction.guild.members.cache.get(interaction.member.id);  // Get current member
			const 	ltpRole 	= await interaction.guild.roles.fetch(config.role_LookingToPlay);
			const 	npRole  	= await interaction.guild.roles.fetch(config.role_NowPlaying);
			let 	action 		= "assigned";

			// Check if the user already has "looking to play"
			if (member.roles.cache.some(role => role.id === config.role_LookingToPlay || role.id === config.role_NowPlaying)){
				await member.roles.remove(ltpRole);   		// Remove
				await member.roles.remove(npRole);    		// Remove
				action = "removed";
			}else{
				await member.roles.add(ltpRole);      		// Add
			}
			interaction.reply( { content: `Your "Looking to play" role has been ${action}`, ephemeral: true} );  	// Reply
		}catch(error){
			console.log(`Error assigning Looking to play role to ${interaction.member.id}: ${error}`)
			interaction.reply({ content: `Error assigning role: ${error}`, ephemeral: true })
		}
	},
};