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

			// Starts text w decoration
			const msg = textDecorator + bloonUtils.deleteCodeBlocksFromText(message.content) + textDecorator;

			// Attached files:
			let attachments = "";
			message.attachments.forEach((attachment) => {
				attachments += `[${attachment.name}](<${attachment.url}>)	`
			});

			const channel = message.guild.channels.cache.get(config.bloonServerLogs);
			await channel.send({ content: `🧹 New deletion by <@${message.author.id}> (${message.author.username}) in <#${message.channelId}> \n\n_Deleted message_:\n${msg}\n_Attachments_: \n${attachments}`, allowedMentions: { parse: [] }});
		}catch(error){
			console.error("Error in messageDelete.js: " + error);
		}
	},
};

module.exports = {
	evnt
}