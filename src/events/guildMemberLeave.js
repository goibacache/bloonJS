const { EmbedBuilder } = require('@discordjs/builders');
const { Events, AuditLogEvent } = require('discord.js');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

const evnt = {
    name: Events.GuildMemberRemove,
	async execute(member) {
		try{
			if (member.guild.id != config.bloonGuildId){
				console.log(`GuildMemberRemove ${member.user.id} is not leaving the same guild as the bot.\nBloon's Guild: ${config.bloonGuildId} != ${member.guild.id}`);
				return;
			}

			// Check logs!
			const kickedLog = await member.guild.fetchAuditLogs({
				type: AuditLogEvent.MemberKick,
				limit: 1
			});
			const kickLog = kickedLog.entries.first();

			const bannedLog = await member.guild.fetchAuditLogs({
				type: AuditLogEvent.MemberBanAdd,
				limit: 1
			});
			const banLog = bannedLog.entries.first();

			// Was the user kicked?
			if (kickLog?.targetId === member.id){
				return; // Do nothing
			}

			// Was the user banned?
			if (banLog?.targetId === member.id){
				return; // Do nothing
			}

			// Left message
			const 	avatarURL		= member.user.avatarURL();
			const 	dateJoined 		= new Date(member.joinedTimestamp).toDateString();

			// Creates the embed
			const newUserEmbed = new EmbedBuilder()
			.setColor(0x000000)
			.setTitle(`🚪 User left | ${member.user.username}`)
			.setThumbnail(avatarURL)
			.setTimestamp()
			.setDescription(`**ID:** ${member.user.id}\n**Tag**: <@!${member.user.id}>`)
			.setFooter({ text: `User joined: ${dateJoined}` });

			// If it isn't a kick nor a ban, send the message to bloonside
			console.log(`GuildMemberLeave ${member.user.id}: Sending leaving message...`);
			const channel = member.guild.channels.cache.get(config.bloonsideChannel) || member.guild.channels.fetch(config.bloonsideChannel);
			channel.send({ embeds: [newUserEmbed] });
			console.log(`GuildMemberLeave ${member.user.id}: Leave message sent.`);
			
		}catch(error){
			console.error("Error in guildMemberLeave.js: " + error);
		}
	},
};

module.exports = {
	evnt
}