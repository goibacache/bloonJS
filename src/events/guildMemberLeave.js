const { EmbedBuilder }                          = require('@discordjs/builders');
const { Events, AuditLogEvent }                 = require('discord.js');
// eslint-disable-next-line no-unused-vars
const { ServerConfig }                          = require('../interfaces/ServerConfig.js'); // Used so VSCODE can see the properties

const evnt = {
    name: Events.GuildMemberRemove,
	/**
	 * 
	 * @param {GuildMember} member 
	 * @returns 
	 */
	async execute(member) {
		try{
            /**
             * The server config
             * @type {ServerConfig}
             */
            const serverConfig = member.client.serverConfigs.find(x => x.ServerId == member.guild.id);
            if (!serverConfig){
                console.log(`GuildMemberRemove: No config found for guild ${member.guild.id} for user ${member.user.id}.`);
				return;
            }

            //console.log(`GuildMemberRemove: Using config of ${serverConfig.ServerName} (${serverConfig.ServerId})`);

            // (1) Check if log is enabled
            if (!serverConfig.GMR_LogMemberLeave){
                console.log(`GuildMemberRemove: Config is setup to not to add leave message. ${serverConfig.ServerName}/${member.user.tag}.`);
                return;
            }

            if (!serverConfig.GMR_LogMemberLeaveChannel && !serverConfig.GMR_LogMemberLeaveChannelBackup){
                console.log(`GuildMemberRemove: Config does not have channels to post member leave message. ${serverConfig.ServerName}/${member.user.tag}.`);
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

            let action = "left";

			// Was the user kicked?
			if (kickLog?.targetId === member.id){
				action = "was kicked";
			}

			// Was the user banned?
			if (banLog?.targetId === member.id){
				action = "was banned";
			}

			// Left message
			const 	avatarURL		= member.user.avatarURL();
			const 	dateJoined 		= new Date(member.joinedTimestamp).toDateString();

			// Creates the embed
			const newUserEmbed = new EmbedBuilder()
			.setColor(0x000000)
			.setTitle(`🚪 User ${action} | ${member.user.username}`)
			.setThumbnail(avatarURL)
			.setTimestamp()
			.setDescription(`**ID:** ${member.user.id}\n**Tag**: <@!${member.user.id}>`)
			.setFooter({ text: `User joined: ${dateJoined}` });

			// If it isn't a kick nor a ban, send the message to main and backup
            if (serverConfig.GMR_LogMemberLeaveChannel){
                console.log(`GuildMemberRemove: Sending leave message to main channel ${serverConfig.ServerName}/${serverConfig.GMA_AddWelcomeMessageChannel}`);
                const mainLeaveChannel = await member.guild.channels.fetch(serverConfig.GMR_LogMemberLeaveChannel);
                await mainLeaveChannel.send({ embeds: [newUserEmbed] });
                console.log(`GuildMemberRemove: Leave message sent to ${serverConfig.ServerName}/${serverConfig.GMR_LogMemberLeaveChannel}.`);
            }

            if (serverConfig.GMR_LogMemberLeaveChannelBackup && serverConfig.GMR_LogMemberLeaveChannel != serverConfig.GMR_LogMemberLeaveChannelBackup){
                console.log(`GuildMemberRemove: Sending leave message to backup channel ${serverConfig.ServerName}/${serverConfig.GMR_LogMemberLeaveChannelBackup}`);
                const backupLeaveChannel = await member.guild.channels.fetch(serverConfig.GMR_LogMemberLeaveChannelBackup);
                await backupLeaveChannel.send({ embeds: [newUserEmbed] });
                console.log(`GuildMemberRemove: Leave message sent to backup channel ${serverConfig.ServerName}/${serverConfig.GMR_LogMemberLeaveChannelBackup}.`);
            }
		}catch(error){
			console.error("Error in guildMemberLeave.js: " + error);
		}
	},
};

module.exports = {
	evnt
}