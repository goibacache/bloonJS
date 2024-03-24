const bloonUtils        = require('../utils/utils.js');
const config            = bloonUtils.getConfig();
const storedProcedures  = require('../utils/storedProcedures.js');

/**
  * @typedef {import('discord.js').ModalSubmitInteraction} ModalSubmitInteraction
  * @typedef {import('discord.js').Message} Message
  * @typedef {import('discord.js').Channel} Channel
 */

const customId = 'noteModal';

module.exports = {
    from: 'noteContextMenuMessage.js & noteContextMenuUser.js',
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
            const   selectedUserId      = interactionParts[4];

            // Various returns
            let DMsent = false; // No DM on notes.
            let messageDeleted = false;
            let sentInEvidence = false;
            let savedInDatabase = false;
            let fullMessage = '';

            /**
             * Is the action being done on a message or on an user?
             */
            const isMessageAction = messageId != 0;

            console.log(`Modal submit ${customId}.\nGuild: ${guildId}. Channel: ${channelId}. Message: ${messageId}. UserId: ${selectedUserId}\nBy user ${interaction.user.tag}`);

            // Get data from the text field
            const noteText = interaction.fields.getTextInputValue('noteText');

            // Store in database and create the embed
            const action                    = bloonUtils.moderationActions.Note;
            /**
             * The user
             * @type {User}
             */
            const userToBeActedUpon         = await interaction.member.guild.members.fetch(selectedUserId)
                                                .catch(() => {
                                                    throw `Couldn't find that user on this server.`;
                                                });
            const caseID                    = await storedProcedures.moderationAction_GetNewId(action);
            const moderationActionChannel   = await interaction.member.guild.channels.fetch(config.moderationActionsChannel);
            const actionEmbed               = bloonUtils.createModerationActionEmbed(action, userToBeActedUpon, caseID, noteText, interaction.member, null, DMsent);
            
            if (caseID == 0) {
                await interaction.editReply({ content: `Couldn't save ${action.name} in database.`, components: [] });
                return;
            }

            if (isMessageAction){
                /**
                 * The message
                 * @type {Message}
                 */
                const message = await interaction.client.channels.cache.get(channelId).messages.fetch(messageId);
                fullMessage = bloonUtils.getTextAndAttachmentsFromMessage(message);
                messageDeleted = await message.delete()
                .then(() => true)
                .catch((error) => {
                    console.log(`Error while deleting message: ${error}`);
                    return false;
                });
            }

            // Save it on the database
            savedInDatabase = await storedProcedures.moderationAction_Insert(action, selectedUserId, noteText, interaction.member.id, fullMessage)
                .then(() => true)
                .catch((error) => {
                    console.log(`Error while saving in database: ${error}`);
                    return false;
                });

            // Write the moderation action in the chat to log it in the database
            sentInEvidence = await moderationActionChannel.send({ embeds: [actionEmbed]})
                .then(() => true)
                .catch((error) => {
                    console.log(`Error while sending to the evidence channel: ${error}`);
                    return false;
                });

            const line1 = isMessageAction ? messageDeleted ? `\n✅ Message deleted` : `\n❌ Message couldn't be deleted` : '';
            const line2 = sentInEvidence ? `\n✅ Evidence sent` : `\n❌ Couldn't send the evidence`;
            const line3 = savedInDatabase ? `\n✅ Saved in database` : ` \n❌ Couldn't be saved in database`;

            await interaction.editReply({
                content: line1 + line2 + line3
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