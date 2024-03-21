const { EmbedBuilder, ThreadAutoArchiveDuration, ChannelType } = require('discord.js');
const https = require('https');


//#region initialization

/**
 * Array of regions to their emoji equivalents
 */
const regionsToEmojis   = [];
regionsToEmojis["EU"]   = "<:eu:1125796021574844520>";
regionsToEmojis["US"]   = "<:us:1125796012263481456>";
regionsToEmojis["USW"]  = "<:us:1125796012263481456>";
regionsToEmojis["Asia"] = "<:Asia:1125796013454667787>";
regionsToEmojis["JP"]   = "<:jp:1125796026092093601>";
regionsToEmojis["AU"]   = "<:au:1125796016097083543>";
regionsToEmojis["SA"]   = "<:br:1125796009428144188> ";
regionsToEmojis["CAE"]  = "<:ca:1125796017909014579>";
regionsToEmojis["KR"]   = "<:kr:1125796028369616968>";
regionsToEmojis["IN"]   = "<:in:1125796023147704370>";
regionsToEmojis["RU"]   = "<:ru:1125796030777131078>";
regionsToEmojis["CN"]   = "<:cn:1125796020090048545>"; // Unused?

/**
 * Definition of moderation actions
 */
const moderationActions = {
    Timeout:    { name: 'Timeout',  id: 1, conjugation: "Timeout",  color: 0x00DD00, emoji: '⏰'   }, // name & value used for options | colors: Green
    Kick:       { name: 'Kick',     id: 2, conjugation: "Kicked",   color: 0xDDDD00, emoji: '🦶'   }, // name & value used for options | colors: Yellow
    Ban:        { name: 'Ban',      id: 3, conjugation: "Banned",   color: 0xDD0000, emoji: '🔥'   }, // name & value used for options | colors: Red
    Warn:       { name: 'Warn',     id: 4, conjugation: "Warned",   color: 0x000000, emoji: '⚡'   }, // name & value used for options | colors: Black
    Unban:      { name: 'Unban',    id: 5, conjugation: "Unbanned", color: 0xFFFFFF, emoji: '😇'   },  // name & value used for options | colors: White
    Note:       { name: 'Note',     id: 6, conjugation: "Noted",    color: 0xFFFFFF, emoji: '📄'   }  // name & value used for options | colors: White
};

/**
 * Used to translate Cyrillic to "standard" characters since the font don't support them
 */
const transliterate = {"Ё":"YO","Й":"I","Ц":"TS","У":"U","К":"K","Е":"E","Н":"N","Г":"G","Ш":"SH","Щ":"SCH","З":"Z","Х":"H","Ъ":"'","ё":"yo","й":"i","ц":"ts","у":"u","к":"k","е":"e","н":"n","г":"g","ш":"sh","щ":"sch","з":"z","х":"h","ъ":"'","Ф":"F","Ы":"I","В":"V","А":"A","П":"P","Р":"R","О":"O","Л":"L","Д":"D","Ж":"ZH","Э":"E","ф":"f","ы":"i","в":"v","а":"a","п":"p","р":"r","о":"o","л":"l","д":"d","ж":"zh","э":"e","Я":"Ya","Ч":"CH","С":"S","М":"M","И":"I","Т":"T","Ь":"'","Б":"B","Ю":"YU","я":"ya","ч":"ch","с":"s","м":"m","и":"i","т":"t","ь":"'","б":"b","ю":"yu"};

// #endregion

/**
 * Gets an HTTP result from any place you want and returns the result in the JSON format. 
 * If "binary" is passed as the encoding and it's an image it will return the image in base64
 * @param {string} requestURL 
 * @returns 
 */
