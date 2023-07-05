const { SlashCommandBuilder, PermissionFlagsBits, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require('discord.js')
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const storedProcedures = require('../utils/storedProcedures.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription(`Bans a player for an action and creates a log.`)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
			option
				.setName('target')
				.setDescription('Discord Id to ban')
				.setRequired(true)
		)
        .addStringOption(option =>
			option
				.setName('reason')
				.setDescription('Reason for ban')
				.setRequired(true)
		)
        .setDMPermission(false),
	async execute(interaction) {
		try{
            const target = interaction.options.getUser('target');
            const reason = interaction.options.getString('reason') ?? 'No reason provided';
    
            const confirm = new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Confirm Ban')
                .setStyle(ButtonStyle.Danger);
    
            const cancel = new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Primary);
    
            const row = new ActionRowBuilder()
                .addComponents(confirm, cancel);
    
            const response = await interaction.reply({
                content: `Are you sure you want to ban ${target} for reason: ${reason}?`,
                components: [row],
                ephemeral: true
            });

            const collectorFilter = i => i.user.id === interaction.user.id;

            try {
                const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });

                if (confirmation.customId === 'confirm') {
                    const caseID            = await storedProcedures.sp_banInsert(target.id, reason, interaction.member.id);
                    const usertToBeBanned   = await interaction.member.guild.members.fetch(target.id);
                    const channel           = await interaction.member.guild.channels.fetch(config.moderationActionsChannel);
                    const banEmbed          = bloonUtils.createBanEmbed(usertToBeBanned, caseID, reason, interaction.member);
                    
                    if (caseID == 0) {
                        await confirmation.update({ content: `Couldn't save ban in database.`, components: [] });
                        return;
                    }      

                    // Actually ban and update the reply
                    //await interaction.guild.members.ban(target);
                    await confirmation.update({ content: `${target.username} has been banned for reason: ${reason}`, components: [] });      
                    
                    // Write ban in the chat to log it.
                    channel.send({ embeds: [banEmbed]});

                } else if (confirmation.customId === 'cancel') {
                    await confirmation.update({ content: 'Ban has been cancelled', components: [] });
                }
            } catch (e) {
                console.log("Error in ban", e);
                await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
            }

		}catch(error){
			console.error("\nError in Servers.js: " + error);
		}
	},
};