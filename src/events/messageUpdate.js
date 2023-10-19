const { Events } = require('discord.js');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

const evnt = {
    name: Events.MessageUpdate,
	async execute(oldMessage, newMessage) {
		try{
			if (oldMessage.partial) oldMessage = await oldMessage.fetch();
			if (newMessage.partial) newMessage = await newMessage.fetch();
			if (newMessage.author.bot) return;
			if (!newMessage.editedAt) return;
			if (oldMessage.content == newMessage.content) return; // Just a stupid fix for when the bot was not present

			const textDecorator = "```";

			const channel = newMessage.guild.channels.cache.get(config.bloonServerLogs);
			await channel.send({ content: `📝 New edit by <@${newMessage.author.id}> in <#${newMessage.channelId}> \nold message:\n${textDecorator}${oldMessage.content}${textDecorator}new message:\n${textDecorator}${newMessage.content}${textDecorator}`, allowedMentions: { parse: [] }});
		}catch(error){
			console.error("Error in messageUpdate.js: " + error);
		}
	},
};

module.exports = {
	evnt
}