const { Events, AuditLogEvent }     = require('discord.js');
// eslint-disable-next-line no-unused-vars
const { ServerConfig }              = require('../interfaces/ServerConfig.js'); // Used so VSCODE can see the properties

const evnt = {
    name: Events.GuildMemberUpdate,
	/**
	 * 
	 * @param {GuildMember} oldMember 
	 * @param {GuildMember} member 
	 * @returns 
	 */
	async execute(oldMember, member) {
		try{

			if (member.user.bot) return;
			if (oldMember == null || member == null) return;
			if (oldMember.nickname == null) return; // was before the bot was loaded?
			if (oldMember.nickname == member.nickname) return; // Same name, don't care.

            /**
             * The server config
             * @type {ServerConfig}
             */
            const serverConfig = member.client.serverConfigs.find(x => x.ServerId == member.guild.id);
            if (!serverConfig){
                console.log(`GuildMemberUpdate: No config found for guild ${member.guild.id} for user ${member.user.id}.`);
				return;
            }

            //console.log(`GuildMemberUpdate: Using config of ${serverConfig.ServerName} (${serverConfig.ServerId})`);

            // (1) Check if log is enabled
            if (!serverConfig.GMU_LogNicknameChanges){
                console.log(`GuildMemberUpdate: Config is setup to not to log nickname changes. ${serverConfig.ServerName}/${member.user.tag}.`);
                return;
            }

            if (!serverConfig.GMU_LogNicknameChangesChannel && !serverConfig.GMU_LogNicknameChangesChannelBackup){
                console.log(`GuildMemberUpdate: Config does not have channels to post nickname changes. ${serverConfig.ServerName}/${member.user.tag}.`);
                return;
            }

			console.log(`GuildMemberUpdate: Name updated from ${oldMember.nickname} to ${member.nickname}`);

			// Fetch a couple audit logs than just one as new entries could've been added right after this event was emitted.
			const fetchedLogs = await member.guild.fetchAuditLogs({
				limit: 6,
				type: AuditLogEvent.GuildMemberUpdate
			}).catch(console.error);

			const auditEntry = fetchedLogs.entries.find(a =>
				// Small filter function to make use of the little information discord provides to narrow down the correct audit entry.
				a.target.id === member.id &&
				// Ignore entries that are older than 20 seconds to reduce false positives.
				Date.now() - a.createdTimestamp < 20000
			);

			let modUser = null;
			// If entry exists, grab the user that changed the nickname if none, display 'Unknown'. 
			if (auditEntry != null){
				modUser = auditEntry.executor.id != auditEntry.target.id ? auditEntry.executor : null;
			}

			const wasItAMod = modUser != null ? `by third-party <@${modUser.id}> (${modUser.username}) ` : "";

			const textDecorator = "```";

            // Main channel
            if (serverConfig.GMU_LogNicknameChangesChannel){
                const mainChannel = await member.guild.channels.fetch(serverConfig.GMU_LogNicknameChangesChannel);
                /**
                 * The guild object
                 * @type {Message}
                 */
                await mainChannel.send({ 
                    content: `📛 New nickname change ${wasItAMod}of <@${member.id}> (${member.user.username})\n\n_Old name_:${textDecorator}${oldMember.nickname ?? '[Default nickname]'}${textDecorator}\n_New name_:${textDecorator}${member.nickname ?? '[Default nickname]'}${textDecorator}\n\n`, 
                    allowedMentions: { parse: [] }
                });
            }

            // Backup
            if (serverConfig.GMU_LogNicknameChangesChannelBackup && serverConfig.GMU_LogNicknameChangesChannel != serverConfig.GMU_LogNicknameChangesChannelBackup){
                const backupChannel = await member.guild.channels.fetch(serverConfig.GMU_LogNicknameChangesChannelBackup);
                /**
                 * The guild object
                 * @type {Message}
                 */
                await backupChannel.send({ 
                    content: `📛 New nickname change ${wasItAMod}of <@${member.id}> (${member.user.username})\n\n_Old name_:${textDecorator}${oldMember.nickname ?? '[Default nickname]'}${textDecorator}\n_New name_:${textDecorator}${member.nickname ?? '[Default nickname]'}${textDecorator}\n\n`, 
                    allowedMentions: { parse: [] }
                });
            }
		}catch(error){
			console.error("Error in GuildMemberUpdate.js: " + error);
		}
	},
};

module.exports = {
	evnt
}