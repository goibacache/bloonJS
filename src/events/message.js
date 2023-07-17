const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const regexs = require('../messageRegexs.js');
const { Events } = require('discord.js');



const commands  = [".rule34"];

const evnt = {
    name: Events.MessageCreate,
	async execute(message) {
        // All messages should be lower case to be procesed
        message.content = message.content.toLowerCase();

        // Not reply to itself
        if (message.author.id === config.clientId){
            console.log("Not replying to itself");
            return;
        }

        // Handle regexs replies in the general / help & mapmaking channels
        if (isInChannel(message, config.intruderGeneralChannel) || isInChannel(message, config.intruderHelpChannel) || isInChannel(message, config.intruderMapmakingChannel) ) {
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
        if (commands.includes(message.content.trim()) && !isInChannel(message, config.offTopicChannel)){
            message.react("🚫");        // React
            return;
        }

        // .rule34
        if (message.content === ".rule34" && isInChannel(message, config.offTopicChannel)) {
            message.react("💦");                                                        // React
            message.reply({ content: 'https://www.youtube.com/watch?v=gb8wRhHZxNc' });  // Answer accordingly
            return;
        }
	},
};

function isInChannel(message, channel){
    return message.channelId == channel;
}


module.exports = {
    evnt
}