/*************************************************************************
	Welcome to Bloon's source code. This is it, where the magic happens.

	This source code was mainly made by @Xixo following the discordjs 
	guide right here: https://discordjs.guide/

	If you want to take this code and make your own code, go ahead!

	If you find a bug, please tell me or make a PR :^)
**************************************************************************/

// Imports
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const fs 			            = require('fs');
const bloonUtils 	            = require('./utils/utils.js');
const storedProcedures 	        = require('./utils/storedProcedures.js');
const config 		            = bloonUtils.getConfig();
const readline 		            = require('readline');
const { clearInterval }         = require('timers');
const { kofi_InsertOrUpdate }   = require('./utils/storedProcedures.js');

/**
 * @typedef {import('discord.js').TextChannel} TextChannel
 * @typedef {import('discord.js').ThreadChannel} ThreadChannel
 */

// Load initial config

const modalResponses 		= {};
const client 				= new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildMessageTyping], partials: [Partials.Channel, Partials.Reaction, Partials.Message] }); // Create a new client instance
client.events 				= new Collection(); // Events handler list
client.commands 			= new Collection(); // Command handler list
client.contextMenuCommands	= new Collection(); // Command handler list
client.cooldowns 			= new Collection();
client.serverConfigs		= new Collection();

process.noDeprecation = true; // Stops the "ExperimentalWarning"

let wikieditInterval = null;

const wikiCheckInterval = 10;

//#region import interactions
let commandsPath = 'interactions';
let commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

