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
			try{
                const   member      = interaction.guild.members.cache.get(interaction.member.id);  // Get current member
                const   pugRole     = await interaction.guild.roles.fetch(config.role_Pug);
                let 	action 		= "assigned";

                // Check if the user already has "PUG Player"
                if (member.roles.cache.some(role => role.id === config.role_Pug)){
                    await member.roles.remove(pugRole);   // Remove
                    action = "removed";
                }else{
                    await member.roles.add(pugRole);      // Add
                }
                interaction.reply( { content: `Your "PUG Players" role has been ${action}`, ephemeral: true} );  	// Reply
            }catch(error){
                console.log(`Error assigning PUG Players role to ${interaction.member.id}: ${error}`)
                interaction.reply({ content: `Error assigning role: ${error}`, ephemeral: true })
            }
		}catch(error){
            await interaction.reply({ content: 'There was an error in /pug, sorry.', ephemeral: true });
			console.error(`\nError in pug.js for ID ${interaction.member.id}: ` + error);
		}
	},
};