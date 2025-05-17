const bloonUtils        = require('../utils/utils.js');
const config            = bloonUtils.getConfig();
const storedProcedures  = require('../utils/storedProcedures.js');

/**
  * @typedef {import('discord.js').ModalSubmitInteraction} ModalSubmitInteraction
  * @typedef {import('discord.js').Message} Message
  * @typedef {import('discord.js').Channel} Channel
  * @typedef {import('discord.js').User} User
 */

const customId = 'warnModal';

module.exports = {
    from: 'warnContextMenuUser.js & warnContextMenuMessage.js',
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
            let messageDeleted = false;
            let sentInEvidence = false;
            let threadCreated = false;
            let savedInDatabase = false;
            let fullMessage = '';

            const isMessageAction = messageId != 0;

            console.log(`Modal submit ${customId}.\nGuild: ${guildId}. Channel: ${channelId}. Message: ${messageId}. UserId: ${selectedUserId}\nBy user ${interaction.user.tag}`);

            // Get data from the text field
            const warnText = interaction.fields.getTextInputValue('warnText');

            // Store in database and create the embed
            const action                    = bloonUtils.moderationActions.Warn;
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

            DMsent = await userToBeActedUpon.send({content: warnText})
                .then(() => true)
                .catch((error) => {
                    console.log(`Error while sending DM: ${error}`);
                    return false;
                });

            // Create thread
            const thread = await bloonUtils.createOrFindModerationActionThread(interaction.client, selectedUserId);

            if (thread){
                threadCreated = true;
                // "Loading" message
                const firstThreadMessage = await thread.send({ content: `Hey <@${userToBeActedUpon.id}> (${userToBeActedUpon.user.tag})\n...` });
                // Edit the message and mention all of the roles that should be included.
                await firstThreadMessage.edit({ content: `Hey <@${userToBeActedUpon.id}> (${userToBeActedUpon.user.tag})\nSummoning: <@&${config.role_Mod}>...` })
                // Finally send the message we really want to send...
                await firstThreadMessage.edit({ content: `Hey <@${userToBeActedUpon.id}> (${userToBeActedUpon.user.tag})\n${warnText}`, embeds: [] });
            }

            //if for some reason the message persists, delete it
            if (isMessageAction){
                /**
                 * The message
                 * @type {Message}
                 */
                const message = await interaction.client.channels.cache.get(channelId).messages.fetch(messageId);
                fullMessage = bloonUtils.getTextAndAttachmentsFromMessage(message);
                if (message){
                    messageDeleted = await message.delete()
                    .then(() => true)
                    .catch((error) => {
                        console.log(`Error while deleting message: ${error}`);
                        return false;
                    });
                }
            }

            // Save it on the database
            savedInDatabase = await storedProcedures.moderationAction_Insert(action, selectedUserId, warnText, interaction.member.id, fullMessage)
                .then(() => true)
                .catch((error) => {
                    console.log(`Error while saving in database: ${error}`);
                    return false;
                });

            // Write the moderation action in the chat
            const actionEmbed = bloonUtils.createModerationActionEmbed(action, userToBeActedUpon, caseID, warnText, interaction.member, null, DMsent);

            sentInEvidence = moderationActionChannel.send({ content: `Warn for <@${userToBeActedUpon.id}> (${userToBeActedUpon.user.tag})`, embeds: [actionEmbed]})
                .then(() => true)
                .catch((error) => {
                    console.log(`Error while sending to the evidence channel: ${error}`);
                    return false;
                });

            const line1 = DMsent ? `✅ DM was delivered` : `❌ DM couldn't be delivered`;
            const line2 = isMessageAction ? messageDeleted ? `\n✅ Message deleted` : `\n❌ Message couldn't be deleted` : '';
            const line3 = sentInEvidence ? `\n✅ Evidence sent` : `\n❌ Couldn't send the evidence`;
            const line4 = threadCreated ? `\n✅ Evidence sent in Thread` : ` \n❌ Couldn't send evidence to Thread`;
            const line5 = savedInDatabase ? `\n✅ Saved in database` : ` \n❌ Couldn't be saved in database`;

            await interaction.editReply({
                content: line1 + line2 + line3 + line4 + line5
            });

            console.log(line1 + line2 + line3 + line4 + line5);

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