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
            await interaction.guild.bans.remove(selectedUserId, unbanText);   
            interaction.editReply({ content: `The user was unbanned successfully 😇.`, components: [], embeds: [] });                         
            

            // Save it on the database
            await storedProcedures.moderationAction_Insert(action, selectedUserId, unbanText, interaction.member.id).catch(() => {
                throw "The user was unbanned successfully but I couldn't insert the moderation action into the database.";
            }); 

            // Write the moderation action in the chat to log it in the database
            moderationActionChannel.send({ embeds: [actionEmbed]}).catch(() => {
                throw "The user was unbanned successfully but I couldn't send the message into the #evidence channel.";
            });

            await userToBeActedUpon.send({content: unbanText})
                .then(async () => await interaction.editReply({ content: `The user was unbanned successfully and the DM delivered 😇.`, components: [], embeds: [] }))
                .catch(async () => await interaction.editReply({ content: `The user was unbanned successfully 😇, but I couldn't send the DM 😢, sorry.`, components: [], embeds: [] }));

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