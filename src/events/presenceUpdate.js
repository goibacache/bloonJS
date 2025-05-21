// eslint-disable-next-line no-unused-vars
const { Events, Presence } = require('discord.js');
// eslint-disable-next-line no-unused-vars
const { ServerConfig }              = require('../interfaces/ServerConfig.js'); // Used so VSCODE can see the properties

const evnt = {
    name: Events.PresenceUpdate,
    /**
     * 
     * @param {Presence} oldPresence 
     * @param {Presence} newPresence 
     * @returns 
     */
	async execute(oldPresence, newPresence) {
        try{
            if (oldPresence == null) return;
            if (newPresence == null) return;

            /**
             * The server config
             * @type {ServerConfig}
             */
            
            const serverConfig = oldPresence.client.serverConfigs.find(x => x.ServerId == oldPresence.guild.id);
            if (!serverConfig){
                console.log(`Presence Update: No config found for guild ${oldPresence.guild.id}`);
                return;
            }

            //console.log(`Presence Update: Using config of ${serverConfig.ServerName}/(${serverConfig.ServerId})`);
            
            if (!serverConfig.NP_EnableNowPlayingRoles && !serverConfig.NP_LookingToPlayRole && !serverConfig.NP_NowPlayingRole){
                console.log(`Presence Update: No config found for guild ${oldPresence.guild.id}`);
                return;
            }

            const userId        = newPresence.userId;
            const user          = await newPresence.guild.members.fetch(userId);

            // Check roles
            const hasLookingToPlay  = user.roles.cache.some(role => role.id === serverConfig.NP_LookingToPlayRole);
            const hasNowPlaying     = user.roles.cache.some(role => role.id === serverConfig.NP_NowPlayingRole);

            // If it's neither, then don't do anything.
            if (!hasLookingToPlay && !hasNowPlaying){
                return;
            }

            const wasPlaying    = oldPresence.activities.some(x => x.name === serverConfig.NP_ActivityName);
            const isPlaying     = newPresence.activities.some(x => x.name === serverConfig.NP_ActivityName);

            if(wasPlaying == true && !isPlaying){
                Promise.all(
                    [
                        user.roles.remove(serverConfig.NP_NowPlayingRole), 
                        user.roles.add(serverConfig.NP_LookingToPlayRole)
                    ]
                ).then(() => {
                    console.log("Presence Update: Removed now playing, added looking to play successfully");
                }).catch((error) => {
                    console.log(`Presence Update error: ${error}`);
                });
                return;
            }

            if(!wasPlaying && isPlaying){
                Promise.all(
                    [
                        user.roles.remove(serverConfig.NP_LookingToPlayRole), 
                        user.roles.add(serverConfig.NP_NowPlayingRole)
                    ]
                ).then(() => {
                    console.log("Presence Update: Removed looking to play, added now playing successfully");
                }).catch((error) => {
                    console.log(`Presence Update error: ${error}`);
                });
                return;
            }
        }catch(error){
            console.error(`\nError in nowPlaying.js for user ID ${oldPresence.userId}: ${error}`);
        }
	},
};


module.exports = {
    evnt
}