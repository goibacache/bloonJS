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
			try{
                const   member      = interaction.guild.members.cache.get(interaction.member.id);  // Get current member
                const   newsRole    = await interaction.guild.roles.fetch(config.role_News);
                let 	action 		= "assigned";

                // Check if the user already has "PUG Player"
                if (member.roles.cache.some(role => role.id === config.role_News)){
                    await member.roles.remove(newsRole);   // Remove
                    action = "removed";
                }else{
                    await member.roles.add(newsRole);      // Add
                }
                interaction.reply( { content: `Your "News" role has been ${action}`, ephemeral: true} );  	// Reply
            }catch(error){
                console.log(`Error assigning News Players role to ${interaction.member.id}: ${error}`)
                interaction.reply({ content: `Error assigning role: ${error}`, ephemeral: true })
            }
		}catch(error){
            await interaction.reply({ content: 'There was an error in /news, sorry.', ephemeral: true });
			console.error(`\nError in news.js for ID ${interaction.member.id}: ` + error);
		}
	},
};