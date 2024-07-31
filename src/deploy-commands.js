const fs            = require('fs')
const bloonUtils    = require('./utils/utils.js');
const config        = bloonUtils.getConfig();
const { REST, Routes } = require('discord.js');

const commands = [];

//#region Load Context menu commands

// Add all commands programmatically to commands array
let commandsPath = 'contextMenu';
let commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const folderRoute = `./${commandsPath}/${file}`;
	console.log(`Loading context menu command ${file}`);
	const command = require(folderRoute);
	console.log(`Loaded context menu command ${file}!`);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	commands.push(command.data.toJSON());
}

//#endregion

//#region Load Slash Commands

// Add all commands programmatically to commands array
commandsPath = 'interactions';
commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const folderRoute = `./${commandsPath}/${file}`;
	console.log(`Loading context menu command ${file}`);
	const command = require(folderRoute);
	console.log(`Loaded context menu command ${file}!`);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	commands.push(command.data.toJSON());
}

//#endregion

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application slash and context menu commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(config.clientId, config.bloonGuildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application slash and context menu commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();