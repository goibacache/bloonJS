const bloonUtils        = require('../utils/utils.js');
const config            = bloonUtils.getConfig();
const storedProcedures  = require('../utils/storedProcedures.js');

/**
  * @typedef {import('discord.js').ModalSubmitInteraction} ModalSubmitInteraction
  * @typedef {import('discord.js').Message} Message
  * @typedef {import('discord.js').Channel} Channel
  * @typedef {import('discord.js').User} User
 */

const customId = 'timeoutModal';

module.exports = {
    from: 'timeoutContextMenuMessage.js & timeoutContextMenuUser.js',
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
            let DMsent = false;
            let userTimedOut = false;
            let messageDeleted = false;
            let sentInEvidence = false;
            let threadCreated = false;
            let savedInDatabase = false;
            let fullMessage = '';

            console.log(`Modal submit ${customId}.\nGuild: ${guildId}. Channel: ${channelId}. Message: ${messageId}. UserId: ${selectedUserId}\nBy user ${interaction.user.tag}`);

            // Get data from the text field
            const noteText = interaction.fields.getTextInputValue('noteText');
            const timeoutText = interaction.fields.getTextInputValue('timeoutText');

            if (isNaN(timeoutText)){
                await interaction.editReply({ content: `Time out text must be a valid number.` });
                return;
            }

            //timeout max: 40320
            if (parseInt(timeoutText) > 40320 || parseInt(timeoutText) < 1){
                await interaction.editReply({ content: `Time out time must be a number between 1 and 40320 minutes.` });
                return;
            }

            /**
             * Is the action being done on a message or on a user?
             */
            const isMessageAction = messageId != 0;

            // Store in database and create the embed
            const action                    = bloonUtils.moderationActions.Timeout;
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
            
            if (caseID == 0) {
                await interaction.editReply({ content: `Couldn't save ${action.name} in database.`, components: [] });
                return;
            }

            // Action
            userTimedOut = await userToBeActedUpon.timeout(parseInt(timeoutText) * 60 * 1000)
                .then(() => true)
                .catch((error) => {
                    console.log(`Error while timing out user: ${error}`);
                    return false;
                });

            // DM
            DMsent = await userToBeActedUpon.send({content: `You have been timed out from Superboss' Discord server for the following reason: ${noteText}\nPlease do not reply this message as we're not able to see it and remember that continuously breaking the server rules will result in either a kick or a ban`})
                .then(() => true)
                .catch((error) => {
                    console.log(`Error while sending DM: ${error}`);
                    return false;
                });

            // Thread
            const thread = await bloonUtils.createOrFindModerationActionThread(interaction.client, `Moderation for User ID: ${selectedUserId}`);

            if (thread){
                threadCreated = true;
                // "Loading" message
                const firstThreadMessage = await thread.send({ content: `Hey <@${userToBeActedUpon.id}>\n...` });
                // Edit the message and mention all of the roles that should be included.
                await firstThreadMessage.edit({ content: `Hey <@${userToBeActedUpon.id}>\nSummoning: <@&${config.role_Aug}> and <@&${config.role_Mod}>...` })
                // Finally send the message we really want to send...
                await firstThreadMessage.edit({ content: `Hey <@${userToBeActedUpon.id}>\n${noteText}`, embeds: [] });
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

            // Write the moderation action in the chat to log it
            const actionEmbed = bloonUtils.createModerationActionEmbed(action, userToBeActedUpon, caseID, noteText, interaction.member, null, DMsent);

            sentInEvidence = moderationActionChannel.send({ content: `Timeout for <@!${selectedUserId}>`, embeds: [actionEmbed]})
                .then(() => false)
                .catch((error) => {
                    console.log(`Error while sending to the evidence channel: ${error}`);
                    return false;
                });

            const line1 = userTimedOut ? `✅ User was timed out` : `❌ Couldn't time out user`;
            const line2 = DMsent ? `\n✅ DM was delivered` : `\n❌ DM couldn't be delivered`;
            const line3 = isMessageAction ? messageDeleted ? `\n✅ Message deleted` : `\n❌ Message couldn't be deleted` : '';
            const line4 = sentInEvidence ? `\n✅ Evidence sent` : `\n❌ Couldn't send the evidence`;
            const line5 = threadCreated ? `\n✅ Evidence sent in Thread` : ` \n❌ Couldn't send evidence to Thread`;
            const line6 = savedInDatabase ? `\n✅ Moderation action saved in the database` : ` \n❌ Moderation action couldn't be saved in the database`;

            await interaction.editReply({
                content: line1 + line2 + line3 + line4 + line5 + line6
            });

            console.log(line1 + line2 + line3 + line4 + line5 + line6);
        
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