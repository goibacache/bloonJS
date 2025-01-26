const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } 	= require('discord.js');
const { createTimeoutModal } 	= require('../utils/contextMenuUtils.js');

/**
 * Creates a modal with the custom id "noteModal"
 */
module.exports = {
	contextMenuId: 'moderationProfileFastTimeout',
	data: new ContextMenuCommandBuilder()
		.setName('Message: Fast Timeout')
		.setType(ApplicationCommandType.Message)
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	/**
	 * Executes the action
	 * @param {MessageContextMenuCommandInteraction} interaction
	 */
	async execute(interaction) {
		try{
			// Log for admin
			console.log(`Fast Timeout: '${this.data.name}' by ${interaction.member.user.tag} (${interaction.member.user.id})`);

            const modal = createTimeoutModal(interaction);
            await interaction.showModal(modal);

		}catch(error){
			const answer = { content: `Error in ${this.data.name}: ${error}`, ephemeral: true };
			
			if (interaction.deferred && !interaction.replied) {
                await interaction.editReply(answer);
            } else if (interaction.deferred && interaction.replied) {
                await interaction.followUp(answer);
            } else {
                await interaction.reply(answer);
            }

			console.log(`‼ Error in context menu action ${this.data.name}: ${error}`)
		}
	},
};