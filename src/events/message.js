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

        // .rule34
        if (message.content === ".rule34" && isInOffTopicChannel(message)) {
            message.react("💦");                                                        // React
            message.reply({ content: 'https://www.youtube.com/watch?v=gb8wRhHZxNc' });  // Answer accordingly
            return;
        }

        // Includes a command but not in the right channel.
        if (commands.includes(message.content.trim()) && !isInBloonCommandsChannel(message)){
            message.react("🚫");        // React
            return;
        }
	},
};

function isInBloonCommandsChannel(message){
    return message.channelId == config.bloonCommandsChannel;
}

function isInOffTopicChannel(message){
    return message.channelId == config.offTopicChannel;
}

function isInGeneralChannel(message){
    return message.channelId == config.intruderGeneralChannel;
}

module.exports = {
    evnt
}