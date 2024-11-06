const bloonUtils        = require('../utils/utils.js');
const config            = bloonUtils.getConfig();
const fs 			    = require('fs');

/**
 * @typedef {Object} change
 * @property { GuildManager } guild;
 */

const   fileRoute   = './localMemory/invites.bak';

/**
 * Called at start to re-load invites
 */
const evnt = {
    name: "invitesUpdate",
    /**
     * 
     * @param {Client} client 
     */
	async execute(client) {
        try{
            // Load channel and guild
            const guild = await client.guilds.fetch(config.bloonGuildId);

            // Get all invites
            const allInvites = await guild.invites.fetch({ cache: false });
            const mapOfInvites = new Map();
            allInvites.map(x => mapOfInvites.set(x.code, x.uses || 0))
            SaveInvites(JSON.stringify(Array.from(mapOfInvites.entries())));
        }catch(error){
            console.error(`Error in invitesUpdate.js: ${error}`);
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