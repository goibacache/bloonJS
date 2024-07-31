// eslint-disable-next-line no-unused-vars
const { Events, Message } = require('discord.js');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

const evnt = {
    name: Events.MessageUpdate,
	/**
	 * 
	 * @param {Message} oldMessage 
	 * @param {Message} newMessage 
	 * @returns 
	 */
	async execute(oldMessage, newMessage) {
		try{
			if (oldMessage == null) console.log(`Old message was null`);
			if (newMessage == null) console.log(`New message was null`);
			if (oldMessage.partial) oldMessage = await oldMessage.fetch();
			if (newMessage.partial) newMessage = await newMessage.fetch();
			if (newMessage.author.bot) return;
			if (!newMessage.editedAt) return;
			if (newMessage.guildId != config.bloonGuildId) return;
			if (oldMessage == null || newMessage == null) return;

			console.log(`Message updated: ${oldMessage.content} -> ${newMessage.content}`);
			
			const messageLink = newMessage.url;

			const textDecorator = "```";
			const oldMessageText = `${oldMessage.content.length > 0 ? bloonUtils.deleteCodeBlocksFromText(oldMessage.content) : " "}`;
			const newMessageText = `${newMessage.content.length > 0 ? bloonUtils.deleteCodeBlocksFromText(newMessage.content) : " "}`;

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

			const maxSize = 1500;
			// Check for total content length. If its length is over ~1500 split message into various ones.
			const channel = newMessage.guild.channels.cache.get(config.bloonServerLogs);
			if (oldMessageText.length > maxSize || newMessageText.length > maxSize || ((oldMessageText.length + newMessageText.length) > maxSize)){
				const messages = [];
				messages.push(`📝 New edit by <@${newMessage.author.id}> (${newMessage.author.username}) in ${messageLink}`);

				// TODO: if it's just images (no text) don't add the textDecorator
				if (oldMessageText.length + oldAttachments.length > maxSize){
					messages.push(`_Old message:_${textDecorator}${oldMessageText.substring(0, maxSize)}${textDecorator}`);
					messages.push(`_Old message (cont):_${textDecorator}${oldMessageText.substring(maxSize, oldMessageText.length)}${textDecorator}${oldAttachments}`);
				}else{
					messages.push(`_Old message:_${textDecorator}${oldMessageText}${textDecorator}${oldAttachments}`);
				}

				if (newMessageText.length + newAttachments.length > maxSize){
					messages.push(`_New message:_${textDecorator}${newMessageText.substring(0, maxSize)}${textDecorator}`);
					messages.push(`_New message (cont):_${textDecorator}${newMessageText.substring(maxSize, newMessageText.length)}${textDecorator}${newAttachments}`);
				}else{
					messages.push(`_New message:_${textDecorator}${newMessageText}${textDecorator}${newAttachments}`);
				}
				
				messages.forEach(async message => {
					await channel.send({ content: message, allowedMentions: { parse: [] }});
				});
			}else{
				// Send normal message with no splits
				await channel.send({ content: `📝 New edit by <@${newMessage.author.id}> (${newMessage.author.username}) in ${messageLink} \n_Old message:_${textDecorator}${oldMessageText}${textDecorator}${oldAttachments}\n_New message_:${textDecorator}${newMessageText}${textDecorator}${newAttachments}`, allowedMentions: { parse: [] }});
			}
		}catch(error){
			console.error("Error in messageUpdate.js: " + error);
		}
	},
};

module.exports = {
	evnt
}