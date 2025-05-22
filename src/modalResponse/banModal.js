const bloonUtils        = require('../utils/utils.js');
const storedProcedures  = require('../utils/storedProcedures.js');
// eslint-disable-next-line no-unused-vars
const { ServerConfig }              = require('../interfaces/ServerConfig.js'); // Used so VSCODE can see the properties

/**
  * @typedef {import('discord.js').ModalSubmitInteraction} ModalSubmitInteraction
  * @typedef {import('discord.js').Message} Message
  * @typedef {import('discord.js').Channel} Channel
  * @typedef {import('discord.js').User} User
 */

const customId = 'banModal';

module.exports = {
    from: 'banContextMenuUser.js & banContextMenuMessage.js',
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

            /**
             * @type ServerConfig
            */
            const serverConfig = interaction.client.serverConfigs.find(x => x.ServerId == guildId);
            if (!serverConfig){
                await interaction.editReply({ content: `No config found for your server, sorry.` });
                return;
            }

            // Various returns
            let userBanned = false;
            let DMsent = false;
            let messageDeleted = false;
            let sentInEvidence = false;
            let threadCreated = false;
            let savedInDatabase = false;
            let fullMessage = '';

            console.log(`Modal submit ${customId}.\nGuild: ${guildId}. Channel: ${channelId}. Message: ${messageId}. UserId: ${selectedUserId}\nBy user ${interaction.user.tag}`);

            // Get data from the text field
            const banText = interaction.fields.getTextInputValue('banText');
            const hoursToDelete = interaction.fields.getTextInputValue('hoursToDelete');


            if (isNaN(hoursToDelete)){
                await interaction.editReply({ content: `Hours to delete must be a number between 0 and 168.` });
                return;
            }

            //timeout max: 604800 SECONDS or 168 hours
            if (parseInt(hoursToDelete) > 168){
                await interaction.editReply({ content: `Hours to delete can't be higher than 168 hours.` });
                return;
            }

            // Store in database and create the embed
            const action                    = bloonUtils.moderationActions.Ban;
            /**
             * The user
             * @type {User}
             */
            let userToBeActedUpon;

            try {
                userToBeActedUpon = await interaction.member.guild.members.fetch(selectedUserId);
                console.log('Acting on a user that is on the server.');
            } catch (error) {
                userToBeActedUpon = await interaction.client.users.fetch(selectedUserId); //outside of guild
                console.log('Acting on a user that is NOT on the server.');
            }

            const caseID                    = await storedProcedures.moderationAction_GetNewId(action, guildId);
            const moderationActionChannel   = await interaction.member.guild.channels.fetch(serverConfig.MR_ModerationActionChannel);

            const isMessageAction = messageId != 0;
            
            if (caseID == 0) {
                await interaction.editReply({ content: `Couldn't save ${action.name} in database.`, components: [] });
                return;
            }

            // Message the user
            DMsent = await userToBeActedUpon.send({content: banText})
                .then(() => true)
                .catch((error) => {
                    console.log(`Error while sending DM: ${error}`);
                    return false;
                });

            // Ban the user
            userBanned = await interaction.guild.bans.create(selectedUserId, { banText, deleteMessageSeconds: parseInt(hoursToDelete) * 3600 })
                .then(() => true)
                .catch((error) => {
                    console.log(`Error while banning user: ${error}`);
                    return false;
                });

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
            savedInDatabase = await storedProcedures.moderationAction_Insert(action, selectedUserId, banText, interaction.member.id, fullMessage, guildId)
                .then(() => true)
                .catch((error) => {
                    console.log(`Error while saving in database: ${error}`);
                    return false;
                });

            const actionEmbed = bloonUtils.createModerationActionEmbed(action, userToBeActedUpon, caseID, banText, interaction.member, null, DMsent);

            // Write the moderation action in the chat to log it in the database
            sentInEvidence = await moderationActionChannel.send({ content: `Ban for <@${userToBeActedUpon.id}> (${userToBeActedUpon.user ? userToBeActedUpon.user.tag : userToBeActedUpon.tag})`, embeds: [actionEmbed]})
                .then(() => true)
                .catch((error) => {
                    console.log(`Error while sending to the evidence channel: ${error}`);
                    return false;
                });

            // Thread
            const thread = await bloonUtils.createOrFindModerationActionThread(interaction.client, selectedUserId, serverConfig);

            if (thread){
                threadCreated = true;

                // "Loading" message
                const firstThreadMessage = await thread.send({ content: `Hey <@${userToBeActedUpon.id}> (${ userToBeActedUpon.user ? userToBeActedUpon.user.tag : userToBeActedUpon.tag })\n...` });
                // Edit the message and mention all of the roles that should be included.
                // TODO: Figure out who to add (mods)
                //await firstThreadMessage.edit({ content: `Hey <@${userToBeActedUpon.id}> (${ userToBeActedUpon.user ? userToBeActedUpon.user.tag : userToBeActedUpon.tag })\nSummoning: <@&${config.role_Mod}>...` })
                // Finally send the message we really want to send...
                await firstThreadMessage.edit({ content: `Hey <@${userToBeActedUpon.id}> (${ userToBeActedUpon.user ? userToBeActedUpon.user.tag : userToBeActedUpon.tag })\n${banText}`, embeds: [] });
            }

            const line1 = userBanned ? `✅ User was banned` : `❌ Couldn't ban the user`;
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