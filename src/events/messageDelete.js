const { Events } = require('discord.js');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

const evnt = {
    name: Events.MessageDelete,
	async execute(message) {
		try{
			if (message.content == null) return; // Just a stupid fix for when the bot was not present

			const textDecorator = "```";
			
			const channel = message.guild.channels.cache.get(config.bloonServerLogs);
			await channel.send({ content: `🧹 New deletion by <@${message.author.id}> in <#${message.channelId}> \ndeleted message:\n${textDecorator}${message.content}${textDecorator}`, allowedMentions: { parse: [] }});
		}catch(error){
			console.error("Error in messageDelete.js: " + error);
		}
	},
};

module.exports = {
	evnt
}