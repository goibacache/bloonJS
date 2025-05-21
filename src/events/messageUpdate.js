// eslint-disable-next-line no-unused-vars
const { Events, Message } = require('discord.js');
const bloonUtils = require('../utils/utils.js');
// eslint-disable-next-line no-unused-vars
const { ServerConfig }              = require('../interfaces/ServerConfig.js'); // Used so VSCODE can see the properties

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
			if (oldMessage == null || newMessage == null) return;

            /**
             * The server config
             * @type {ServerConfig}
             */
            const serverConfig = oldMessage.client.serverConfigs.find(x => x.ServerId == oldMessage.guild.id);
            if (!serverConfig){
                console.log(`Message Updated: No config found for guild ${oldMessage.guild.id}`);
                return;
            }

            //console.log(`Message Updated: Using config of ${serverConfig.ServerName}/(${serverConfig.ServerId})`);

			console.log(`Message updated by ${oldMessage.member.user.tag}: ${oldMessage.content} -> ${newMessage.content}`);

            if (!serverConfig.MU_LogMessageUpdates){
                console.log(`Message updated: Config is setup to not to log message updates. ${serverConfig.ServerName}/${oldMessage.member.user.tag}.`);
                return;
            }
			
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
				oldAttachments += `[${attachment.name}](<${attachment.proxyURL}>)	`
			});
			if (oldMessage.attachments.size > 0){
				oldAttachments += "\n";
			}

			let newAttachments = "";
			if (newMessage.attachments.size > 0){
				newAttachments += `_New message attachments_:\n`;
			}
			newMessage.attachments.forEach((attachment) => {
				newAttachments += `[${attachment.name}](<${attachment.proxyURL}>)	`
			});
			if (newMessage.attachments.size > 0){
				newAttachments += "\n";
			}

			const maxSize = 1500;
			// Check for total content length. If its length is over ~1500 split message into various ones.
			const channel = newMessage.guild.channels.cache.get(serverConfig.MU_ChannelToLogMessageUpdates);
			if (oldMessageText.length > maxSize || newMessageText.length > maxSize || ((oldMessageText.length + newMessageText.length) > maxSize)){
				const messages = [];
				messages.push(`📝 New edit by <@${newMessage.author.id}> (${newMessage.author.username}) in ${messageLink}`);

				// TODO: if it's just images (no text) don't add the textDecorator
				if (oldMessageText.length + oldAttachments.length > maxSize){

                    let oldMessageFormatted = oldMessageText.substring(0, maxSize);
                    if (oldMessageFormatted.length > 0){
                        oldMessageFormatted = `${textDecorator}${oldMessageFormatted}${textDecorator}`;
                    }

                    let oldMessageFormattedPartTwo = oldMessageText.substring(maxSize, oldMessageText.length);
                    if (oldMessageFormattedPartTwo.length > 0){
                        oldMessageFormattedPartTwo = `${textDecorator}${oldMessageFormattedPartTwo}${textDecorator}`;
                    }

					messages.push(`_Old message:_${oldMessageFormatted}`);
					messages.push(`_Old message (cont):_${oldMessageFormattedPartTwo}${oldAttachments}`);
				}else{
                    let oldMessageFormatted = oldMessageText;
                    if (oldMessageFormatted.length > 0){
                        oldMessageFormatted = `${textDecorator}${oldMessageFormatted}${textDecorator}`
                    }
					messages.push(`_Old message:_${oldMessageFormatted}${oldAttachments}`);
				}

				if (newMessageText.length + newAttachments.length > maxSize){

                    let newMessageFormatted = newMessageText.substring(0, maxSize);
                    if (newMessageFormatted.length > 0){
                        newMessageFormatted = `${textDecorator}${newMessageFormatted}${textDecorator}`;
                    }

                    let newMessageFormattedPartTwo = newMessageText.substring(maxSize, newMessageText.length);
                    if (newMessageFormattedPartTwo.length > 0){
                        newMessageFormattedPartTwo = `${textDecorator}${newMessageFormattedPartTwo}${textDecorator}`;
                    }

					messages.push(`_New message:_${newMessageFormatted}`);
					messages.push(`_New message (cont):_${newMessageFormattedPartTwo}${newAttachments}`);
				}else{
                    let newMessageFormatted = newMessageText;
                    if (newMessageFormatted.length > 0){
                        newMessageFormatted = `${textDecorator}${newMessageFormatted}${textDecorator}`;
                    }
					messages.push(`_New message:_${newMessageFormatted}${newAttachments}`);
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