for (const file of commandFiles) {
	const folderRoute = `./${commandsPath}/${file}`;
	const command = require(folderRoute);
	console.log(`Loading module ${file}`);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

commandsPath = 'contextMenu';
commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

for (const file of commandFiles) {
	const folderRoute = `./${commandsPath}/${file}`;
	const command = require(folderRoute);
	console.log(`Loading context menu command ${file}`);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	client.contextMenuCommands.set(command.data.name, command);
}

commandsPath = 'modalResponse';
commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

for (const file of commandFiles) {
	const folderRoute = `./${commandsPath}/${file}`;
	const command = require(folderRoute);
	console.log(`Loading context menu command ${file}`);
	modalResponses[command.customId] = command.execute;
}



//#endregion

//#region import events
const eventsPath = 'events';
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

for (const eventFile of eventFiles) {
	const folderRoute = `./events/${eventFile}`;
	const event = require(folderRoute);
	console.log(`Loading event ${eventFile} - ${event.evnt.name}`);

	if (event.once) {
		client.once(event.evnt.name, (...args) => event.evnt.execute(...args));
	} else {
		client.on(event.evnt.name, (...args) => event.evnt.execute(...args));
	}

	client.events.set(eventFile.replace(/.js/g, '').replace(/.ts/g, ''), event.evnt.execute);
}

//#endregion

//#region handle interactions
client.on(Events.InteractionCreate, async interaction => {

	// Handle modal submission:
	if (interaction.isModalSubmit()){
		const interactionParts = interaction.customId.split('/');

		const modalResponse = modalResponses[interactionParts[0]];

		if (!modalResponse){
			console.log(`No modal response found for action ${interactionParts[0]}`);
			await interaction.deferReply({ ephemeral: true });
			await interaction.editReply({ content: `No modal response found for action ${interactionParts[0]}` });
			return;
		}
		
		await modalResponse(interaction, interaction.customId);

		return;
	}
	

	if (!(interaction.isChatInputCommand() || interaction.isContextMenuCommand() || interaction.isMessageContextMenuCommand())) return;

	let command = null;

	if (interaction.isChatInputCommand()){
		command = interaction.client.commands.get(interaction.commandName);
	}else{
		command = interaction.client.contextMenuCommands.get(interaction.commandName);
	}
	

	if (!command) {
		interaction.reply({  content: `No command or context menu command matching '${interaction.commandName}' was found.`, ephemeral: true });
		console.error(`No command or context menu command matching ${interaction.commandName} was found.`);
		return;
	}

	//#region Handle cool downs
	const { cooldowns } = client;

	if (!cooldowns.has(command.data.name)) {
		cooldowns.set(command.data.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.data.name);
	const defaultCooldownDuration = 3;
	const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

	if (timestamps.has(interaction.user.id)) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

		if (now < expirationTime) {
			const expiredTimestamp = Math.round(expirationTime / 1000);
			return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
		}
	}

	timestamps.set(interaction.user.id, now);
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
	//#endregion

	try {
		const result = await command.execute(interaction);

		// Handle "noCooldown" for when a user is advised to use the command in another channel
		if (result == "noCooldown"){
			timestamps.delete(interaction.user.id); // Deletes the timestamp immediately
		}
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

//#region handle log in
client.once(Events.ClientReady, async c => {
	console.log(`Ready! Logged in as ${c.user.tag} 😎`);

	// Every X minutes check the wiki for changes!
	wikieditInterval = setInterval(() => {
		client.emit("wikiedit", client);
	}, (wikiCheckInterval * 60) * 1000);

	// Save the invites to database
	client.emit("invitesUpdate", client);

	// Giant loop to allow input
	// eslint-disable-next-line no-constant-condition
	while (1 == 1){
		const command = await askQuestion("");
		handleCommands(command, client);
	}
});
//#endregion

// Log in to Discord with your client's token
client.login(config.token);

const loadServerConfigsAsync = async() => {
    const serverConfigs = await storedProcedures.serverConfig_Get();
    console.log(`📝 Server config: Loaded ${serverConfigs.length} server configs`);
    client.serverConfigs = serverConfigs;
}

loadServerConfigsAsync();

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
				console.log("Say> No text input was found in the command")
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
	
			const guild = await client.guilds.fetch(args[1] == 0 ? config.bloonGuildId : args[1]);
			const channel = await guild.channels.fetch(args[2] == 0 ? config.intruderGeneralChannel : args[2]);
			console.log("sending text: " + text.replace(/"/g, ""));
			channel.send(text.replace(/"/g, ""));
		}

		if (command.startsWith("reload")){
			let text  = bloonUtils.getQuotedText(command);
			if (!text){
				console.log("Reload> No text input was found in the command")
				return;
			} 

			text = text.replace(/"/g, "").toLowerCase();

			// Check commands
			const loadedCommand = client.commands.get(text);

			const commandRoute = `./interactions/${text}.js`;

			if (loadedCommand){
				client.commands.delete(loadedCommand.data.name); // Delete from command list
				delete require.cache[require.resolve(commandRoute)]; // Delete from cache
				console.log(`The command \`${text}\` was deleted from the command list!`);
			}else{
				console.log(`Command \`${text}\` was not found. Could not unloaded from the command list.`);
			}

			if (fs.existsSync(commandRoute)) {
				console.log(`\`${commandRoute}\` appears to exists!`);
				const newCommand = require(commandRoute); // Require again
				client.commands.set(newCommand.data.name, newCommand); // Add to command list
				console.log(`Command \`${newCommand.data.name}\` was loaded or reloaded!`);
			}else{
				console.log(`Command \`${text}\` was not found. Could not be loaded or reloaded.`);
			}

			return;
		}

		if (command.startsWith("fakejoin")){
			let args = command.split(" ");
			if (args.length < 2){
				console.log(`fakejoin> command needs at least 2 inputs. ie: 'fakejoin [userID].'`);
				return;
			}

			if (args[1] == "0"){
				console.log(`fakejoin> command needs a valid discord ID. ie: 'fakejoin [userID].'`);
				return;
			}

			// Fake me entering the server ;)
			const list = await client.guilds.fetch(config.bloonGuildId); 
			// Iterate through the collection of GuildMembers from the Guild getting the username property of each member 
			const whoJoined = await list.members.fetch(args[1].replace(/"/g, ""));
			//console.log("member, me: ", me);
			client.emit(Events.GuildMemberAdd, whoJoined);
			
			return;
		}

		if (command.startsWith("fakeleave")){
			let args = command.split(" ");
			if (args.length < 2){
				console.log(`fakeleave> command needs at least 2 inputs. ie: 'fakeleave [userID].'`);
				return;
			}

			if (args[1] == "0"){
				console.log(`fakeleave> command needs a valid discord ID. ie: 'fakeleave [userID].'`);
				return;
			}

			// Fake me leaving the server ;)
			const list = await client.guilds.fetch(config.bloonGuildId); 
			// Iterate through the collection of GuildMembers from the Guild getting the username property of each member 
			const whoJoined = await list.members.fetch(args[1].replace(/"/g, ""));
			//console.log("member, me: ", me);
			client.emit(Events.GuildMemberRemove, whoJoined);
			
			return;
		}

		if (command.startsWith("leave")){
			let args = command.split(" ");
			if (args.length < 2){
				console.log("Listing current servers the bot is in:");
				client.guilds.cache.forEach(guild => {
					//guild.leave()
					console.log(`${guild.id} with the name: ${guild.name}.`);
				});
				return;
			}

			const guildId = args[1];

			console.log(`trying to get guild ${guildId}`)
			const guilds = await client.guilds.fetch(guildId); 

			if (guilds.length == 0){
				console.log(`No guild found for id: ${guildId}`);
				return;
			}

			if (guilds.id == config.bloonGuildId){
				console.log(`Can't leave the main bloon guild: ${guildId}`);
				return;
			}

			console.log(`Found guild ${guilds.id} with the name: ${guilds.name}`);

			console.log("Leaving!..");

			guilds.leave();
		}

		if (command.startsWith("wiki")){
			if (wikieditInterval == null){
				console.log("wikiedit fetch started.")
				// Every X minutes check the wiki for changes!
				wikieditInterval = setInterval(() => {
					client.emit("wikiedit", client);
				}, (wikiCheckInterval * 60) * 1000);
			}else{
				console.log("wikiedit fetch stopped.")
				clearInterval(wikieditInterval);
				wikieditInterval = null;
			}
		}

		if (command.startsWith("kofi")){
			const commands = command.split(' ');

			if (commands.length < 2){
				console.log(`kofi command expects 2 parameters: kofi [new/renewal]`);
				return;
			}

			if (commands[1] == "renewal"){
				// Check it the username comes
				if (commands.length < 3){
					console.log("kofi renewal expects the username to be renewed");
					return;
				}

				await kofi_InsertOrUpdate(commands[2].toLowerCase(), '', true);
				console.log(`New kofi renwal for userName ${commands[2].toLowerCase()}`);
				return;
			}

			if (commands[1] == "new" || commands[1] == "add" || commands[1] == "update"){
				if (commands.length < 4){
					console.log("kofi renewal expects the username and the phrase to be added / updated");
					return;
				}

				var phrase  = bloonUtils.getQuotedText(command);
				await kofi_InsertOrUpdate(commands[2].toLowerCase(), phrase.replace(/"/g, ""), false);
				console.log(`New kofi answer created/updated for userName ${commands[2].toLowerCase()}`);
				return;
			}
			
		}

		if (command.startsWith("update")){
			const guild = await client.guilds.fetch(config.bloonGuildId);
			const channel = await guild.channels.fetch(config.intruderGeneralChannel);
			channel.send({ content: `**New bloon update**\n\nThis is what's new:\n\n* Added the ability to react to the news emoji and be added to the "news" role [here](<https://discord.com/channels/103933666417217536/892796013759303760/892811060413886504>).\n* Added a player stats viewer that you can use in [bloon-commands](<https://discord.com/channels/103933666417217536/934126841206308905>) with the \`/playerstats\` command. \n* You no longer need to mention bloon to answer your kofi "who is" questions.` });
		}

		if (command.startsWith("rulesPost")){
			const rulesAndInfoEmbed = bloonUtils.createRulesAndInfoEmbed();
			const guild = await client.guilds.fetch(config.bloonGuildId);
			const channel = await guild.channels.fetch(config.rulesAndInfoChannel);
			if (channel){
				channel.send({ content: ``, embeds: [rulesAndInfoEmbed] });
			}
		}
		
	}catch(error){
		console.error(`\nError in command: ${error}`);
	}
}
//#endregion

//#region Express Server

//#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('./app.js');
var debug = require('debug')('src:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(config.WEB_Port || '80');
console.log("Listening on port " + port);
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


//#endregion