const { PermissionFlagsBits } 	= require('discord.js');
const { createWarnModal } 	= require('../utils/contextMenuUtils.js');
/**
 * @typedef {import('discord.js').ModalBuilder} ModalBuilder
 * @typedef {import('discord.js').TextInputBuilder} TextInputBuilder
 * @typedef {import('discord.js').MessageContextMenuCommandInteraction} MessageContextMenuCommandInteraction
 */

const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

/**
 * Creates a modal with the custom id "noteModal"
 */
module.exports = {
	contextMenuId: 'warnModal',
	data: new ContextMenuCommandBuilder()
		.setName('3 User: Warn')
		.setType(ApplicationCommandType.User)
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	/**
	 * Executes the action
	 * @param {MessageContextMenuCommandInteraction} interaction
	 */
	async execute(interaction) {
		try{
			// Log for admin
			console.log(`User context menu action: '${this.data.name}' by ${interaction.member.user.tag} (${interaction.member.user.id})`);
			// Create modal
			const modal = createWarnModal(interaction);
			// Show modal
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