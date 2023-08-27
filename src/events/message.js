const bloonUtils        = require('../utils/utils.js');
const config            = bloonUtils.getConfig();

const regexs            = require('../messageRegexs.js');
const storedProcedures  = require('../utils/storedProcedures.js');
const { Events }        = require('discord.js');


const   commands            = [".rule34"];
let     messageCount        = 1;
let     messageCountTrigger = 1000;

const evnt = {
    name: Events.MessageCreate,
	async execute(message) {
        try {
            // // Check if it mentions bloon, if it does, check if they have the answer in the database
            if (message.mentions.users.some(x => x.id == config.clientId)){
                // Regex to split the question.
                const re = new RegExp(/who('s|.is).(.*)\?/g);
                const messageSplit = message.content.toLowerCase().split(re);

                if (messageSplit.length > 2){ // it has an user to look for
                    const userToFind = messageSplit[2].replace(/ /g, '');
                    // Not empty
                    if (userToFind.length == 0){
                        return;
                    }

                    // Check response and that it exists
                    const response = await storedProcedures.kofi_GetKofiPhrase(userToFind);
                    console.log("who is response:", response[0].phrase);
                    if (response.length == 0 || response[0].phrase.length == 0){
                        return;
                    }

                    await message.reply({ content: response[0].phrase});
                }
            }

            // Avoid replying to itself
            if (message.author.id === config.clientId){
                return;
            }

            // Check if the message is NOT on PUG and count, if it gets to the message count trigger, then "spam"
            if (!isInChannel(message, config.pugChannel)){
                messageCount++;

                if (messageCount > messageCountTrigger){
                    console.log(`Spam sent to intruder general: ${messageCount}`);
                    messageCount = 1;
                    const channel = message.guild.channels.cache.get(config.intruderGeneralChannel) || message.guild.channels.fetch(config.intruderGeneralChannel);
                    await channel.send({ content: `You want to have your custom answer for bloon? Support the development and get yours by clicking [here](https://ko-fi.com/bloon/commissions)` });
                }
            }
            
            
            // All messages should be lower case to be processed
            message.content = message.content.toLowerCase();

            // Handle regexs replies in the general / help & map making channels
            if (isInChannel(message, config.intruderGeneralChannel) || isInChannel(message, config.intruderHelpChannel) || isInChannel(message, config.intruderMapmakingChannel) || isInChannel(message, config.pugChannel) ) {
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
        } catch (error) {
            console.log(`Error in message.js: ${error}`);
        }
	},
};

function isInChannel(message, channel){
    return message.channelId == channel;
}


module.exports = {
    evnt
}