const bloonUtils        = require('../utils/utils.js');
const config            = bloonUtils.getConfig();

const regexs            = require('../messageRegexs.js');
const storedProcedures  = require('../utils/storedProcedures.js');
// eslint-disable-next-line no-unused-vars
const { Events, GuildMember, Message, TextChannel }        = require('discord.js');


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
const regSpam = /\+?18\+?|\b18\b|\bnude?3?s?5?\b|\bna?4?ke?3?d\b|\bnitro\b|\bfre?3?e?3?\b|\bnft\b|\broblox\b|\bstea?4?m\b|\bdi?l?1?sco?0?rd(?!.com\/channels\/)\b|\ba?4?dul?1?ts?\b|cry?l?i?1?pto?0?\b|\bpro?0?mo?0?\b|\bbtc\b|\bo?0?nly ?fa?4?ns\b|@everyone\b|\bte?3?e?3?ns?\b|\ble?3?a?4?ks?\b/gi;
const regUrl = /(https?:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/gi;

const agentRole = config.role_Agent;

const evnt = {
    name: Events.MessageCreate,
    /**
     * 
     * @param {Message} message 
     * @returns 
     */
	async execute(message) {
        try {
            if (message.guildId != config.bloonGuildId) return;
            // Avoid replying to itself and bots
            if (message.author.id === config.clientId || message.author.bot){
                return;
            }

            // All messages should be lower case to be processed
            message.content = message.content.toLowerCase();

            // Check if it's spam or +18 - Instantly delete if it mentions everyone && the user doesn't have the mod/hiddenManager/aug role
            if (message.content.match(regSpam)?.length > 1 || message.mentions.everyone){
                console.log("SPAM FILTER: Message appears to be spam");
                // and if it has an URL then kill it
                if (message.content.match(regUrl)?.length > 0 || message.mentions.everyone){
                    console.log("SPAM FILTER: Message contains URL or mentions everyone");

                    // Check if it's a mod or a hidden manager
                    /**
                     * The guild object
                     * @type {GuildMember}
                     */
                    const userWhoMentionedEveryone = await message.guild.members.fetch(message.author.id);
                    const isMod = userWhoMentionedEveryone.roles.cache.filter(x => x == config.role_Mod).size > 0;
                    const isHiddenManager = userWhoMentionedEveryone.roles.cache.filter(x => x == config.role_HiddenManager).size > 0
                    const isAug = userWhoMentionedEveryone.roles.cache.filter(x => x == config.role_Aug).size > 0
                    //if (!(isMod || isHiddenManager || isAug)){
                    if (isMod || isHiddenManager || isAug) {
                        console.log(`SPAM FILTER: Message was sent by trusted user.\nMessage: ${message.content}`)
                    }else{
                        // Delete, send message to mod channel and timeout user for 1 minute
                        console.log("SPAM FILTER: Message from random (not that one) user, deleting.");
                        console.log(`SPAM FILTER: Deleted message: ${message.content}`);

                        const messageResume = bloonUtils.getTextAndAttachmentsFromMessage(message);

                        await message.delete();
                        await userWhoMentionedEveryone.timeout(1 * 60 * 1000); // 1 minute.
                        

                        /**
                         * @type { TextChannel }
                         */
                        const modChatChannel = await message.guild.channels.fetch(config.alertsChannel);
                        /**
                         * @type { Message }
                         */
                        await modChatChannel.send({
                            content: `🧐 It seems to me that the user <@${userWhoMentionedEveryone.id}> is a compromised account. The account was timed out for 1 minute 🔥 for posting the following: ${messageResume}`,
                            embeds: []
                        });

                        return;
                    }
                }
            }

            // After SPAM check:
            
            // On first message and no AGENT role, assign it.
            const member = message.member;

            // Check if the user already has the "Agent" role, if it doesn't add it.
            if (!member.roles.cache.some(role => role.id === agentRole)){
                console.log(`${member.user.tag}'s first message! Adding agent role`);
                await member.roles.add(agentRole);      // Add
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

            // Handle regexs replies in the general / help & map making channels
            if (isInChannel(message, config.intruderGeneralChannel) || isInChannel(message, config.intruderHelpChannel) || isInChannel(message, config.intruderMapmakingChannel) || isInChannel(message, config.pugChannel) ) {
                regexs.forEach(reg => {
                    if(reg.regex.test(message)){
                        message.reply(reg.answer); // Answer accordingly
                    }
                    return; // Stop the foreach
                });
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