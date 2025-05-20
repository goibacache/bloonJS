//const fs 			    		= require('fs');
const { EmbedBuilder } 			= require('@discordjs/builders');
const { Events } 				= require('discord.js');
//const bloonUtils 				= require('../utils/utils.js');
//const config 					= bloonUtils.getConfig();
//const storedProcedures  		= require('../utils/storedProcedures.js');

//const { ServerConfig } = require('../interfaces/ServerConfig.js');

/**
  * @typedef {import('discord.js').ModalSubmitInteraction} ModalSubmitInteraction
  * @typedef {import('discord.js').Message} Message
  * @typedef {import('discord.js').Channel} Channel
  * @typedef {import('discord.js').User} User
  * @typedef {import('discord.js').GuildMember} GuildMember
  * @typedef {import('../interfaces/ServerConfig.js')} ServerConfig
 */

//const   fileRoute   = './localMemory/invites.bak';

const evnt = {
    name: Events.GuildMemberAdd,
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
                console.log(`GuildMemberAdd: No config found for guild ${member.guild.id} for user ${member.user.id}.`);
				return;
            }

            console.log(`GuildMemberAdd: Using config of ${serverConfig.ServerId}`);

            if (!serverConfig.GMA_AddWelcomeMessage){
                console.log(`GuildMemberAdd: Config is setup to not to add welcome message. Guild ${member.guild.id} - User ${member.user.id}.`);
                return;
            }

			// 28/02/2024 removed due to security concerns. Agent role will be added on first message.
			/*
			console.log(`GuildMemberAdd ${member.user.id}: Adding role...`);
			const agentRole = await member.guild.roles.fetch(config.role_Agent); // Lookup the "agent" role
			member.roles.add(agentRole);    // Assign it
			console.log(`GuildMemberAdd ${member.user.id}: Role added.`);
			*/

            if (serverConfig.GMA_AddWelcomeMessageChannel.length == 0 && serverConfig.GMA_AddWelcomeMessageChannelBackup.length == 0){
                console.log(`GuildMemberAdd: Config does not have channels to post new member message. Guild ${member.guild.id} - User ${member.user.id}.`);
                return;
            }

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
			console.log(`GuildMemberAdd: Sending welcome message to first channel ${member.user.id}`);
			const welcomeMessageChannel = await member.guild.channels.fetch(serverConfig.GMA_AddWelcomeMessageChannel+"");
			const welcomeMessageChannelMessage = await welcomeMessageChannel.send({ embeds: [newUserEmbed] });

			console.log(`GuildMemberAdd: ${member.user.id}: Welcome message sent to ${serverConfig.GMA_AddWelcomeMessageChannel}.`);

			const welcomeMessageBackupChannel = await member.guild.channels.fetch(serverConfig.GMA_AddWelcomeMessageChannelBackup+"");
			await welcomeMessageBackupChannel.send({ embeds: [newUserEmbed] });

			console.log(`GuildMemberAdd: Welcome message sent to backup channel ${serverConfig.GMA_AddWelcomeMessageChannelBackup}.`);

            if (serverConfig.GMA_AddWelcomeMessageEmojiReaction.length > 0){
                console.log(`Reacting to welcome message with ${serverConfig.GMA_AddWelcomeMessageEmojiReaction}`);
                await welcomeMessageChannelMessage.react(serverConfig.GMA_AddWelcomeMessageEmojiReaction);
            }

		}catch(error){
			console.error("Error in guildMemberAdd.js: " + error);
		}
	},
};

module.exports = {
	evnt
}