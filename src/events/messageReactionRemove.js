const { Events } = require('discord.js');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

const evnt = {
    name: Events.MessageReactionRemove,
	async execute(reaction, user) {
		try{
			if (reaction.message.id == config.newsSubscribeMessageId){
				console.log(`News message un-reacted ${user.id}`);

				const   member      = reaction.message.guild.members.cache.get(user.id);  // Get current member
				const   newsRole    = await reaction.message.guild.roles.fetch(config.role_News);
				if (member.roles.cache.some(role => role.id === config.role_News)){
					await member.roles.remove(newsRole);   // Remove
				}
			}			
		}catch(error){
			console.error("Error in messageReactionRemove.js: " + error);
		}
	},
};

module.exports = {
	evnt
}