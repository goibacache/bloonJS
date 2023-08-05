const { EmbedBuilder } = require('@discordjs/builders');
const { Events } = require('discord.js');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

const evnt = {
    name: Events.GuildMemberAdd,
	async execute(member) {
		try{
			if (member.guild.id != config.bloonGuildId){
				console.log(`\nGuildMemberAdd ${member.user.id} is not joining the same guild as the bot.\nBloon's Guild: ${config.bloonGuildId} != ${member.guild.id}`);
				return;
			}
			
			console.log(`\nGuildMemberAdd ${member.user.id}: Adding role...`);
			const agentRole = await member.guild.roles.fetch(config.role_Agent); // Lookup the "agent" role
			member.roles.add(agentRole);    // Assign it
			console.log(`\nGuildMemberAdd ${member.user.id}: Role added.`);

			// Welcome message
			const avatarURL		= member.user.avatarURL();
			const dateJoined 	= new Date(member.user.createdAt).toDateString();
			const createdToday 	= new Date(member.user.createdAt).toDateString() == new Date().toDateString();

			// Check if account was created the same day!

			// Creates the embed
			const newUserEmbed = new EmbedBuilder()
			.setColor(createdToday ? 0xFF9900 : 0x0099FF)
			.setTitle(`New User Joined | ${member.user.username}`)
			.setThumbnail(avatarURL)
			.addFields(
				{ name: 'ID', value: member.user.id, inline: true }
			)
			.setTimestamp()
			.setFooter({ text: `Account Created: ${dateJoined}` });

			// Sends the embed into the General channel.
			console.log(`\nGuildMemberAdd ${member.user.id}: Sending welcome message...`);
			const channel = member.guild.channels.cache.get(config.intruderGeneralChannel) || member.guild.channels.fetch(config.intruderGeneralChannel);
			channel.send({ embeds: [newUserEmbed] });
			console.log(`\nGuildMemberAdd ${member.user.id}: Welcome message sent.`);
		}catch(error){
			console.error("\nError in guildMemberAdd.js: " + error);
		}
	},
};

module.exports = {
	evnt
}