const { Events } = require('discord.js');
// eslint-disable-next-line no-unused-vars
const { ServerConfig }              = require('../interfaces/ServerConfig.js'); // Used so VSCODE can see the properties

const evnt = {
    name: Events.MessageReactionRemove,
	async execute(reaction, user) {
		try{
            /**
             * The server config
             * @type {ServerConfig}
             */
            const serverConfig = reaction.client.serverConfigs.find(x => x.ServerId == reaction.guild.id);
            if (!serverConfig){
                console.log(`Reaction Remove: No config found for guild ${reaction.guild.id} for removing reaction.`);
                return;
            }

            console.log(`Reaction Remove: Using config of ${serverConfig.ServerName}/(${serverConfig.ServerId})`);


			if (reaction.message.id == serverConfig.MRA_MessageIdToReact){
				console.log(`Reaction Remove: Message un-reacted by ${user.id}`);

				const   member          = reaction.message.guild.members.cache.get(user.id);  // Get current member
				const   reactionRole    = await reaction.message.guild.roles.fetch(serverConfig.MRA_RoleToToggleOnReact);
				if (member.roles.cache.some(role => role.id === serverConfig.MRA_RoleToToggleOnReact)){
					await member.roles.remove(reactionRole);   // Remove
				}
			}			
		}catch(error){
			console.error("Error in messageReactionRemove.js: " + error);
		}
	},
};

module.exports = {
	evnt
}