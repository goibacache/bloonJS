/**
  * @typedef {import('discord.js').ModalSubmitInteraction} ModalSubmitInteraction
  * @typedef {import('discord.js').Message} Message
  * @typedef {import('discord.js').Channel} Channel
  * @typedef {import('discord.js').User} User
 */

const customId = 'bydiscordid';

module.exports = {
    from: 'moderationProfileHandleUserByDiscordId.js',
    customId: customId,
    /**
     * Executes the action
     * @param {ModalSubmitInteraction} interaction
     */
    async execute(interaction) {
        try {
            // Defer reply
            await interaction.deferReply({ ephemeral: true });

            // Read supplied discord id
            const UserToModerateDiscordId = interaction.fields.getTextInputValue('discordid').trim();

            if (isNaN(UserToModerateDiscordId)){
                console.log(`Bad Discord Id: "${UserToModerateDiscordId}"`);
                await interaction.editReply(`The supplied Discord ID \`${UserToModerateDiscordId}\` doesn't have the correct format (numeric).`);
                return;
            }

            //TODO: verify is only numbers
            interaction.targetUser = await interaction.client.users.fetch(UserToModerateDiscordId);
            interaction.targetMessage = null;

            const nextInteraction = interaction.client.contextMenuCommands.get("User: Moderate");
            await nextInteraction.execute(interaction);

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