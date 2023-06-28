// Imports
import fs 	from 'fs';
import { Client, Collection, Events, GatewayIntentBits, GuildMember } from 'discord.js';
import { config } from './config.js';
import * as bloonUtils from './utils/utils.js'
import * as readline from 'readline';

// Load initial config
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] }); // Create a new client instance
client.commands = new Collection(); // Command handler list

//#region interactions
// Import all interactions programmatically 
const commandsPath = 'interactions';
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const folderRoute = `./${commandsPath}/${file}`;
	const command = await import(folderRoute);
	console.log(`Loading module ${file}`);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	client.commands.set(command.cmd.data.name, command.cmd);
}

// Check interactions 
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

//#endregion

//#region events
// Import all events programmatically 
const eventsPath = 'events';
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const eventFile of eventFiles) {
	const folderRoute = `./events/${eventFile}`;
	const event = await import(folderRoute);
	console.log(`Loading event ${eventFile} - ${event.evnt.name}`);

	if (event.once) {
		client.once(event.evnt.name, (...args) => event.evnt.execute(...args));
	} else {
		client.on(event.evnt.name, (...args) => event.evnt.execute(...args));
	}
}

//#endregion

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, async c => {
	console.log(`Ready! Logged in as ${c.user.tag} 😎`);

	while (1 == 1){
		const command = await askQuestion("BLOON V6 console> ");
		handleCommands(command, client);
	}
});

// Log in to Discord with your client's token
await client.login(config.token);

//#region functions
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

async function handleCommands(command, client) {
	
	try{
		if (command.trim().length == 0){
			return;
		}

		// Command: Say
		if (command.startsWith("say")){
			var text  = bloonUtils.getQuotedText(command);
			if (!text){
				console.log("Say> No text command was found")
				return;
			} 

			let args = command.split(" ");

			if (args.length < 4){
				console.log(`Say> command needs at least 4 inputs. ie: 'say [guildid/0] [channelid/0] "[text]"'`);
				return;
			}
	
			if (text.length == 0){
				console.log("Say> Can't send an empty message'");
				return;
			}
	
			const guild = await client.guilds.fetch(args[1] == 0 ? config.bloonTestingGuildId : args[1] == 0);
			const channel = await guild.channels.fetch(args[2] == 0 ? config.intruderGeneralChannel : args[2] == 0);
			console.log("sending text: " + text.replace(/\"/g, ""));
			channel.send(text.replace(/\"/g, ""));
		}
	}catch(error){
		console.error(`\nError in command: ${error}`);
	}
}
//#endregion