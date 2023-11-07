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

			const textDecorator = "```";

			const msg = `${textDecorator}${message.content.length > 0 ? bloonUtils.deleteCodeBlocksFromText(message.content) : " "}${textDecorator}`;

			// Attached files:
			let attachments = "";
			if (message.attachments.size > 0){
				attachments += `_Attachments_:\n`;
			}
			message.attachments.forEach((attachment) => {
				attachments += `[${attachment.name}](<${attachment.url}>)	`
			});

			const channel = message.guild.channels.cache.get(config.bloonServerLogs);
			await channel.send({ content: `🧹 New deletion ${wasItAMod}of message by <@${message.author.id}> (${message.author.username}) in <#${message.channelId}> \n\n_Deleted message_:\n${msg}${attachments}`, allowedMentions: { parse: [] }});
		}catch(error){
			console.error("Error in messageDelete.js: " + error);
		}
	},
};

module.exports = {
	evnt
}