const { SlashCommandBuilder } = require('discord.js')
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

module.exports = {
    public: false,
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('gameclub')
		.setDescription(`Assigns or removes the "Game Club" role so you can discuss some cool games with cool people 😎`),
	async execute(interaction) {
		try{
			console.log(`\ngameclub.js: ${interaction.member.id}`);

			await interaction.deferReply({ ephemeral: true }); // This makes it so it can take more than 3 seconds to reply.

			const 	member  		= interaction.guild.members.cache.get(interaction.member.id);  // Get current member
			const 	gameClubRole 	= await interaction.guild.roles.fetch(config.role_GameClub);
			let 	action 			= "assigned";

			// Check if the user already has "looking to play"
			if (member.roles.cache.some(role => role.id === config.role_GameClub)){
				await member.roles.remove(gameClubRole);   		// Remove
				action = "removed";
			}else{
				// Check if the person is playing the game!
				await member.roles.add(gameClubRole);      		// Add
			}
			await interaction.editReply( { content: `Your "Game Club" role has been ${action}`, ephemeral: true} );  	// Reply
		}catch(error){
			const answer = { content: `Error assigning role: ${error}`, ephemeral: true };
			
			if (interaction.deferred && !interaction.replied) {
                await interaction.editReply(answer);
            } else if (interaction.deferred && interaction.replied) {
                await interaction.followUp(answer);
            } else {
                await interaction.reply(answer);
            }

			console.log(`Error assigning Game Club role to ${interaction.member.id}: ${error}`)
		}
	},
};