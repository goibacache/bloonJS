const { SlashCommandBuilder, PermissionFlagsBits, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require('discord.js')
const { EmbedBuilder } = require('@discordjs/builders');


module.exports = {
    cooldown: 0,
	data: new SlashCommandBuilder()
		.setName('helpmod')
		.setDescription(`displays the help for the Mods`)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers | PermissionFlagsBits.AttachFiles)
        .setDMPermission(false),
	async execute(interaction) {
        try{
            const helpEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Bloon Mods commands`)
            .setTimestamp();
        
            helpEmbed.addFields(
                { name: '/moderationaction timeout',        value: `Timeouts an user and creates a log in the evidence channel. The amount of time a user is timed out can be set as an optional parameter, if not set manually, the time out will last 10 minutes.` },
                { name: '/moderationaction warn',           value: `Warns an user with a DM from bloon and creates a log in the evidence channel. If you don't want to send a DM from bloon, consider making a note and warning the user yourself.` },
                { name: '/moderationaction kick',           value: `Kicks an user and creates a log in the evidence channel. If the offending user receives a DM from bloon explaining the kick reason can be set as  an optional parameter, by default it's set to off.` },
                { name: '/moderationaction ban',            value: `Bans an user and creates a log in the evidence channel. If the offending user receives a DM from bloon explaining the ban reason can be set as  an optional parameter, by default it's set to off.` },
                { name: '/moderationaction unban',          value: `Lifts a ban from an user and leaves a record in the evidence channel` },
            );

            await interaction.reply({ embeds: [helpEmbed], ephemeral: true});
        }catch(error){
            await interaction.reply({ content: `There was an error in the /helpmod command, sorry.`, ephemeral: true});
            console.error(`\nError in helpMod.js for ID ${interaction.member.id}: ` + error);
        }
	},
};