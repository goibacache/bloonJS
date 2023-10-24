const bloonUtils        = require('../utils/utils.js');
const config            = bloonUtils.getConfig();

const regexs            = require('../messageRegexs.js');
const storedProcedures  = require('../utils/storedProcedures.js');
const { Events }        = require('discord.js');


const   commands            = [".rule34"];
let     messageCount        = 1;
const   messageCountTrigger = 2000;
const   spamMessages = [
    `Want to support Bloon's development?\nWant to also have your custom answer when people ask bloon about you?\nYou can do both by clicking [here](https://ko-fi.com/bloon/commissions)`,
    `You can join the "looking to play" role using the \`/ltp\` command. That way you'll get alerted when people create a server and want you to join!`,
    `You can check all of the available commands using the \`/help\` command.`
];

const evnt = {
    name: Events.MessageCreate,
	async execute(message) {
        try {

            // Avoid replying to itself
            if (message.author.id === config.clientId){
                return;
            }

        
            // Regex to split the question.
            const re = new RegExp(/who('s|.is).(.*)\?/g);
            const messageSplit = message.content.toLowerCase().split(re);

            if (messageSplit.length > 2){ // it has an user to look for
                const userToFind = messageSplit[2].replace(/ /g, '').trim();
                // Not empty
                if (userToFind.length == 0){
                    return;
                }

                // Check response and that it exists
                const response = await storedProcedures.kofi_GetKofiPhrase(userToFind.replace(/’/g, "'"));
                if (response.length == 0 || response[0].phrase.length == 0){
                    console.log(`response not found for question: ${userToFind}`);
                    return;
                }

                // Check if it has a local attachment
                const reg = RegExp(/\[att:.*\]/g);
                let attachmentName = response[0].phrase.match(reg);

                // Instantly send message and exit
                if (attachmentName == null || attachmentName.length == 0){
                    console.log("who is response:", response[0].phrase);
                    await message.reply({ content: response[0].phrase });
                    return; // Kill process
                }

                // If there's an attachment:
                attachmentName = attachmentName[0].replace('[att:', '').replace(']', '');
                const attachmentLocalDir = `./assets/attachments/${attachmentName}`;

                // Clean response
                response[0].phrase = response[0].phrase.replace(reg, '');

                console.log("who is response:", response[0].phrase);
                console.log("who is attachment:", attachmentLocalDir);
                
                await message.reply({ content: response[0].phrase, files: [{
                    attachment: attachmentLocalDir,
                    name: attachmentName
                 }] });
                 return; // Kill process
            }

            // Check if the message is NOT on PUG and count, if it gets to the message count trigger, then "spam"
            if (!isInChannel(message, config.pugChannel)){
                messageCount++;

                if (messageCount > messageCountTrigger){
                    console.log(`Spam sent to intruder general: ${messageCount}`);
                    messageCount = 1;
                    const channel = message.guild.channels.cache.get(config.intruderGeneralChannel) || message.guild.channels.fetch(config.intruderGeneralChannel);
                    await channel.send({ content: getRandomSpamMessage() });
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

function getRandomSpamMessage(){
    const messageIndex = Math.floor(Math.random() * spamMessages.length);
    return spamMessages[messageIndex];
}


module.exports = {
    evnt
}