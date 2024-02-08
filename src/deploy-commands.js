const fs = require('fs')
const { REST, Routes } = require('discord.js');
const bloonUtils = require('./utils/utils.js');
const config = bloonUtils.getConfig();

const commands = [];

// Add all commands programmatically to commands array
const commandsPath = 'interactions';
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const folderRoute = `./${commandsPath}/${file}`;
	console.log(`Loading module ${file}`);
	const command = require(folderRoute);
	console.log(`Loaded module ${file}!`);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(config.clientId, config.bloonGuildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();