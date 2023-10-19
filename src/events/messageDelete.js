const { Events } = require('discord.js');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

const evnt = {
    name: Events.MessageDelete,
	async execute(message) {
		try{
			if (message.guildId != config.bloonGuildId) return;
			if (message.author?.bot) return;
			if (message.content == null) return; // Just a stupid fix for when the bot was not present

			console.log("Message deleted:", message.content);

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
			await channel.send({ content: `🧹 New deletion by <@${message.author.id}> (${message.author.username}) in <#${message.channelId}> \n\n_Deleted message_:\n${msg}${attachments}`, allowedMentions: { parse: [] }});
		}catch(error){
			console.error("Error in messageDelete.js: " + error);
		}
	},
};

module.exports = {
	evnt
}