const { Events } = require('discord.js');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

const activityName = "Intruder";

const evnt = {
    name: Events.PresenceUpdate,
	async execute(oldPresence, newPresence) {
        try{
            if (oldPresence == null) return;
            if (newPresence == null) return;

            const userId        = newPresence.userId;
            const user          = await newPresence.guild.members.fetch(userId);

            // Check roles
            const hasLookingToPlay  = user.roles.cache.some(role => role.id === config.role_LookingToPlay);
            const hasNowPlaying     = user.roles.cache.some(role => role.id === config.role_NowPlaying);

            // If it's neither, then don't do anything.
            if (!hasLookingToPlay && !hasNowPlaying){
                //console.log("Player has no LTP or NW role", hasLookingToPlay, hasNowPlaying);
                return;
            }

            const wasPlaying = oldPresence.activities.some(x => x.name === activityName);
            const isPlaying = newPresence.activities.some(x => x.name === activityName);

            if(wasPlaying == true && !isPlaying){
                //console.log("Player LTP");
                await user.roles.remove(config.role_NowPlaying);
                await user.roles.add(config.role_LookingToPlay);
                return;
            }

            if(!wasPlaying && isPlaying){
                //console.log("Player NP");
                await user.roles.remove(config.role_LookingToPlay);
                await user.roles.add(config.role_NowPlaying);
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