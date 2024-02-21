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
            interaction.deferReply({ ephemeral: true });

            // Get data from the custom id
            const   interactionParts    = interactionCustomId.split('/');

            const   guildId             = interactionParts[1];
            const   channelId           = interactionParts[2];
            const   messageId           = interactionParts[3];
            const   selectedUserId      = interactionParts[4];

            console.log(`Modal submit ${customId}.\nGuild: ${guildId}. Channel: ${channelId}. Message: ${messageId}. UserId: ${selectedUserId}\nBy user ${interaction.user.tag}`);

            // Get data from the text field
            const noteText = interaction.fields.getTextInputValue('noteText');
            const timeoutText = interaction.fields.getTextInputValue('timeoutText');

            if (isNaN(timeoutText)){
                await interaction.editReply({ content: `Time out text must be a valid number.` });
                return;
            }

            //timeout max: 40320
            if (parseInt(timeoutText) > 40320){
                await interaction.editReply({ content: `Time out time can't be higher than 40320 minutes.` });
                return;
            }

            /**
             * Is the action being done on a message or on an user?
             */
            const isMessageAction = messageId != 0;

            // Store in database and create the embed
            const action                    = bloonUtils.moderationActions.Timeout;
            /**
             * The message
             * @type {User}
             */
            const userToBeActedUpon         = await interaction.member.guild.members.fetch(selectedUserId);
            const caseID                    = await storedProcedures.moderationAction_GetNewId(action);
            const moderationActionChannel   = await interaction.member.guild.channels.fetch(config.moderationActionsChannel);
            const actionEmbed               = bloonUtils.createModerationActionEmbed(action, userToBeActedUpon, caseID, noteText, interaction.member, null);
            
            if (caseID == 0) {
                await interaction.editReply({ content: `Couldn't save ${action.name} in database.`, components: [] });
                return;
            }

            // Save it on the database
            await storedProcedures.moderationAction_Insert(action, selectedUserId, noteText, interaction.member.id).catch(() => {
                throw "Couldn't insert moderation action into the database";
            }); 

            // Write the moderation action in the chat to log it in the database
            moderationActionChannel.send({ embeds: [actionEmbed]}).catch(() => {
                throw "Couldn't send moderation action message into the #evidence channel";
            });

            await userToBeActedUpon.timeout(parseInt(timeoutText) * 60 * 1000).catch(() => {
                throw "Couldn't time out the user";
            });

            if (isMessageAction){
                /**
                 * The message
                 * @type {Message}
                 */
                const message = await interaction.client.channels.cache.get(channelId).messages.fetch(messageId);
                await message.delete().catch(() => {
                    throw "The user was timed out but I couldn't delete message 😢, sorry.";
                });
            }
            
            await userToBeActedUpon.send({content: `You have been timed out from Superboss' Discord server for the following reason: ${noteText}\nPlease do not reply this message as we're not able to see it and remember that continuously breaking the server rules will result in either a kick or a ban`})
            .then(async () => await interaction.editReply({ content: `The user was timed out, the message deleted and the DM was delivered 🔥.`, components: [], embeds: [] }))
            .catch(async () => await interaction.editReply({ content: `The user was timed out, the message deleted but I couldn't send the DM 😢, sorry.`, components: [], embeds: [] }));
        
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