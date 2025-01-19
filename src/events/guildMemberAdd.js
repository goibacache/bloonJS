const fs 			    		= require('fs');
const { EmbedBuilder } 			= require('@discordjs/builders');
const { Events } 				= require('discord.js');
const bloonUtils 				= require('../utils/utils.js');
const config 					= bloonUtils.getConfig();
const storedProcedures  		= require('../utils/storedProcedures.js');

/**
  * @typedef {import('discord.js').ModalSubmitInteraction} ModalSubmitInteraction
  * @typedef {import('discord.js').Message} Message
  * @typedef {import('discord.js').Channel} Channel
  * @typedef {import('discord.js').User} User
 */

const   fileRoute   = './localMemory/invites.bak';

const evnt = {
    name: Events.GuildMemberAdd,
	/**
	 * 
	 * @param {GuildMember} member 
	 * @returns 
	 */
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
			const generalChannel = await member.guild.channels.cache.get(config.intruderGeneralChannel) || member.guild.channels.fetch(config.intruderGeneralChannel);
			const generalMessageChannel = await generalChannel.send({ embeds: [newUserEmbed] });

			console.log(`GuildMemberAdd ${member.user.id}: Welcome message sent to general.`);

			await generalMessageChannel.react("🐴");

			const bloonsideChannel = member.guild.channels.cache.get(config.bloonsideChannel) || member.guild.channels.fetch(config.bloonsideChannel);
			await bloonsideChannel.send({ embeds: [newUserEmbed] });
			console.log(`GuildMemberAdd ${member.user.id}: Welcome message sent to bloonside.`);

			// Add message to server logs with invite code, if any.
			const cachedInvites = new Map(JSON.parse(readPreviousInvites()));
			const newInvites = await member.guild.invites.fetch({ cache: false });
			const newInvitesFormatted = newInvites.map(x => ({ code: x.code, user: x.inviterId, uses: x.uses || 0}))

			const inviteCode = newInvitesFormatted.find(newInvite => cachedInvites.get(newInvite.code) < newInvite.uses);

			// Send invite to server log
			if (inviteCode != undefined){
				const serverLogs = member.guild.channels.cache.get(config.bloonServerLogs) || member.guild.channels.fetch(config.bloonServerLogs);

				// Check if we have the invite code logged in DDBB
				const savedInviteData = await storedProcedures.invite_Get(inviteCode.code);

				let message = '';

				if (savedInviteData == null || savedInviteData.length == 0){
					message = `🗃 <@${member.user.id}> (${member.user.username}) appears to have used the invite code: \`${inviteCode.code}\``;
				}else{
					message = `🗃 <@${member.user.id}> (${member.user.username}) appears to have used the invite code \`${inviteCode.code}\` created by <@${savedInviteData[0].InviterDiscordId}> (${savedInviteData[0].InviterDiscordName})`;
				}

				message += `\nPlease take this info with a grain of salt, this info is not 100% consistent, specially if two people joined at the same time.`;

				await serverLogs.send({ content: message, allowedMentions: { parse: [] } });
			}
			
			// Finally, update the invites to the new state.
			const mapOfInvites = new Map();
            newInvites.map(x => mapOfInvites.set(x.code, x.uses || 0))
            SaveInvites(JSON.stringify(Array.from(mapOfInvites.entries())));
		}catch(error){
			console.error("Error in guildMemberAdd.js: " + error);
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

const readPreviousInvites = () => {
    // Read from file 
    if (fs.existsSync(fileRoute)){
        const data = fs.readFileSync(fileRoute, { encoding: 'utf8', flag: 'r' });
        return data;
    }else{
        // It's just 0
        return 0;
    }
}

module.exports = {
	evnt
}