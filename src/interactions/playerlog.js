const { SlashCommandBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('playerlog')
		.setDescription(`Shows the player log routes`),
		/**
		 * 
		 * @param {import('discord.js').Interaction} interaction 
		 */
	async execute(interaction) {
		try{
			console.log(`\playerlog.js: ${interaction.member.id}`);

			await interaction.reply( { content: "Windows: `%localappdata%low/SuperbossGames.com/Intruder`\nLinux: `~/.local/share/Steam/steamapps/compatdata/518150/pfx/drive_c/users/steamuser/AppData/LocalLow/SuperbossGames.com/Intruder/`\nMac: `/Users/<user>/Library/Logs/Superbossgames.com/play`", ephemeral: false} );  	// Reply
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