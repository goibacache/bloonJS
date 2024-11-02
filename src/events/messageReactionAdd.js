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

			// Is this message in a moderation thread?
			const channelName = reaction.message.channel.name;
			if (channelName.toLowerCase().includes("moderation for user id: ")){
				const moderatedPerson = channelName.substring(24); // removes "Moderation for User ID: "

				const userWhoReacted = await reaction.message.guild.members.fetch(user);
				const isMod = userWhoReacted.roles.cache.filter(x => x == config.role_Mod).size > 0;

				if (!(isMod || reaction.users.cache.some(x => x == moderatedPerson))){ // Not the moderated person, not a bot (bloon) and not a mod.
					await reaction.users.remove(user.id);
					//console.log(`Non allowed person added reaction on ${channelName}, deleting.`);
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