const { SlashCommandBuilder } = require('discord.js')
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('pug')
		.setDescription(`Assigns or removes the "PUG Players" role`),
	async execute(interaction) {
        try{
            console.log(`\npug.js: ${interaction.member.id}`);

            await interaction.deferReply({ ephemeral: true }); // This makes it so it can take more than 3 seconds to reply.

            const   member      = interaction.guild.members.cache.get(interaction.member.id);  // Get current member
            const   pugRole     = await interaction.guild.roles.fetch(config.role_Pug);
            let 	action 		= "assigned";

            // Check if the user already has the "PUG Player" role
            if (member.roles.cache.some(role => role.id === config.role_Pug)){
                await member.roles.remove(pugRole);   // Remove
                action = "removed";
            }else{
                await member.roles.add(pugRole);      // Add
            }
            interaction.editReply( { content: `Your "PUG Players" role has been ${action}`, ephemeral: true} );  	// Reply
		}catch(error){
            const answer = { content: 'There was an error in /pug, sorry.', ephemeral: true };
            
			if (interaction.deferred && !interaction.replied) {
                await interaction.editReply(answer);
            } else if (interaction.deferred && interaction.replied) {
                await interaction.followUp(answer);
            } else {
                await interaction.reply(answer);
            }

			console.error(`\nError in pug.js for ID ${interaction.member.id}: ` + error);
		}
	},
};