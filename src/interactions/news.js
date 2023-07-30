const { SlashCommandBuilder } = require('discord.js')
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('news')
		.setDescription(`Toggle your subscription to the game news!`),
	async execute(interaction) {
		try{
            console.log(`\nnews.js: ${interaction.member.id}`);

            await interaction.deferReply({ ephemeral: true }); // This makes it so it can take more than 3 seconds to reply.

            const   member      = interaction.guild.members.cache.get(interaction.member.id);  // Get current member
            const   newsRole    = await interaction.guild.roles.fetch(config.role_News);
            let 	action 		= "assigned";

            // Check if the user already has the "News" role
            if (member.roles.cache.some(role => role.id === config.role_News)){
                await member.roles.remove(newsRole);   // Remove
                action = "removed";
            }else{
                await member.roles.add(newsRole);      // Add
            }
            interaction.editReply( { content: `Your "News" role has been ${action}`, ephemeral: true} );  	// Reply
		}catch(error){
            await interaction.editReply({ content: 'There was an error in /news, sorry.', ephemeral: true });
			console.error(`\nError in news.js for ID ${interaction.member.id}: ` + error);
		}
	},
};