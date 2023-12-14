const { Events, messageLink } = require('discord.js');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

const evnt = {
    name: Events.MessageUpdate,
	async execute(oldMessage, newMessage) {
		try{
			if (newMessage.author.bot) return;
			if (!newMessage.editedAt) return;
			if (newMessage.guildId != config.bloonGuildId) return;
			if (oldMessage.partial) oldMessage = await oldMessage.fetch();
			if (newMessage.partial) newMessage = await newMessage.fetch();
			if (oldMessage == null || newMessage == null) return;
			if (oldMessage.content == newMessage.content) return; // Just a stupid fix for when the bot was not present

			//console.log(oldMessage);
			console.log(`Message updated: ${oldMessage.content} -> ${newMessage.content}`);

			const messageLink = `https://discord.com/channels/${newMessage.guildId}/${newMessage.channelId}/${newMessage.id}`;

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

			// Check for total content length. If its length is over ~1700 split message into various ones.
			const channel = newMessage.guild.channels.cache.get(config.bloonServerLogs);
			if (oldMessageText.length > 1500 || newMessageText.length > 1500 || ((oldMessageText.length + newMessageText.length) > 1700)){
				const messages = [];
				messages.push(`📝 New edit by <@${newMessage.author.id}> (${newMessage.author.username}) in ${messageLink}`);

				if (oldMessageText.length > 1700){
					messages.push(`_Old message:_${textDecorator}${oldMessageText.substring(0, 1700)}${textDecorator}$`);
					messages.push(`_Old message (cont):_${textDecorator}${oldMessageText.substring(1700, oldMessageText.length)}${textDecorator}${oldAttachments}`);
				}else{
					messages.push(`_Old message:_${textDecorator}${oldMessageText}${textDecorator}${oldAttachments}`);
				}

				if (newMessageText.length > 1700){
					messages.push(`_New message:_${textDecorator}${newMessageText.substring(0, 1700)}${textDecorator}`);
					messages.push(`_New message (cont):_${textDecorator}${newMessageText.substring(1700, newMessageText.length)}${textDecorator}${newAttachments}`);
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