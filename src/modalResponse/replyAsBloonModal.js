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
            // const   messageId           = interactionParts[3];
            // const   selectedUserId      = interactionParts[4];

            console.log(`Modal submit ${customId}.\nGuild: ${guildId}. Channel: ${channelId}.\nBy user ${interaction.user.tag}`);

            // Get data from the text field
            const reply = interaction.fields.getTextInputValue('reply');

            const guild = await interaction.client.guilds.fetch(guildId);
			const channel = await guild.channels.fetch(channelId);
			console.log("sending text: " + reply.replace(/"/g, ""));
			await channel.send(reply.replace(/"/g, ""));

            await interaction.deleteReply();
            
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