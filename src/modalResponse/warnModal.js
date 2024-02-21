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
            interaction.deferReply({ ephemeral: true });

            // Get data from the custom id
            const   interactionParts    = interactionCustomId.split('/');

            const   guildId             = interactionParts[1];
            const   channelId           = interactionParts[2];
            const   messageId           = interactionParts[3];
            const   selectedUserId      = interactionParts[4];

            console.log(`Modal submit ${customId}.\nGuild: ${guildId}. Channel: ${channelId}. Message: ${messageId}. UserId: ${selectedUserId}\nBy user ${interaction.user.tag}`);

            // Get data from the text field
            const warnText = interaction.fields.getTextInputValue('warnText');

            // Store in database and create the embed
            const action                    = bloonUtils.moderationActions.Warn;
            /**
             * The message
             * @type {User}
             */
            const userToBeActedUpon         = await interaction.member.guild.members.fetch(selectedUserId);
            const caseID                    = await storedProcedures.moderationAction_GetNewId(action);
            const moderationActionChannel   = await interaction.member.guild.channels.fetch(config.moderationActionsChannel);
            const actionEmbed               = bloonUtils.createModerationActionEmbed(action, userToBeActedUpon, caseID, warnText, interaction.member, null);
            
            if (caseID == 0) {
                await interaction.editReply({ content: `Couldn't save ${action.name} in database.`, components: [] });
                return;
            }

            await userToBeActedUpon.send({content: warnText})
                .then(async () => await interaction.editReply({ content: `The warning was delivered via DM 🔥.`, components: [], embeds: [] }))
                .catch(async () => await interaction.editReply({ content: `Couldn't send the DM 😢, sorry. This warning was saved on the database, but please consider contacting the user directly and creating a note.`, components: [], embeds: [] }));

            // Save it on the database
            await storedProcedures.moderationAction_Insert(action, selectedUserId, warnText, interaction.member.id).catch(() => {
                throw "The warning was delivered via DM 🔥 but couldn't insert moderation action into the database.";
            }); 

            // Write the moderation action in the chat to log it in the database
            moderationActionChannel.send({ embeds: [actionEmbed]}).catch(() => {
                throw "The warning was delivered via DM 🔥 but couldn't send moderation action message into the #evidence channel.";
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