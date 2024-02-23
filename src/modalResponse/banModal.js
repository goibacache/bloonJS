const bloonUtils        = require('../utils/utils.js');
const config            = bloonUtils.getConfig();
const storedProcedures  = require('../utils/storedProcedures.js');

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
            interaction.deferReply({ ephemeral: true });

            // Get data from the custom id
            const   interactionParts    = interactionCustomId.split('/');

            const   guildId             = interactionParts[1];
            const   channelId           = interactionParts[2];
            const   messageId           = interactionParts[3];
            const   selectedUserId      = interactionParts[4];

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
             * The message
             * @type {User}
             */
            const userToBeActedUpon         = await interaction.member.guild.members.fetch(selectedUserId);
            const caseID                    = await storedProcedures.moderationAction_GetNewId(action);
            const moderationActionChannel   = await interaction.member.guild.channels.fetch(config.moderationActionsChannel);
            const actionEmbed               = bloonUtils.createModerationActionEmbed(action, userToBeActedUpon, caseID, banText, interaction.member, null);

            const isMessageAction = messageId != 0;
            
            if (caseID == 0) {
                await interaction.editReply({ content: `Couldn't save ${action.name} in database.`, components: [] });
                return;
            }

            // Ban the user
            await interaction.guild.bans.create(selectedUserId, { banText, deleteMessageSeconds: parseInt(hoursToDelete) * 3600 })
                .then(async () => await interaction.editReply({ content: `The user was banned successfully 🔥.`, components: [], embeds: [] }))
                .catch(() => {
                    throw `I couldn't ban the user 😢, sorry.`;
                });

            //if for some reason the message persists, delete it
            if (isMessageAction){
                /**
                 * The message
                 * @type {Message}
                 */
                const message = await interaction.client.channels.cache.get(channelId).messages.fetch(messageId);
                if (message){
                    await message.delete()
                    .then(async () => await interaction.editReply({ content: `The user was banned and the message was deleted 🔥.`, components: [], embeds: [] }))
                    .catch(() => {
                        throw `The user was banned but I couldn't delete the message 😢, sorry.`;
                    });
                }
            }

            // Save it on the database
            await storedProcedures.moderationAction_Insert(action, selectedUserId, banText, interaction.member.id).catch(() => {
                throw "The user was banned but I couldn't insert the moderation action into the database.";
            }); 

            // Write the moderation action in the chat to log it in the database
            moderationActionChannel.send({ embeds: [actionEmbed]}).catch(() => {
                throw "The user was banned but I couldn't send the message into the #evidence channel.";
            });

            await userToBeActedUpon.send({content: banText})
                .then(async () => await interaction.editReply({ content: isMessageAction ? `The user was banned, the message deleted and the ban message was delivered via DM 🔥.` : `The user was banned and the message was delivered via DM 🔥.`, components: [], embeds: [] }))
                .catch(async () => await interaction.editReply({ content: isMessageAction ? `The user was banned, the message deleted but I couldn't send the DM 😢, sorry.` : `The user was banned but I couldn't send the DM 😢, sorry.`, components: [], embeds: [] }));

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