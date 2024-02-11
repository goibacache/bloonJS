const { PermissionFlagsBits } = require('discord.js');
/**
 * @typedef {import('discord.js').ModalBuilder} ModalBuilder
 * @typedef {import('discord.js').TextInputBuilder} TextInputBuilder
 * @typedef {import('discord.js').MessageContextMenuCommandInteraction} MessageContextMenuCommandInteraction
 */

const { ContextMenuCommandBuilder, ApplicationCommandType, ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder } = require('discord.js');
//const bloonUtils = require('../utils/utils.js');
//const config = bloonUtils.getConfig();

/**
 * Creates a modal with the custom id "noteModal"
 */
module.exports = {
	cooldown: 0,
	data: new ContextMenuCommandBuilder()
		.setName('Create note and delete message')
		.setType(ApplicationCommandType.Message)
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	/**
	 * Executes the action
	 * @param {MessageContextMenuCommandInteraction} interaction
	 */
	async execute(interaction) {
		try{
			console.log(`Context menu - Note: ${interaction.member.id}`);

			
			const guild = interaction.targetMessage.guildId;
			const channel = interaction.targetMessage.channelId;
			const messageId = interaction.targetMessage.id;
			const selectedUserId = interaction.targetMessage.author.id;

			let inputText = "";
			if (interaction.targetMessage.content.length > 0){
				inputText = `Posted the following message:\n'${interaction.targetMessage.content}'`;
			}

			// Attached files:
			let attachments = "";
			if (interaction.targetMessage.attachments.size > 0){
				attachments += inputText.length > 0 ? `\nWith the following attachments:\n` : 'Posted the following attachments:\n';

				interaction.targetMessage.attachments.forEach((attachment) => {
					attachments += `[${attachment.name}](<${attachment.url}>)\n`
				});

				inputText += `\n${attachments}`;
			}

			// Create modal:
			const modal = new ModalBuilder()
				.setCustomId(`noteModal/${guild}/${channel}/${messageId}/${selectedUserId}`)
				.setTitle('Creating a note and deleting message');

			// Create the text input components
			const note = new TextInputBuilder()
				.setCustomId('noteText')
				.setLabel('Note') // The label is the prompt the user sees for this input
				.setStyle(TextInputStyle.Paragraph) // Short means only a single line of text
				.setValue(inputText)
				.setRequired(true)
				.setPlaceholder('The note text that will be saved in evidence');

			const noteActionRow 	= new ActionRowBuilder().addComponents(note);
	
			// Add inputs to the modal
			modal.addComponents(noteActionRow);
	
			// Show the modal to the user
			await interaction.showModal(modal);
		}catch(error){
			const answer = { content: `Error creating note: ${error}`, ephemeral: true };
			
			if (interaction.deferred && !interaction.replied) {
                await interaction.editReply(answer);
            } else if (interaction.deferred && interaction.replied) {
                await interaction.followUp(answer);
            } else {
                await interaction.reply(answer);
            }

			console.log(`Error in context menu action 'Create note about this message and delete it': ${error}`)
		}
	},
};