//const { EmbedBuilder } = require('@discordjs/builders');
const fs 			    = require('fs');
const { Events } 		= require('discord.js');
const bloonUtils 		= require('../utils/utils.js');
const config 			= bloonUtils.getConfig();
const storedProcedures  = require('../utils/storedProcedures.js');

/**
  * @typedef {import('discord.js').Invite} Invite
 */

const fileRoute   = './localMemory/invites.bak';

const evnt = {
    name: Events.InviteCreate,
	/**
	 * 
	 * @param {Invite} invite 
	 * @returns 
	 */
	async execute(invite) {
		try{
			if (invite.guild.id != config.bloonGuildId){
				console.log(`InviteCreate ${invite.inviterId} is not inviting the same guild as the bot.\nBloon's Guild: ${config.bloonGuildId} != ${invite.guild.id}`);
				return;
			}

			const bloonServerLogs = await invite.guild.channels.fetch(config.bloonServerLogs);
			
			// Send in server logs
			const message = `🗃 new invite code \`${invite.code}\` by <@${invite.inviterId}> (${invite.inviter.username}) with ${invite.maxUses == 0 ? 'infinity uses' : invite.maxUses + " max uses"} for channel <#${invite.channelId}>. Expires at: ${ invite.expiresTimestamp == null ? 'never': `<t:${invite.expiresTimestamp}:F>`}`;
			await bloonServerLogs.send({ content: message, allowedMentions: { parse: [] }});

			// Save in DDBB
			await storedProcedures.invite_Insert(invite.code, invite.guild.id, invite.inviterId, invite.inviter.username, invite.channelId, invite.expiresAt, invite.maxUses);
			console.log(`new invite ${invite.code} saved in DDBB`);

			// Get all invites
            const allInvites = await invite.guild.invites.fetch({ cache: false });
            const mapOfInvites = new Map();
            allInvites.map(x => mapOfInvites.set(x.code, x.uses || 0))
            SaveInvites(JSON.stringify(Array.from(mapOfInvites.entries())));
		}catch(error){
			console.error("Error in inviteCreate.js: " + error);
		}
	},
};

/**
 * Saves the invite list to local memory
 * @param {*} invites 
 */
const SaveInvites = (invites) => {
    fs.writeFileSync(fileRoute, invites+""); // Write new value
}

module.exports = {
	evnt
}