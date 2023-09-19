const { Events } = require('discord.js');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

const evnt = {
    name: Events.MessageReactionAdd,
	async execute(reaction, user) {
		try{
			if (reaction.message.id == config.newsSubscribeMessageId){
				console.log(`News message reacted ${user.id}`);

				const   member      = reaction.message.guild.members.cache.get(user.id);  // Get current member
				const   newsRole    = await reaction.message.guild.roles.fetch(config.role_News);
				if (!member.roles.cache.some(role => role.id === config.role_News)){
					await member.roles.add(newsRole);      // Add
				}
			}			
		}catch(error){
			console.error("Error in messageReactionAdd.js: " + error);
		}
	},
};

module.exports = {
	evnt
}