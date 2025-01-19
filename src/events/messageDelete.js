const { Events, AuditLogEvent } = require('discord.js');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

const evnt = {
    name: Events.MessageDelete,
	async execute(message) {
		try{
			if (message.guildId != config.bloonGuildId) return;
			if (message.author?.bot) return;
			if (message.content == null) return; // Just a stupid fix for when the bot was not present

			console.log("Message id " + message.id + " deleted:", message.content);

			// Fetch a couple audit logs than just one as new entries could've been added right after this event was emitted.
			const fetchedLogs = await message.guild.fetchAuditLogs({
				limit: 6,
				type: AuditLogEvent.MessageDelete
			}).catch(console.error);

			const auditEntry = fetchedLogs.entries.find(a =>
				// Small filter function to make use of the little discord provides to narrow down the correct audit entry.
				a.target.id === message.author.id &&
				a.extra.channel.id === message.channel.id &&
				// Ignore entries that are older than 20 seconds to reduce false positives.
				Date.now() - a.createdTimestamp < 20000
			);

			let modUser = null;
			// If entry exists, grab the user that deleted the message and display username + tag, if none, display 'Unknown'. 
			if (auditEntry != null){
				modUser = auditEntry.executor.id != auditEntry.target.id ? auditEntry.executor : null;
			}

			const wasItAMod = modUser != null ? `by third-party <@${modUser.id}> (${modUser.username}) ` : "";

			const msg = bloonUtils.deleteCodeBlocksFromText(message.content);

			// Attached files:
			let attachments = "";
			if (message.attachments.size > 0){
				attachments += `_Attachments_:\n`;
			}
			message.attachments.forEach((attachment) => {
				attachments += `[${attachment.name}](<${attachment.proxyURL}>)	`
			});

			const channel = message.guild.channels.cache.get(config.bloonServerLogs);
			const deletedMessageTextLength = `${msg}${attachments}`.length;

			const textDecorator = '```';

			const maxSize = 1500;
			// Check for total content length. If its length is over ~1700 split message into various ones.
			if (deletedMessageTextLength > maxSize) {
				const messages = [];
				messages.push(`🧹 New deletion ${wasItAMod}of message by <@${message.author.id}> (${message.author.username}) in <#${message.channelId}>`);
				messages.push(`_Deleted message_:${textDecorator}${msg.substring(0, maxSize)}${textDecorator}`);
				messages.push(`_Deleted message (cont):_${textDecorator}${msg.substring(maxSize, msg.length)}${textDecorator}${attachments}`);
			
				messages.forEach(async message => {
					await channel.send({ content: message, allowedMentions: { parse: [] }});
				});
			}else{
				// Send normal message with no splits
				await channel.send({ content: `🧹 New deletion ${wasItAMod}of message by <@${message.author.id}> (${message.author.username}) in <#${message.channelId}> \n\n_Deleted message_:\n${textDecorator}${msg.length == 0 ? " " : msg}${textDecorator}${attachments}`, allowedMentions: { parse: [] }});
			}
		}catch(error){
			console.error("Error in messageDelete.js: " + error);
		}
	},
};

module.exports = {
	evnt
}