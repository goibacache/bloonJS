const bloonUtils        = require('../utils/utils.js');
const config            = bloonUtils.getConfig();
const storedProcedures  = require('../utils/storedProcedures.js');

/**
  * @typedef {import('discord.js').ModalSubmitInteraction} ModalSubmitInteraction
  * @typedef {import('discord.js').Message} Message
  * @typedef {import('discord.js').Channel} Channel
  * @typedef {import('discord.js').User} User
 */

const customId = 'kickModal';

module.exports = {
    from: 'kickContextMenuUser.js & kickContextMenuMessage.js',
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
            const kickText = interaction.fields.getTextInputValue('kickText');

            // Store in database and create the embed
            const action                    = bloonUtils.moderationActions.Kick;
            /**
             * The message
             * @type {User}
             */
            const userToBeActedUpon         = await interaction.member.guild.members.fetch(selectedUserId);
            const caseID                    = await storedProcedures.moderationAction_GetNewId(action);
            const moderationActionChannel   = await interaction.member.guild.channels.fetch(config.moderationActionsChannel);
            const actionEmbed               = bloonUtils.createModerationActionEmbed(action, userToBeActedUpon, caseID, kickText, interaction.member, null);

            const isMessageAction = messageId != 0;
            
            if (caseID == 0) {
                await interaction.editReply({ content: `Couldn't save ${action.name} in database.`, components: [] });
                return;
            }

            await interaction.guild.members.kick(userToBeActedUpon, kickText)
                .then(async () => await interaction.editReply({ content: `The user was kicked.`, components: [], embeds: [] }))
                .catch(() => {
                    throw "I couldn't kick that user 😢, sorry";
                });

            // Save it on the database
            await storedProcedures.moderationAction_Insert(action, selectedUserId, kickText, interaction.member.id).catch(() => {
                throw "The user was kicked but I couldn't insert the moderation action into the database.";
            }); 

            // Write the moderation action in the chat to log it in the database
            moderationActionChannel.send({ embeds: [actionEmbed]}).catch(() => {
                throw "The user was kicked but I couldn't send the message into the #evidence channel.";
            });

            if (isMessageAction){
                /**
                 * The message
                 * @type {Message}
                 */
                const message = await interaction.client.channels.cache.get(channelId).messages.fetch(messageId);
                await message.delete()
                    .then(async () => await interaction.editReply({ content: `The user was kicked and the message was deleted.`, components: [], embeds: [] }))
                    .catch(() => {
                        throw `The user was kicked but I couldn't delete the message.`;
                    });
            }

            await userToBeActedUpon.send({content: kickText})
                .then(async () => await interaction.editReply({ content: isMessageAction ? `The user was kicked, the message deleted and the kick message was delivered via DM 🔥.` : `The user was kicked and the kick message was delivered via DM 🔥.`, components: [], embeds: [] }))
                .catch(async () => await interaction.editReply({ content: isMessageAction ? `The user was kicked, the message deleted but I couldn't send the DM 😢, sorry.` : `The user was kicked but I couldn't send the DM 😢, sorry.`, components: [], embeds: [] }));

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