const getHTTPResult = (requestURL, encoding = "utf8") => {
    return new Promise((resolve, reject) => {
        https.get(requestURL, {
            'encoding': encoding
        }, (res) => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];
            res.setEncoding(encoding); // Set encoding

            if (statusCode !== 200) {
                console.error('Request Failed.\n' + `Status Code: ${statusCode}`);
                // consume response data to free up memory
                res.resume();
                reject('Request Failed.\n' + `Status Code: ${statusCode}`);
            }

            const responseIsJson = /^application\/json/.test(contentType);
            const responseIsImg = /^image\/.*/.test(contentType);

            if (!responseIsJson && !responseIsImg){
                resolve();
            }

            let rawData = '';

            res.on('data', (chunk) => {
                // When it is an IMG the response are various base64buffers
                rawData += chunk;
            });            

            res.on('end', () => {
            try {

                if (responseIsJson){
                    //const parsedData = JSON.parse(rawData);
                    resolve(JSON.parse(rawData));
                }else{
                    const buffer = Buffer.from(rawData, 'binary').toString('base64');
                    resolve(`data:${contentType};base64,${buffer}`);
                }
            } catch (e) {
                reject(e.message);
            }
            });
        }).on('error', (e) => {
            reject(`Got error: ${e.message}`);
        });

    });
}

/**
 * Searches for the quoted text in a given string
 * @param {string} text 
 * @returns 
 */
const getQuotedText = (text) => {
    var re = new RegExp(/"(.*)"/g);
    var match = text.match(re);
    if (match){
        return match.toString();
    }else{
        return "";
    }
}

/**
 * Delete the ` from a text
 * @param {string} text 
 * @returns 
 */
