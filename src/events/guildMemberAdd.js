const { EmbedBuilder } = require('@discordjs/builders');
const { Events } = require('discord.js');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

const evnt = {
    name: Events.GuildMemberAdd,
	async execute(member) {
		try{
			if (member.guild.id != config.bloonGuildId){
				console.log(`GuildMemberAdd ${member.user.id} is not joining the same guild as the bot.\nBloon's Guild: ${config.bloonGuildId} != ${member.guild.id}`);
				return;
			}
			
			// 28/02/2024 removed due to security concerns. Agent role will be added on first message.
			/*
			console.log(`GuildMemberAdd ${member.user.id}: Adding role...`);
			const agentRole = await member.guild.roles.fetch(config.role_Agent); // Lookup the "agent" role
			member.roles.add(agentRole);    // Assign it
			console.log(`GuildMemberAdd ${member.user.id}: Role added.`);
			*/

			// Welcome message
			const avatarURL		= member.user.avatarURL();
			const dateJoined 	= new Date(member.user.createdAt).toDateString();
			const createdToday 	= new Date(member.user.createdAt).toDateString() == new Date().toDateString(); // Check if account was created the same day!

			// Creates the embed
			const newUserEmbed = new EmbedBuilder()
			.setColor(createdToday ? 0xFF9900 : 0x0099FF)
			.setTitle(`New User Joined | ${member.user.username}`)
			.setThumbnail(avatarURL)
			.setTimestamp()
			.setDescription(`**ID:** ${member.user.id}\n**Tag**: <@!${member.user.id}>`)
			.setFooter({ text: `Account Created: ${dateJoined}` });

			// Sends the embed into the General channel.
			console.log(`GuildMemberAdd ${member.user.id}: Sending welcome message...`);
			const generalChannel = member.guild.channels.cache.get(config.intruderGeneralChannel) || member.guild.channels.fetch(config.intruderGeneralChannel);
			generalChannel.send({ embeds: [newUserEmbed] });

			console.log(`GuildMemberAdd ${member.user.id}: Welcome message sent to general.`);

			const bloonsideChannel = member.guild.channels.cache.get(config.bloonsideChannel) || member.guild.channels.fetch(config.bloonsideChannel);
			bloonsideChannel.send({ embeds: [newUserEmbed] });
			console.log(`GuildMemberAdd ${member.user.id}: Welcome message sent to bloonside.`);

			
		}catch(error){
			console.error("Error in guildMemberAdd.js: " + error);
		}
	},
};

module.exports = {
	evnt
}