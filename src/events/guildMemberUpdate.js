const { Events, GuildMember, AuditLogEvent, Message } = require('discord.js');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

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
			if (member.guild.id != config.bloonGuildId){
				console.log(`GuildMemberUpdate ${member.user.id} is not updating on the same guild as the bot.\nBloon's Guild: ${config.bloonGuildId} != ${member.guild.id}`);
				return;
			}

			if (member.user.bot) return;
			if (oldMember == null || member == null) return;
			if (oldMember.nickname == null) return; // was before the bot was loaded?
			if (oldMember.nickname == member.nickname) return; // Same name, don't care.

			console.log(`GuildMemberUpdate: Name updated from ${oldMember.nickname} to ${member.nickname}`)

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

			const channel = member.guild.channels.cache.get(config.bloonServerLogs);
			/**
             * The guild object
             * @type {Message}
             */
			await channel.send({ 
				content: `📛 New nickname change ${wasItAMod}of <@${member.id}> (${member.user.username})\n\n_Old name_:${textDecorator}${oldMember.nickname ?? '[Default nickname]'}${textDecorator}\n_New name_:${textDecorator}${member.nickname ?? '[Default nickname]'}${textDecorator}\n\n`, 
				allowedMentions: { parse: [] }
			});
			
		}catch(error){
			console.error("Error in GuildMemberUpdate.js: " + error);
		}
	},
};

module.exports = {
	evnt
}