// Invite bot to server ;) https://discord.com/api/oauth2/authorize?client_id=1123288010197303396&permissions=8&scope=bot%20applications.commands

// Require the necessary discord.js classes
import fs 	from 'fs';
import { Client, Collection, Events, GatewayIntentBits, GuildMember } from 'discord.js';

// Load initial config
const config  = JSON.parse(fs.readFileSync('./config.json'));
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
	console.log("Normal interaction?:", interaction);
	if (!interaction.isChatInputCommand()) return;
	console.log("Is command interaction :o");

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
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, async c => {
	console.log(`Ready! Logged in as ${c.user.tag} 😎`);

	/* 
	// Fake me entering the server ;)
	const list = await client.guilds.fetch("1123286614383272078"); 
	// Iterate through the collection of GuildMembers from the Guild getting the username property of each member 
	const me = await list.members.fetch("171450453068873729");
	//console.log("member, me: ", me);
	client.emit(Events.GuildMemberAdd, me);
	*/
});

// Log in to Discord with your client's token
await client.login(config.token);

