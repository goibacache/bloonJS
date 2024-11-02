const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } 	= require('discord.js');
const { createReplyAsBloonModal } 	= require('../utils/contextMenuUtils.js');

/**
 * Creates a modal with the custom id "noteModal"
 */
module.exports = {
	contextMenuId: 'moderationReplyHereAsBloon',
	data: new ContextMenuCommandBuilder()
		.setName('Message: Reply here as bloon')
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
			console.log(`Reply as bloon: '${this.data.name}' by ${interaction.member.user.tag} (${interaction.member.user.id})`);

            const modal = createReplyAsBloonModal(interaction, false);
            await interaction.showModal(modal);
            return;

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