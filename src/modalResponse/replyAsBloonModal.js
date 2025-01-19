const bloonUtils        = require('../utils/utils.js');
const config            = bloonUtils.getConfig();
/**
  * @typedef {import('discord.js').ModalSubmitInteraction} ModalSubmitInteraction
  * @typedef {import('discord.js').Message} Message
  * @typedef {import('discord.js').Channel} Channel
 */

const customId = 'replyAsBloon';

module.exports = {
    from: 'moderationReplyAsBloon.js',
    customId: customId,
    /**
	 * Executes the action
	 * @param {ModalSubmitInteraction} interaction
	 */
    async execute(interaction, interactionCustomId) {
        try {
            // Defer reply
            await interaction.deferReply({ ephemeral: true });

            // Get data from the custom id
            const   interactionParts    = interactionCustomId.split('/');

            const   guildId             = interactionParts[1];
            const   channelId           = interactionParts[2];
            const   messageId           = interactionParts[3];
            const   replyDirectly       = interactionParts[4] == "true";

            // console.log(`Modal submit ${customId}.\nGuild: ${guildId}. Channel: ${channelId}.\nBy user ${interaction.user.tag}`);

            // Get data from the text field
            const reply = interaction.fields.getTextInputValue('reply');

            const guild = await interaction.client.guilds.fetch(guildId);
			const channel = await guild.channels.fetch(channelId);

            // If it replies directly, takes the message and replies to it. If not, then it just creates a new message.
            if (replyDirectly){
                const message = await channel.messages.fetch(messageId);
                await message.reply(reply.replace(/"/g, ""));
            }else{
                await channel.send(reply.replace(/"/g, ""));
            }

            await interaction.deleteReply();

            // Generate log in #server-logs
            const textDecorator = '```';
            const messages = [];

			const maxSize = 1500;
			// Check for total content length. If its length is over ~1500 split message into various ones.
			if (reply.length > maxSize) {
				messages.push(`🎈 New Bloon message from <@${interaction.user.id}> (${interaction.user.username}) in <#${channelId}>`);
                for (let i = 0; i < Math.ceil(reply.length/1500); i++) {
                    const from    = (i)     * 1500;
                    const to      = (i+1)   * 1500;
                    messages.push(`${i == 0 ? '_Bloon message_' : '_Bloon message (cont)_'}:${textDecorator}${reply.substring(from, to)}${textDecorator}`);
                }
            }else{
                messages.push(`🎈 New Bloon message from <@${interaction.user.id}> (${interaction.user.username}) in <#${channelId}>`);
				messages.push(`_Bloon message_:${textDecorator}${reply}${textDecorator}`);
            }

            const bloonServerLogs = await guild.channels.fetch(config.bloonServerLogs);
            messages.forEach(async message => {
                await bloonServerLogs.send({ content: message, allowedMentions: { parse: [] }});
            });
        } catch (error) {
            console.log(`⚠ Error in ${customId}: ${error}`);
            const answer = { content: `There was an error in ${customId}.\nError: ${error}`, components: [], embeds: [] };
			
			if (interaction.deferred && !interaction.replied) {
                await interaction.editReply(answer);
            } else if (interaction.deferred && interaction.replied) {
                await interaction.followUp(answer);
            } else {
                await interaction.reply(answer);
            }
        }
    }
};