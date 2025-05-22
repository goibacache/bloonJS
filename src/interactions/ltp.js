const { SlashCommandBuilder } = require('discord.js')
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

module.exports = {
    public: false,
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('ltp')
		.setDescription(`Assigns or removes the "Looking to play" role`),
	async execute(interaction) {
		try{
			console.log(`\nltp.js: ${interaction.member.id}`);

			await interaction.deferReply({ ephemeral: true }); // This makes it so it can take more than 3 seconds to reply.

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
				// Check if the person is playing the game!
				await member.roles.add(ltpRole);      		// Add
			}
			await interaction.editReply( { content: `Your "Looking to play" role has been ${action}`, ephemeral: true} );  	// Reply
		}catch(error){
            const answer = { content: `Error assigning role: ${error}`, ephemeral: true };
			
			if (interaction.deferred && !interaction.replied) {
                await interaction.editReply(answer);
            } else if (interaction.deferred && interaction.replied) {
                await interaction.followUp(answer);
            } else {
                await interaction.reply(answer);
            }

			console.log(`Error assigning Looking to play role to ${interaction.member.id}: ${error}`);
		}
	},
};