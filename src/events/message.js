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
    `You can check all of the available commands using the \`/help\` command.`,
    `The developer of this bot really likes rum. You can help him buy one if you also really enjoy rum, [here](<https://ko-fi.com/bloon>)`
];
const regWhoIs = new RegExp(/who('s|.is|.are).(.*)\?/g);
const regAttch = RegExp(/\[att:.*\]/g);
const regSpam = /\b\+18\b|\b18\b|\bnude?3?s?5?\b|\bna?4?ke?3?d\b|\bnitro\b|\bfre?3?e?3?\b|\bnft\b|\broblox\b|\bstea?4?m\b|\bdi?l?1?sco?0?rd(?!.com\/channels\/)\b|\ba?4?dul?1?ts?\b|cry?l?i?1?pto?0?\b|\bpro?0?mo?0?\b|\bbtc\b/gi;
const regUrl = /https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)?/gi;

/**
  * @typedef {import('discord.js').Message} Message
 */

const evnt = {
    name: Events.MessageCreate,
    /**
     * 
     * @param {Message} message 
     * @returns 
     */
	async execute(message) {
        try {

            // Avoid replying to itself
            if (message.author.id === config.clientId){
                return;
            }

        
            // Regex to split the question.
            const messageSplit = message.content.toLowerCase().split(regWhoIs);

            if (messageSplit.length > 2){ // it has a user to look for
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
                let attachmentName = response[0].phrase.match(regAttch);

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
                response[0].phrase = response[0].phrase.replace(regAttch, '');

                console.log("who is response:", response[0].phrase);
                console.log("who is attachment:", attachmentLocalDir);
                
                await message.reply({ content: response[0].phrase, files: [{
                    attachment: attachmentLocalDir,
                    name: attachmentName
                 }] });
                 return; // Kill process
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

            // Instantly delete if it mentions everyone && the user doesn't have the mod or aug role
            if (message.mentions.everyone){
                // Check if it's a mod or a hidden manager
                const userWhoMentionedEveryone = await message.guild.members.fetch(message.author.id);
                const isMod = userWhoMentionedEveryone.roles.cache.filter(x => x == config.role_Mod).size > 0;
                const isHiddenManager = userWhoMentionedEveryone.roles.cache.filter(x => x == config.role_HiddenManager).size > 0;
                const isAug = userWhoMentionedEveryone.roles.cache.filter(x => x == config.role_Aug).size > 0;
                if (!(isMod || isHiddenManager || isAug)){
                    console.log("SPAM FILTER: Message mentions everyone. Deleted");
                    console.log(`SPAM FILTER: Deleted message: ${message.content} by ${message.author.tag}`);
                    await message.delete();
                    return;
                }
            }

            // Check if it's spam or +18
            if (message.content.match(regSpam)?.length > 1){
                console.log("SPAM FILTER: Message appears to be spam");
                // and if it has an URL then kill it
                if (message.content.match(regUrl)?.length > 0){
                    console.log("SPAM FILTER: Message contains URL");

                    // Check if it's a mod or a hidden manager
                    const userWhoMentionedEveryone = await message.guild.members.fetch(message.author.id);
                    const isMod = userWhoMentionedEveryone.roles.cache.filter(x => x == config.role_Mod).size > 0;
                    const isHiddenManager = userWhoMentionedEveryone.roles.cache.filter(x => x == config.role_HiddenManager).size > 0
                    if (!(isMod || isHiddenManager)){
                        console.log("SPAM FILTER: Message from random (not that one) user, deleting.");
                        console.log(`SPAM FILTER: Deleted message: ${message.content}`);
                        await message.delete();
                        return;
                    }
                }
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