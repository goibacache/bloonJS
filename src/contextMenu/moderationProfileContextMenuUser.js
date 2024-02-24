const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } 	= require('discord.js');
const bloonUtils							= require('../utils/utils.js');
const storedProcedures						= require('../utils/storedProcedures.js');
const { getGuildChannelMessageAndTarget, createNoteModal, createTimeoutModal, createWarnModal, createKickModal, createBanModal, createUnbanModal } 	= require('../utils/contextMenuUtils.js');
/**
 * @typedef {import('discord.js').ModalBuilder} ModalBuilder
 * @typedef {import('discord.js').TextInputBuilder} TextInputBuilder
 * @typedef {import('discord.js').MessageContextMenuCommandInteraction} MessageContextMenuCommandInteraction
 */

/**
 * Creates a modal with the custom id "noteModal"
 */
module.exports = {
	contextMenuId: 'moderationProfile',
	data: new ContextMenuCommandBuilder()
		.setName('User: Moderate')
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

            await interaction.deferReply({ ephemeral: true }); // This makes it so it can take more than 3 seconds to reply.

			const { selectedUserId } = getGuildChannelMessageAndTarget(interaction);

			//#region Button configuration
			const previousButton = new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('◀ Action')
            .setStyle(ButtonStyle.Secondary);

            const nextButton = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Action ▶')
            .setStyle(ButtonStyle.Secondary);

            const note = new ButtonBuilder()
            .setCustomId('note')
            .setLabel(`📄 Note`)
            .setStyle(ButtonStyle.Primary);

			const timeout = new ButtonBuilder()
            .setCustomId('timeout')
            .setLabel(`⏰ Timeout`)
            .setStyle(ButtonStyle.Primary);

			const warn = new ButtonBuilder()
            .setCustomId('warn')
            .setLabel(`⚡ Warn`)
            .setStyle(ButtonStyle.Primary);

			const kick = new ButtonBuilder()
            .setCustomId('kick')
            .setLabel(`🦶 Kick`)
            .setStyle(ButtonStyle.Primary);

			const ban = new ButtonBuilder()
            .setCustomId('ban')
            .setLabel(`🔥 Ban`)
            .setStyle(ButtonStyle.Danger);

			const unban = new ButtonBuilder()
            .setCustomId('unban')
            .setLabel(`😇 Unban`)
            .setStyle(ButtonStyle.Success);

            const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('✖ Cancel')
            .setStyle(ButtonStyle.Secondary);

            const prevNextButtons = new ActionRowBuilder().addComponents(previousButton, nextButton);
			const actionButtons = new ActionRowBuilder().addComponents(note, timeout, warn, kick);
			const banButtons = new ActionRowBuilder().addComponents(ban, unban, cancel);

            //#endregion

            // Get log of actions of a user
            let     currentActionIndex      = 0;
            const   moderationProfile       = await storedProcedures.moderationAction_Profile(selectedUserId);
            const   moderationProfileEmbeds = await bloonUtils.loadModerationProfileEmbeds(moderationProfile);
            let     moderationHistoryEmbed  = bloonUtils.getModerationProfileEmbed(0, moderationProfileEmbeds, previousButton, nextButton);

            // Initial response:
            await interaction.editReply({
                content: ``,
                components: [prevNextButtons, actionButtons, banButtons],
                embeds: [moderationHistoryEmbed]
            });

            // Activate buttons:
            const currentMessage = await interaction.fetchReply();
            const collector = currentMessage.createMessageComponentCollector({time: 300_000, componentType: ComponentType.Button}); // 5 minutes

            // triggers when the times runs out, removes buttons
            collector.on('end', () => {
                interaction.editReply({ components: [] });
            });
                        
            // triggers when the buttons are pressed
            collector.on('collect', async (m) => {

                if (m.customId === 'previous' || m.customId === 'next'){
                    if (m.customId === 'previous' && currentActionIndex > 0){
                        console.log(`Previous moderationAction`);
                        currentActionIndex--;
                    }
    
                    if (m.customId === 'next' && currentActionIndex < moderationProfileEmbeds.length){
                        console.log(`Next moderationAction`);
                        currentActionIndex++;
                    }
    
                    let moderationHistoryEmbed = bloonUtils.getModerationProfileEmbed(currentActionIndex, moderationProfileEmbeds, previousButton, nextButton);
    
                    m.update({ embeds: [moderationHistoryEmbed], files: [], components: [prevNextButtons, actionButtons, banButtons] });
                }

                if (m.customId === 'note') {
                    console.log(`Show note modal`);
                    const modal = createNoteModal(interaction);
					await m.showModal(modal);
                    return;
                }

				if (m.customId === 'timeout') {
                    console.log(`Show timeout modal`);
                    const modal = createTimeoutModal(interaction);
					await m.showModal(modal);
                    return;
                }

				if (m.customId === 'warn') {
                    console.log(`Show warn modal`);
                    const modal = createWarnModal(interaction);
					await m.showModal(modal);
                    return;
                }

				if (m.customId === 'kick') {
                    console.log(`Show kick modal`);
                    const modal = createKickModal(interaction);
					await m.showModal(modal);
                    return;
                }

				if (m.customId === 'ban') {
                    console.log(`Show ban modal`);
                    const modal = createBanModal(interaction);
					await m.showModal(modal);
                    return;
                }

				if (m.customId === 'unban') {
                    console.log(`Show unban modal`);
                    const modal = createUnbanModal(interaction);
					await m.showModal(modal);
                    return;
                }

                if (m.customId === 'cancel') {
                    console.log(`Canceled moderationAction`);
                    await m.update({ content: `Thanks for checking, come back soon 😎`, components: [], embeds: [] });
                    return;
                }
            });
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