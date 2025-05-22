const { SlashCommandBuilder } = require('discord.js')
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

module.exports = {
    public: false,
	cooldown: 30,
	data: new SlashCommandBuilder()
		.setName('wiki')
		.setDescription('Search the wiki for a specific article')
		.addStringOption(option =>
			option
				.setName('searchterm')
				.setDescription('What are you looking for in the wiki?')
				.setRequired(true)
		),
	async execute(interaction) {
		try{
			console.log(`\nwiki.js: ${interaction.member.id}`);

			await interaction.deferReply(); // This makes it so it can take more than 3 seconds to reply.

			// sharklootgilt.superbossgames.com/wiki/
			const searchTerm = interaction.options.getString('searchterm');
			const parameters = `?action=opensearch&format=json&formatversion=2&search=${searchTerm}&namespace=0&limit=1`
			const queryUrl = `${config.wikiAPI}${parameters}`;
			const result = await bloonUtils.getHTTPResult(queryUrl);

			const wikiDoc = result[3][0]; // Oh,god.

			if (wikiDoc){
				await interaction.editReply(`${wikiDoc}`);	
			}else{
				await interaction.editReply({ content: `Nothing was found under ${searchTerm}. Remember that the search is case sensitive.` });
			}
		}catch(error){
			const answer = { content: 'There was an error in /servers, sorry.' };
            
			if (interaction.deferred && !interaction.replied) {
                await interaction.editReply(answer);
            } else if (interaction.deferred && interaction.replied) {
                await interaction.followUp(answer);
            } else {
                await interaction.reply(answer);
            }

			console.error(`\nError in wiki.js for ID ${interaction.member.id}: ` + error);
		}
	},
};