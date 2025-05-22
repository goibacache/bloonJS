const { Events, Guild } = require('discord.js');
// eslint-disable-next-line no-unused-vars
const { ServerConfig }  = require('../interfaces/ServerConfig.js'); // Used so VSCODE can see the properties
const { Deploy } = require('../deploy-commands.js');

const evnt = {
    name: Events.GuildCreate,
	/**
	 * 
	 * @param {Guild} guild 
	 * @returns 
	 */
	async execute(guild, onlyPublicCommands = true) {
		try{
            console.log(`Joined guild: ${guild.id}, deploying commands...`);
            Deploy(guild.id, onlyPublicCommands);
		}catch(error){
			console.error("Error in GuildCreate.js: " + error);
		}
	},
};


module.exports = {
	evnt
}