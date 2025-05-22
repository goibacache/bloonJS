const { SlashCommandBuilder } = require('discord.js')
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

module.exports = {
    public: false,
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('howtojoinicl')
		.setDescription(`Shows you how to join ICL!`),
	async execute(interaction) {
		try{
			console.log(`\njoinICL.js: ${interaction.member.id}`);

			await interaction.deferReply({ ephemeral: true }); // This makes it so it can take more than 3 seconds to reply.

			await interaction.editReply( { content: `Hi! Glad to have you here, we always are looking for more people to join the league.\n
There's two ways to join, ask a current team to join their ranks or create your own team. If you want to go te second route these are the requirements for your team:
* Teams must have 5 or more players on their rosters
* There are up to 2 team captains per team that also count towards the player total.
* Must have a 2-4 letter call-sign (Ex. Raven Shield is "RS", Foxhound Special Forces Unit is "FSFU")
* Teams must have a clan emoji (You can choose a default emoji if needed, but not a Superboss server emoji)

If your team does not meet the criteria above, please feel free to still drop a roster in here in the hopes that you'll get up to par by the start of the season!
As long as you have 5 players (team captain counts as 1), have a name, and an emoji you're good.`, ephemeral: true} );  	// Reply
		}catch(error){
			const answer = { content: `Error in joinICL: ${error}`, ephemeral: true };
			
			if (interaction.deferred && !interaction.replied) {
                await interaction.editReply(answer);
            } else if (interaction.deferred && interaction.replied) {
                await interaction.followUp(answer);
            } else {
                await interaction.reply(answer);
            }

			console.log(`Error in joinICL ${interaction.member.id}: ${error}`)
		}
	},
};