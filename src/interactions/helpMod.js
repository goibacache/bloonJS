const { SlashCommandBuilder, PermissionFlagsBits, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require('discord.js')
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const storedProcedures = require('../utils/storedProcedures.js');

module.exports = {
    cooldown: 0,
	data: new SlashCommandBuilder()
		.setName('helpmod')
		.setDescription(`displays the help for the Mods`)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers | PermissionFlagsBits.AttachFiles)
        .setDMPermission(false),
	async execute(interaction) {
        try{
            const helpEmbed = bloonUtils.createModHelpEmbed();
            await interaction.reply({ embeds: [helpEmbed], ephemeral: true});
        }catch(error){
            await interaction.reply({ content: `There was an error in the /helpmod command, sorry.`, ephemeral: true});
            console.error(`\nError in helpMod.js for ID ${interaction.member.id}: ` + error);
        }
	},
};