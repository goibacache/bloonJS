// eslint-disable-next-line no-unused-vars
const { Events, ReactionManager, GuildMember, PermissionFlagsBits } = require('discord.js');
// eslint-disable-next-line no-unused-vars
const { ServerConfig }              = require('../interfaces/ServerConfig.js'); // Used so VSCODE can see the properties

const evnt = {
    name: Events.MessageReactionAdd,
    /**
     * 
     * @param {ReactionManager} reaction 
     * @param {GuildMember} user 
     * @returns 
     */
	async execute(reaction, user) {
		try{

            /**
             * The server config
             * @type {ServerConfig}
             */
            const serverConfig = reaction.client.serverConfigs.find(x => x.ServerId == reaction.guild.id);
            if (!serverConfig){
                console.log(`Reaction Add: No config found for guild ${reaction.guild.id} for adding reaction.`);
                return;
            }

            console.log(`Reaction Add: Using config of ${serverConfig.ServerName}/(${serverConfig.ServerId})`);

            if (serverConfig.MRA_RoleToToggleOnReact && serverConfig.MRA_MessageIdToReact){
                if (reaction.message.id == serverConfig.MRA_MessageIdToReact){
                    console.log(`Reaction Add: Message reacted by ${user.id}`);

                    const   member      = reaction.message.guild.members.cache.get(user.id);  // Get current member
                    const   reactionRole    = await reaction.message.guild.roles.fetch(serverConfig.MRA_RoleToToggleOnReact);
                    if (!member.roles.cache.some(role => role.id === serverConfig.MRA_RoleToToggleOnReact)){
                        await member.roles.add(reactionRole);      // Add
                    }
                }	
            }
					
            if (serverConfig.MRA_RemoveReactionsOnModerationThreads){
                // Is this message in a moderation thread?
                const channelName = reaction.message.channel.name;
                if (channelName.toLowerCase().includes("moderation for user id: ")){
                    const moderatedPerson = channelName.substring(24); // removes "Moderation for User ID: "

                    /**
                     * @type GuildMember
                     */
                    const userWhoReacted = await reaction.message.guild.members.fetch(user);
                    const isMod = userWhoReacted.permissions.has(PermissionFlagsBits.BanMembers);

                    if (!(isMod || reaction.users.cache.some(x => x == moderatedPerson))){ // Not the moderated person, not a bot (bloon) and not a mod.
                        await reaction.users.remove(user.id);
                        console.log(`Non allowed person added reaction on ${channelName}, deleting.`);
                    }
                }
            }
		}catch(error){
			console.error("Error in messageReactionAdd.js: " + error);
		}
	},
};

module.exports = {
	evnt
}