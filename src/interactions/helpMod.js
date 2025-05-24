const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { EmbedBuilder } = require('@discordjs/builders');


module.exports = {
    public: true,
    cooldown: 0,
	data: new SlashCommandBuilder()
		.setName('helpmod')
		.setDescription(`displays the help for the Mods`)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers | PermissionFlagsBits.AttachFiles)
        .setDMPermission(false),
	async execute(interaction) {
        try{
            console.log(`\nhelpmod.js: ${interaction.member.id}`);

            await interaction.deferReply({ ephemeral: true }); // This makes it so it can take more than 3 seconds to reply.

            const helpEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Mod commands`)
            .setTimestamp();
        
            helpEmbed.addFields(
                { name: '🧑 Right click on a user', value: `**User: Moderate**\nWill let you decide what action you want to take on a user.` },
                { name: '💬 Right click on a message', value: `**Message: Delete & Moderate**\nWill let you decide what action you want to take on a user adding the message text and attachments as the reason for the action and will also delete the selected message.\n**Message: Fast Timeout**\nWill timeout a user using the text and attachments as the reason for the action and delete the message.\n**Message: Fast Warn**\nWill warn a user using the text and attachments as the reason for the action and delete the message.` },
                // { name: '❓ Looking for the old way to user the bot? Please check this video:', value: `https://www.youtube.com/watch?v=DppjWmeFWH0` },
            );

            await interaction.editReply({ embeds: [helpEmbed], ephemeral: true});
        }catch(error){
            const answer = { content: `There was an error in the /helpmod command, sorry.`, ephemeral: true};
			
			if (interaction.deferred && !interaction.replied) {
                await interaction.editReply(answer);
            } else if (interaction.deferred && interaction.replied) {
                await interaction.followUp(answer);
            } else {
                await interaction.reply(answer);
            }

            console.error(`\nError in helpMod.js for ID ${interaction.member.id}: ` + error);
        }
	},
};