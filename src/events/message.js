const bloonUtils        = require('../utils/utils.js');
const config            = bloonUtils.getConfig();

const regexs            = require('../messageRegexs.js');
const storedProcedures  = require('../utils/storedProcedures.js');
// eslint-disable-next-line no-unused-vars
const { Events, GuildMember, Message, TextChannel, PermissionsBitField }        = require('discord.js');
// eslint-disable-next-line no-unused-vars
const { ServerConfig }              = require('../interfaces/ServerConfig.js'); // Used so VSCODE can see the properties
let     messageCount        = [];
const   spamMessages = [
    `Want to support Bloon's development?\nWant to also have your custom answer when people ask bloon about you?\nYou can do both by clicking [here](https://ko-fi.com/bloon/commissions)`,
    `You can join the "looking to play" role using the \`/ltp\` command. That way you'll get alerted when people create a server and want you to join!`,
    `You can check all of the available commands using the \`/help\` command.`,
    `The developer of this bot really likes pizza. You can help him buy one if you also really enjoy pizza, [here](<https://ko-fi.com/bloon>).`
];
const regWhoIs = new RegExp(/who('s|.is|.are).(.*)\?/g);
const regAttch = RegExp(/\[att:.*\]/g);
const regSpam = /\+(<![[:digit:]])?18(>![[:digit:]])??|\b18\b|\bnude?3?s?5?\b|\bna?4?ke?3?d\b|\bnitro\b|\bfre?3?e?3?\b|\bnft\b|\broblox\b|\bstea?4?m\b|\bdi?l?1?sco?0?rd(?!.com\/channels\/)\b|\ba?4?dul?1?ts?\b|cry?l?i?1?pto?0?\b|\bpro?0?mo?0?\b|\bbtc\b|\bo?0?nly ?fa?4?ns\b|@everyone\b|\bte?3?e?3?ns?\b|\ble?3?a?4?ks?\b|\bgift\b|[0-9]\$|\$[0-9]/gi;
const regUrl = /(https?:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{1,6}\b([-a-zA-Z@:%_+.~#?&//=]*)?/gi;

const evnt = {
    name: Events.MessageCreate,
    /**
     * 
     * @param {Message} message 
     * @returns 
     */
	async execute(message) {
        try {
            if (message.author.id === config.clientId || message.author.bot){
                return;
            }

            /**
             * The server config
             * @type {ServerConfig}
             */
            const serverConfig = message.client.serverConfigs.find(x => x.ServerId == message.guild.id);
            if (!serverConfig){
                console.log(`Message: No config found for guild ${message.guild.id} for message.`);
                return;
            }

            console.log(`Message: Using config of ${serverConfig.ServerName} (${serverConfig.ServerId})`);

            // All messages should be lower case to be processed
            message.content = message.content.toLowerCase();

            // #region M_UseRegexSPAMProtection
            // Check if AntiSpam is enabled
            if (serverConfig.M_UseRegexSPAMProtection && serverConfig.M_RegexSPAMProtectionChannel){
                // Check if it's spam or +18 - Instantly delete if it mentions everyone && the user doesn't have the mod/hiddenManager/aug role
                if (message.content.match(regSpam)?.length > 1){ 
                    // and if it has an URL or mentions everyone (and it's not tenor.com)
                    if ((message.content.match(regUrl)?.length > 0 || message.mentions.everyone) && !message.content.includes('tenor.com')){ // exclude tenor.com to avoid false positives
                        console.log("SPAM FILTER: Message appears to be spam based on the SpamRegex & contains an URL or mentions everyone");

                        // Check if it's a mod or a hidden manager
                        /**
                         * The guild object
                         * @type {GuildMember}
                         */
                        const userWhoMentionedEveryone = await message.guild.members.fetch(message.author.id);
                        const userHasBanPermissions = userWhoMentionedEveryone.permissions.has(PermissionsBitField.Flags.BanMembers)
                        if (userHasBanPermissions) {
                            console.log(`SPAM FILTER: Message was sent by trusted user.\nMessage: ${message.content}`)
                        }else{
                            // Delete, send message to mod channel and timeout user for 5 minutes
                            console.log("SPAM FILTER: Message from random (not that one) user, deleting.");
                            console.log(`SPAM FILTER: Deleted message: ${message.content}`);

                            const couldDelete = await message.delete().then(() => true).catch(() => false);
                            const couldTimeOut = await userWhoMentionedEveryone.timeout(5 * 60 * 1000).then(() => true).catch((error) => { console.log(error); return false; } ); // 5 minutes.

                            const messageResume = bloonUtils.getTextAndAttachmentsFromMessage(message);
                            /**
                             * @type { TextChannel }
                             */
                            const alertsChannel = await message.guild.channels.fetch(serverConfig.M_RegexSPAMProtectionChannel);
                            /**
                             * @type { Message }
                             */
                            await alertsChannel.send({
                                content: `🧐 It seems to me that the user <@${userWhoMentionedEveryone.id}> (${userWhoMentionedEveryone.user.tag}) is a compromised account. ${couldDelete ? 'The message was deleted' : 'The message couldn\'t be deleted'} ${couldTimeOut ? 'and the account was timed out for 5 minutes 🔥' : 'but the account couldn\'t be timed out 😭'}  for posting the following: ${messageResume}`,
                                embeds: []
                            });

                            return;
                        }
                    }
                }
            }

            //#endregion

            //#region On first message and no AGENT role, assign it.      
            if (serverConfig.M_AssignRoleOnMessage && serverConfig.M_RoleToAssignOnMessage){
                const member = message.member;

                // Check if the user already has the "Agent" role, if it doesn't add it.
                if (!member.roles.cache.some(role => role.id === serverConfig.M_RoleToAssignOnMessage)){
                    console.log(`${serverConfig.ServerName}/${member.user.tag}'s first message! Adding agent role`);
                    await member.roles.add(serverConfig.M_RoleToAssignOnMessage);      // Add
                }
            }
            
            //#endregion

            // #whoIs Question checks
            if (serverConfig.M_MessageRegexWhoIs){
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
            }

            if (serverConfig.M_SBGFaq){
                // Handle regexs replies in the general / help & map making channels
                if (isInMultipleChannels(message, serverConfig.M_SBGFaqValidChannels)) {
                    for (const reg of regexs) {
                        if(reg.regex.test(message)){
                            await message.reply(reg.answer); // Answer accordingly
                            return; // Stop the foreach
                        }
                    }
                }
            }
            

            // Check if it gets to the message count trigger, then "spam"
            if (serverConfig.M_SendSpamAfterMessages && serverConfig.M_SendSpamAfterMessagesChannel){
                if (messageCount[serverConfig.ServerId] == null){
                    messageCount[serverConfig.ServerId] = 0;
                }

                messageCount[serverConfig.ServerId]++;

                if (messageCount[serverConfig.ServerId] > serverConfig.M_QuantityOfMessagesAfterSpam){
                    console.log(`Message: Spam sent to general channel: ${serverConfig.ServerName}/${serverConfig.ServerId}`);
                    messageCount[serverConfig.ServerId] = 1;
                    const channel = await message.guild.channels.fetch(serverConfig.M_SendSpamAfterMessagesChannel);
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

function isInMultipleChannels(message, comaSeparatedChannels){

    const channels = comaSeparatedChannels.split(',');

    for (const channel of channels) {
        if (isInChannel(message, channel)){
            return true;
        }
    }

    return false;
}

function getRandomSpamMessage(){
    const messageIndex = Math.floor(Math.random() * spamMessages.length);
    return spamMessages[messageIndex];
}


module.exports = {
    evnt
}