const bloonUtils        = require('../utils/utils.js');
const config            = bloonUtils.getConfig();
const storedProcedures  = require('../utils/storedProcedures.js');

/**
  * @typedef {import('discord.js').ModalSubmitInteraction} ModalSubmitInteraction
  * @typedef {import('discord.js').Message} Message
  * @typedef {import('discord.js').Channel} Channel
 */

module.exports = {
    from: 'note.js',
    customId: 'noteModal',
    /**
	 * Executes the action
	 * @param {ModalSubmitInteraction} interaction
	 */
    async execute(interaction, guildId, channelId, messageId, selectedUserId) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const noteText = interaction.fields.getTextInputValue('noteText');

            // Store in DDBB and create EMBED
            const action            = bloonUtils.moderationActions["Note"];
            const userToBeActedUpon = await interaction.member.guild.members.fetch(selectedUserId);
            const caseID            = await storedProcedures.moderationAction_GetNewId(action);
            const channel           = await interaction.member.guild.channels.fetch(config.moderationActionsChannel);
            const actionEmbed       = bloonUtils.createModerationActionEmbed(action, userToBeActedUpon, caseID, noteText, interaction.member, null);
            
            if (caseID == 0) {
                await interaction.editReply({ content: `Couldn't save ${action.name} in database.`, components: [] });
                return;
            }

            // Save it on the database
            await storedProcedures.moderationAction_Insert(action, selectedUserId, noteText, interaction.member.id).catch(() => {
                throw "Couldn't insert moderation action into the database";
            }); 

            // Write the moderation action in the chat to log it in the database
            channel.send({ embeds: [actionEmbed]}).catch(() => {
                throw "Couldn't send moderation action message into #evidence";
            });

            /**
             * The message
             * @type {Message}
             */
            const message = await interaction.client.channels.cache.get(channelId).messages.fetch(messageId);
            await message.delete().catch(() => {
                throw "Couldn't delete message";
            });
            
            await interaction.editReply({ content: `Note created successfully.`, components: [], embeds: [] });

        } catch (error) {
            console.log(`⚠ Error in NoteModal: ${error}`);
            const answer = { content: `There was an error creating the note for the user. ${error}`, components: [], embeds: [] };
			
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