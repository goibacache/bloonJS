const bloonUtils = require('../utils/utils.js');
const regexs = require('../messageRegexs.js');
const { Events } = require('discord.js');
const config = require('../config.js');

const commands  = [".ltp", ".pug", ".servers"]

const evnt = {
    name: Events.MessageCreate,
	async execute(message) {
        // All messages should be lower case to be procesed
        message.content = message.content.toLowerCase();

        // Handle regexs replies in the main channel
        if (isInGeneralChannel(message)){
            regexs.forEach(reg => {
                if(reg.regex.test(message)){
                    message.reply(reg.answer); // Answer accordingly
                }

                return; // Stop the foreach
            });
        }
        
        // Doesn't include a command.
        if (!commands.includes(message.content.trim())){
            return;
        }

        // Includes a command but not in the right channel.
        if (commands.includes(message.content.trim()) && !isInBloonCommandsChannel(message)){
            message.react("🚫");        // React
            return;
        }

        // .ltp
		if (message.content === commands[0]) {
            try{
                const member  = message.guild.members.cache.get(message.author.id);  // Get current member
                const ltpRole = await message.guild.roles.fetch(config.role_LookingToPlay);
                const npRole  = await message.guild.roles.fetch(config.role_NowPlaying);

                // Check if the user already has "looking to play"
                if (member.roles.cache.some(role => role.id === config.role_LookingToPlay || role.id === config.role_NowPlaying)){
                    await member.roles.remove(ltpRole);   // Remove
                    await member.roles.remove(npRole);    // Remove
                }else{
                    await member.roles.add(ltpRole);      // Add
                }
                message.react("👍");                      // React
            }catch(error){
                message.react("🙈"); // React with error
                console.error("Error assigning role: "+ error)
            }
        }

        // .pug
		if (message.content === commands[1]) {
            try{
                const member = message.guild.members.cache.get(message.author.id);  // Get current member
                const pugRole = await message.guild.roles.fetch(config.role_Pug);

                // Check if the user already has "PUG Player"
                if (member.roles.cache.some(role => role.id === config.role_Pug)){
                    await member.roles.remove(pugRole);   // Remove
                }else{
                    await member.roles.add(pugRole);      // Add
                }
                message.react("👍");                // React
            }catch(error){
                message.react("🙈"); // React with error
                console.error("Error assigning role: "+ error)
            }
        }

        // .servers
		if (message.content === commands[2]) {

            bloonUtils.getHHTPResult("https://api.intruderfps.com/rooms")
            .then(rooms => {
                rooms.data.sort(function(a, b){
                    return b.agentCount - a.agentCount;
                });

                message.react("👍");                // React

                const roomEmbed = bloonUtils.createRoomEmbed(rooms.data);
                message.reply({ embeds: [roomEmbed]})

            }).catch(error => {
                message.react("🙈"); // React with error
                console.error("Error loading servers: "+ error)
            });
        }
	},
};

function isInBloonCommandsChannel(message){
    return message.channelId == config.bloonCommandsChannel;
}

function isInGeneralChannel(message){
    return message.channelId == config.intruderGeneralChannel;
}

module.exports = {
    evnt
}