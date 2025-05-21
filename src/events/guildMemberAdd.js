const { EmbedBuilder } 			= require('@discordjs/builders');
const { Events } 				= require('discord.js');
// eslint-disable-next-line no-unused-vars
const { ServerConfig }          = require('../interfaces/ServerConfig.js'); // Used so VSCODE can see the properties

/**
  * @typedef {import('discord.js').ModalSubmitInteraction} ModalSubmitInteraction
  * @typedef {import('discord.js').Message} Message
  * @typedef {import('discord.js').Channel} Channel
  * @typedef {import('discord.js').User} User
  * @typedef {import('discord.js').GuildMember} GuildMember
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

            console.log(`GuildMemberAdd: Using config of ${serverConfig.ServerName} (${serverConfig.ServerId})`);

            // (1) Assign role on join
            if (serverConfig.GMA_RoleOnJoin){
                const joinRole = await member.guild.roles.fetch(serverConfig.GMA_RoleToAssignOnJoin); // Lookup the "agent" role
                if (joinRole != null){
                    const couldAddRole = await member.roles.add(joinRole).then(() => true).catch((error) => { console.log(error); return false; });    // Assign it
                    if (couldAddRole){
                        console.log(`GuildMemberAdd: Role added for user ${serverConfig.ServerName}/${member.user.tag}.`);
                    }else{
                        console.log(`GuildMemberAdd: Could not add role for user ${serverConfig.ServerName}/${member.user.tag}.`);
                    }
                }else{
                    console.log(`GuildMemberAdd: Tried to add role for ${serverConfig.ServerName}/${member.user.tag}. Role was not found.`);
                }
            }

            // (2) Add welcome message
            if (!serverConfig.GMA_AddWelcomeMessage){
                console.log(`GuildMemberAdd: Config is setup to not to add welcome message. ${serverConfig.ServerName}/${member.user.tag}.`);
                return;
            }

            if (!serverConfig.GMA_AddWelcomeMessageChannel && !serverConfig.GMA_AddWelcomeMessageChannelBackup){
                console.log(`GuildMemberAdd: Config does not have channels to post new member message. ${serverConfig.ServerName}/${member.user.tag}.`);
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

			// Sends the embed into the main channel
            if (serverConfig.GMA_AddWelcomeMessageChannel){
                console.log(`GuildMemberAdd: Sending welcome message to main channel ${serverConfig.ServerName}/${serverConfig.GMA_AddWelcomeMessageChannel}`);
                const welcomeMessageChannel = await member.guild.channels.fetch(serverConfig.GMA_AddWelcomeMessageChannel);
                const welcomeMessageChannelMessage = await welcomeMessageChannel.send({ embeds: [newUserEmbed] });

                console.log(`GuildMemberAdd: Welcome message sent to ${serverConfig.ServerName}/${serverConfig.GMA_AddWelcomeMessageChannel}.`);

                if (serverConfig.GMA_AddWelcomeMessageEmojiReaction.length > 0){
                    console.log(`GuildMemberAdd: Reacting to welcome message on ${serverConfig.ServerName}/${serverConfig.GMA_AddWelcomeMessageEmojiReaction}`);
                    await welcomeMessageChannelMessage.react(serverConfig.GMA_AddWelcomeMessageEmojiReaction);
                }
            }

            if (serverConfig.GMA_AddWelcomeMessageChannelBackup && serverConfig.GMA_AddWelcomeMessageChannel != serverConfig.GMA_AddWelcomeMessageChannelBackup){
                const welcomeMessageBackupChannel = await member.guild.channels.fetch(serverConfig.GMA_AddWelcomeMessageChannelBackup);
                await welcomeMessageBackupChannel.send({ embeds: [newUserEmbed] });

                console.log(`GuildMemberAdd: Welcome message sent to backup channel ${serverConfig.ServerName}/${serverConfig.GMA_AddWelcomeMessageChannelBackup}.`);
            }

		}catch(error){
			console.error("Error in guildMemberAdd.js: " + error);
		}
	},
};


module.exports = {
	evnt
}