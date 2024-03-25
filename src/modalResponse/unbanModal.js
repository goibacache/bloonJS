const bloonUtils        = require('../utils/utils.js');
const config            = bloonUtils.getConfig();
const storedProcedures  = require('../utils/storedProcedures.js');

/**
  * @typedef {import('discord.js').ModalSubmitInteraction} ModalSubmitInteraction
  * @typedef {import('discord.js').Message} Message
  * @typedef {import('discord.js').Channel} Channel
  * @typedef {import('discord.js').User} User
 */

const customId = 'unbanModal';

module.exports = {
    from: 'unbanContextMenuUser.js & unbanContextMenuMessage.js',
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
            let userUnbanned = false;
            let DMsent = false;
            let sentInEvidence = false;
            let threadCreated = false;
            let savedInDatabase = false;

            console.log(`Modal submit ${customId}.\nGuild: ${guildId}. Channel: ${channelId}. Message: ${messageId}. UserId: ${selectedUserId}\nBy user ${interaction.user.tag}`);

            // Get data from the text field
            const unbanText = interaction.fields.getTextInputValue('unbanText');

            // Store in database and create the embed
            const action                    = bloonUtils.moderationActions.Unban;
            /**
             * The user
             * @type {User}
             */
            const userToBeActedUpon         = await interaction.client.users.fetch(selectedUserId); // Get user outside of guild
            const caseID                    = await storedProcedures.moderationAction_GetNewId(action);
            const moderationActionChannel   = await interaction.member.guild.channels.fetch(config.moderationActionsChannel);
            const actionEmbed               = bloonUtils.createModerationActionEmbed(action, userToBeActedUpon, caseID, unbanText, interaction.member, null);
            
            if (caseID == 0) {
                await interaction.editReply({ content: `Couldn't save ${action.name} in database.`, components: [] });
                return;
            }

            // Get all the bans
            const bans = await interaction.guild.bans.fetch();
        
            if (bans.size == 0) {
                interaction.editReply({ content: `There are no banned user on this server.`, components: [], embeds: [] });
                return;
            }

            const bannedUser = await bans.find(ban => ban.user.id === selectedUserId);
            if (!bannedUser) {
                interaction.editReply({ content: `The user ID provided is not banned from this server.`, components: [], embeds: [] });
                return;
            }

            // Removes the ban
            userUnbanned = await interaction.guild.bans.remove(selectedUserId, unbanText)
                .then(() => true)
                .catch((error) => {
                    console.log(`Error while unbanning user: ${error}`);
                    return false;
                });

            DMsent = await userToBeActedUpon.send({content: unbanText})
                .then(() => true)
                .catch((error) => {
                    console.log(`Error while sending DM: ${error}`);
                    return false;
                });
            
            // Save it on the database
            savedInDatabase = await storedProcedures.moderationAction_Insert(action, selectedUserId, unbanText, interaction.member.id)
                .then(() => true)
                .catch((error) => {
                    console.log(`Error while saving in database: ${error}`);
                    return false;
                });

            // Write the moderation action in the chat to log it in the database
            sentInEvidence = moderationActionChannel.send({ content: `Unban for <@!${selectedUserId}>`, embeds: [actionEmbed]})
                .then(() => true)
                .catch((error) => {
                    console.log(`Error while sending to the evidence channel: ${error}`);
                    return false;
                });

            
            // Thread
            const thread = await bloonUtils.createOrFindModerationActionHelpThread(interaction.client, `Moderation for ${selectedUserId}`);

            if (thread){
                threadCreated = true;

                // "Loading" message
                const firstThreadMessage = await thread.send({ content: `Hey <@${userToBeActedUpon.id}>\n...` });
                // Edit the message and mention all of the roles that should be included.
                await firstThreadMessage.edit({ content: `Hey <@${userToBeActedUpon.id}>\n<@&${config.role_Agent}> & <@&${config.role_Aug}> & <@&${config.role_Mod}>...` })
                // Finally send the message we really want to send...
                await firstThreadMessage.edit({ content: `Hey <@${userToBeActedUpon.id}>\n${unbanText}`, embeds: [] });
            }

            const line1 = userUnbanned ? `✅ User was unbanned` : `❌ Couldn't unban the user`;
            const line2 = DMsent ? `\n✅ DM was delivered` : `\n❌ DM couldn't be delivered`;
            const line3 = sentInEvidence ? `\n✅ Evidence sent` : `\n❌ Couldn't send the evidence`;
            const line4 = threadCreated ? `\n✅ Thread created` : ` \n❌ Thread couldn't created`;
            const line5 = savedInDatabase ? `\n✅ Moderation action saved in the database` : ` \n❌ Moderation action couldn't be saved in the database`;

            await interaction.editReply({
                content: line1 + line2 + line3 + line4 + line5
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