import fs 	from 'fs';
import { REST, Routes } from 'discord.js';

// Import config
const config  = JSON.parse(fs.readFileSync('./config.json'));

const commands = [];

// Add all commands programaticly to commands array
const commandsPath = 'interactions';
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const folderRoute = `./${commandsPath}/${file}`;
	const command = await import(folderRoute);
	console.log(`Loading module ${file}`);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	commands.push(command.cmd.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(config.clientId, config.guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();