const deleteTagsFromText = (text) => {
    text = text.replace(/`/g, `'`); // Fix the ` in room names
    return text.replace(/<(.*?)>/g, "");
}

/**
 * Deletes the code block from a text
 * @param {string} text 
 * @returns 
 */
const deleteCodeBlocksFromText = (text) => {
    return text.replace(/```/g, '');
}

/**
 * Transform from Cyrillic to "standard"
 * @param {string} string 
 * @returns 
 */
const CyrillicOrStandard = (string) => {
    return string.split('').map(function (char) { 
        return transliterate[char] || char; 
    }).join("");
}

/**
 * Returns the time played from seconds to hours
 * @param {number} timePlayed 
 * @returns 
 */
const timePlayedToHours = (timePlayed) => {
    return Math.trunc(timePlayed/3600)+"H";
}

/**
 * Helper for the server list.
 * Creates an ellipsis and the end of the text and fills the rest with padding.
 * @param {string} text 
 * @param {number} maxLength 
 * @param {number} padRight 
 * @returns 
 */
const truncateOrComplete = (text, maxLength = 28, padRight = false) => {
    text = text+""; // Transform to text, just in case.
    if (padRight){
        text = text.padStart(maxLength); // Max is 28, fixed.
    }else{
        text = text.padEnd(maxLength); // Max is 28, fixed.    
    }
    if (text.length > maxLength){
        text = text.substring(0, maxLength-3) + "...";
    }

    return text;
}

/**
 * Helper for the server list.
 * Truncates the text to the exact number, no ellipsis and fills the rest with padding
 * @param {string} text 
 * @param {number} maxLength 
 * @param {number} padRight 
 * @returns 
 */
const hardTruncateOrComplete = (text, maxLength = 28, padRight = false) => {
    text = text+""; // Transform to text, just in case.
    if (padRight){
        text = text.padStart(maxLength); // Max is 28, fixed.
    }else{
        text = text.padEnd(maxLength); // Max is 28, fixed.    
    }
    if (text.length > maxLength){
        text = text.substr(0, maxLength);
    }

    return text;
}

/**
 * Truncates the text, always, no padding.
 * @param {string} text 
 * @param {number} maxLength 
 * @returns 
 */
const hardTruncate = (text, maxLength = 28) => {
    text = text+""; // Transform to text, just in case.
    if (text.length > maxLength){
        text = text.substring(0, maxLength);
    }
    return text;
}

/**
 * Gets the args of the node execution. ie: node . test will return ["test"]
 * @returns array of args
 */
const getRunArgs = () => {
    // From the third on it's a valid arg
    if (process.argv.length <= 2){
        return ["develop"];
    }

    return process.argv.slice(2);
};

/**
 * Gets the actual configuration file needed
 * @returns require('../config.<environment>.js');
 */
const getConfig = () => {
    const args = getRunArgs();
    if (args.length == 0) return require('../config.develop.js');

    const environment = args[0];
    return require(`../config.${environment}.js`);
};

const moderationActionsToChoices = () => {
    let choices = [];
    for (const key in moderationActions){
        choices.push({
            name: moderationActions[key].name,
            value: (moderationActions[key].id-1).toString()
        });
    }

    return choices;
}

const capitalizeFirstLetter = (text) => {
    if (text.length > 1){
        return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
    }else{
        return text.charAt(0).toUpperCase();
    }
}

const groupBy = (key, array) => {
    let result = [];
    for (let i = 0; i < array.length; i++) {
        let added = false;
        for (let j = 0; j < result.length; j++) {
        if (result[j][key] == array[i][key]) {
            result[j].items.push(array[i]);
            added = true;
            break;
        }
        }
        if (!added) {
        let entry = {items: []};
        entry[key] = array[i][key];
        entry.items.push(array[i]);
        result.push(entry);
        }
    }
    return result;
}

const createRulesAndInfoEmbed = () => {
    // Load config from self.
    const config = getConfig();

    // Creates the embed parts
    const description = 
        `**1**. Be respectful, no racism or derogatory attitude\n` +
        `**2**. No NSFW/shocking/pornographic and political nature posts\n` +
        `**3**. No trolling.\n` +
        `**4**. No spamming or text abusing.\n` +
        `**5**. Do not over message/mention staff.\n` +
        `**6**. No alternate accounts to dodge moderation action.\n` +
        `**7**. Post in the correct channels.\n` +
        `**8**. Chat in English only.\n` +
        `**9**. No advertising non-Intruder content.\n` +
        `**10**. Respect the staff and follow instructions. Mods are doing their best to make a friendly environment.`;

    const roles = 
        `<@&${config.role_Developer}> : The developers of Intruder!\n` +
        `<@&${config.role_CommunityManagementTeam}> : Official staff partners working along with the developer for community management.\n` +
        `<@&${config.role_Mod}> : The amazing community volunteers assisting the team to keep the peace.\n` +
        `<@&${config.role_Aug}> : A group of serious players who engage the community.\n` +
        `<@&${config.role_Agent}> : All members of the community.`;

    const importantLinks = 
        `${config.youtubeEmoji} | [**Youtube**](https://www.youtube.com/superbossgames)\n` +
        `${config.twitterEmoji} | [**Twitter**](https://twitter.com/SuperbossGames/)\n` +
        `${config.helpraceEmoji} | [**Helprace**](https://superbossgames.helprace.com/)\n` +
        `${config.redditEmoji} | [**Reddit**](https://www.reddit.com/r/Intruder)\n` +
        `${config.twitchEmoji} | [**Twitch**](https://www.twitch.tv/superbossgames)\n` +
        `${config.discordEmoji} | [**Server Invite**](https://discord.gg/superbossgames)\n` +
        `${config.wikiEmoji} | [**Wiki**](https://wiki.superbossgames.com/)`;

    const rulesAndInfoEmbed = new EmbedBuilder()
    .setColor(0x1799b1)
    .setTitle(`**Welcome to the Official Intruders Discord server!**`)
    .setTimestamp()
    .setDescription(description)
    .setFooter({ text: `SuperbossGames Discord - #rules-and-info | Last updated ` });

    rulesAndInfoEmbed.addFields({ name: `Roles`, value: roles });

    rulesAndInfoEmbed.addFields({ name: `Important Links`, value: importantLinks });

    return rulesAndInfoEmbed;
}

const actionToEmoji = [];
actionToEmoji["Timeout"]    = "⏰";
actionToEmoji["Mute"]       = "🔉";
actionToEmoji["Kick"]       = "🦶";
actionToEmoji["Ban"]        = "🔥";
actionToEmoji["Warn"]       = "⚡";
actionToEmoji["Unban"]      = "😇";
actionToEmoji["Note"]       = "📄";


module.exports = {
    getHTTPResult,
    timePlayedToHours,
    getQuotedText,
    deleteTagsFromText,
    getRunArgs,
    getConfig,
    moderationActionsToChoices,
    capitalizeFirstLetter,
    truncateOrComplete,
    hardTruncateOrComplete,
    hardTruncate,
    CyrillicOrStandard,
    deleteCodeBlocksFromText,
    groupBy,
    createRulesAndInfoEmbed,
    moderationActions,
    createModerationActionEmbed,
    loadModerationProfileEmbeds,
    getModerationProfileEmbed,
    resolveButtonState,
    createOrFindModerationActionHelpThread,
    getTextAndAttachmentsFromMessage,
}
