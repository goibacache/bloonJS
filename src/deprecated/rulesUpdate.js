const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

/**
 * Only internal SBG use
 */
module.exports = {
    public: false,
	cooldown: 0,
	data: new SlashCommandBuilder()
		.setName('updaterules')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers | PermissionFlagsBits.AttachFiles)
        .setDMPermission(false)
		.setDescription(`Updates the rules to the new version`),
	async execute(interaction) {
		try{
            console.log(`\nrulesUpdate.js: ${interaction.member.id}`);

            await interaction.deferReply({ ephemeral: true }); // This makes it so it can take more than 3 seconds to reply.

            const rulesAndInfoEmbed = bloonUtils.createRulesAndInfoEmbed();
            const guild = await interaction.client.guilds.fetch(config.bloonGuildId);
            const channel = await guild.channels.fetch(config.rulesAndInfoChannel);
            if (!channel) { 
                await interaction.editReply( { content: `Couldn't find rule's channel`, ephemeral: true} );  	// Reply
                return;
            }
            const message = await channel.messages.fetch(config.rulesMessageId);
            if (!message) { 
                await interaction.editReply( { content: "Couldn't find rule's message", ephemeral: true} );  	// Reply
                return; 
            }
            await message.edit({ embeds: [rulesAndInfoEmbed] });
            await interaction.editReply( { content: `Rules have been updated!`, ephemeral: true} );  	// Reply
		}catch(error){
            const answer = { content: 'There was an error in /updatenews, sorry.', ephemeral: true };
            
			if (interaction.deferred && !interaction.replied) {
                await interaction.editReply(answer);
            } else if (interaction.deferred && interaction.replied) {
                await interaction.followUp(answer);
            } else {
                await interaction.reply(answer);
            }

			console.error(`\nError in news.js for ID ${interaction.member.id}: ` + error);
		}
	},
};