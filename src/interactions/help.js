const { SlashCommandBuilder } = require('discord.js')
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
	cooldown: 15,
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription(`Shows the available command list, only for you ;)`),
	async execute(interaction) {
		try{
			console.log(`\nhelp.js: ${interaction.member.id}`);

			await interaction.deferReply({ ephemeral: true }); // This makes it so it can take more than 3 seconds to reply.
			
			const helpEmbed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle(`Bloon commands`)
			.setTimestamp();
		
			helpEmbed.addFields(
				{ name: '/news',                        value: 'add yourself to the "News" role so you can be notified when something important is going on!' },
				{ name: '/ltp',                         value: 'add yourself to the "Looking to play" role so you can be notified when a new server is up!' },
				{ name: '/pug',                         value: 'add yourself to the "Pick up games" role so you can be notified when new PUG game is being set up!' },
				{ name: '/wiki',                        value: 'search directly in the wiki for a specified article, if found, it will be posted as an answer for everyone to see!' },
				{ name: '/help',                        value: 'shows this message so you know which commands are available!' },
				{ name: '/servers',                     value: 'list the top 10 servers available in the game!' },
				{ name: '/playerstats',                 value: 'see your intruder stats!' },
			);

			await interaction.editReply({ embeds: [helpEmbed], ephemeral: true});
		}catch(error){
			const answer = { content: `There was an error in the /help command, sorry.`, ephemeral: true};
			
			if (interaction.deferred && !interaction.replied) {
                await interaction.editReply(answer);
            } else if (interaction.deferred && interaction.replied) {
                await interaction.followUp(answer);
            } else {
                await interaction.reply(answer);
            }
			
			console.error(`\nError in help.js for ID ${interaction.member.id}: ` + error);
		}
	},
};