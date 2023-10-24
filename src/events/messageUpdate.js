const { Events, messageLink } = require('discord.js');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

const evnt = {
    name: Events.MessageUpdate,
	async execute(oldMessage, newMessage) {
		try{
			if (newMessage.guildId != config.bloonGuildId) return;
			if (oldMessage.partial) oldMessage = await oldMessage.fetch();
			if (newMessage.partial) newMessage = await newMessage.fetch();
			if (newMessage.author.bot) return;
			if (!newMessage.editedAt) return;
			if (oldMessage.content == newMessage.content) return; // Just a stupid fix for when the bot was not present

			//console.log(oldMessage);
			console.log(`Message updated: ${oldMessage.content} -> ${newMessage.content}`);

			const messageLink = `https://discord.com/channels/${newMessage.guildId}/${newMessage.channelId}/${newMessage.id}`;

			const textDecorator = "```";
			const oldMessageText = `${textDecorator}${oldMessage.content.length > 0 ? bloonUtils.deleteCodeBlocksFromText(oldMessage.content) : " "}${textDecorator}`;
			const newMessageText = `${textDecorator}${newMessage.content.length > 0 ? bloonUtils.deleteCodeBlocksFromText(newMessage.content) : " "}${textDecorator}`;

			// Attached files:
			let oldAttachments = "";

			if (oldMessage.attachments.size > 0){
				oldAttachments += `_Old message attachments_:\n`;
			}
			oldMessage.attachments.forEach((attachment) => {
				oldAttachments += `[${attachment.name}](<${attachment.url}>)	`
			});
			if (oldMessage.attachments.size > 0){
				oldAttachments += "\n";
			}

			let newAttachments = "";
			if (newMessage.attachments.size > 0){
				newAttachments += `_New message attachments_:\n`;
			}
			newMessage.attachments.forEach((attachment) => {
				newAttachments += `[${attachment.name}](<${attachment.url}>)	`
			});
			if (newMessage.attachments.size > 0){
				newAttachments += "\n";
			}

			const channel = newMessage.guild.channels.cache.get(config.bloonServerLogs);
			await channel.send({ content: `📝 New edit by <@${newMessage.author.id}> (${newMessage.author.username}) in ${messageLink} \n_Old message:_${oldMessageText}${oldAttachments}\n_New message_:${newMessageText}${newAttachments}`, allowedMentions: { parse: [] }});
		}catch(error){
			console.error("Error in messageUpdate.js: " + error);
		}
	},
};

module.exports = {
	evnt
}