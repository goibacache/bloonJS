const { EmbedBuilder } = require('@discordjs/builders');
const { Events } = require('discord.js');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

const evnt = {
    name: Events.GuildMemberAdd,
	async execute(member) {
		try{
			console.log(`GuildMemberAdd ${member.user.id}`);
			
			const agentRole = await member.guild.roles.fetch(config.role_Agent); // Lookup the "agent" role

			member.roles.add(agentRole);    // Assign it

			// Welcome message
			const channel 		= member.guild.channels.cache.get(config.intruderGeneralChannel);
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
			channel.send({ embeds: [newUserEmbed] });
		}catch(error){
			console.error("\nError in guildMemberAdd.js: " + error);
		}
	},
};

module.exports = {
	evnt
}