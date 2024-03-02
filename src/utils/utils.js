const { EmbedBuilder } = require('discord.js');
const https         = require('https');



//#region initialization

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

const transliterate = {"Ё":"YO","Й":"I","Ц":"TS","У":"U","К":"K","Е":"E","Н":"N","Г":"G","Ш":"SH","Щ":"SCH","З":"Z","Х":"H","Ъ":"'","ё":"yo","й":"i","ц":"ts","у":"u","к":"k","е":"e","н":"n","г":"g","ш":"sh","щ":"sch","з":"z","х":"h","ъ":"'","Ф":"F","Ы":"I","В":"V","А":"A","П":"P","Р":"R","О":"O","Л":"L","Д":"D","Ж":"ZH","Э":"E","ф":"f","ы":"i","в":"v","а":"a","п":"p","р":"r","о":"o","л":"l","д":"d","ж":"zh","э":"e","Я":"Ya","Ч":"CH","С":"S","М":"M","И":"I","Т":"T","Ь":"'","Б":"B","Ю":"YU","я":"ya","ч":"ch","с":"s","м":"m","и":"i","т":"t","ь":"'","б":"b","ю":"yu"};

// #endregion

const getHHTPResult = (requestURL) => {
    return new Promise((resolve, reject) => {
        https.get(requestURL, (res) => {
            var { statusCode } = res;
            var contentType = res.headers['content-type'];

            let error;

            if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                `Status Code: ${statusCode}`);
            } else if (!/^application\/json/.test(contentType)) {
            error = new Error('Invalid content-type.\n' +
                `Expected application/json but received ${contentType}`);
            }

            if (error) {
            console.error(error.message);
            // consume response data to free up memory
            res.resume();
            }

            res.setEncoding('utf8');
            let rawData = '';

            res.on('data', (chunk) => {
            rawData += chunk;
            });

            res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                resolve(parsedData);
            } catch (e) {
                reject(e.message);
            }
            });
        }).on('error', (e) => {
            reject(`Got error: ${e.message}`);
        });

    });
}

const getQuotedText = (text) => {
    var re = new RegExp(/"(.*)"/g);
    var match = text.match(re);
    if (match){
        return match.toString();
    }else{
        return "";
    }
}

const deleteTagsFromText = (text) => {
    text = text.replace(/`/g, `'`); // Fix the ` in room names
    return text.replace(/\<(.*?)>/g, "");
}

const deleteCodeBlocksFromText = (text) => {
    return text.replace(/```/g, '');
}

const CyrillicOrStandard = (string) => {
    return string.split('').map(function (char) { 
        return transliterate[char] || char; 
    }).join("");
}

const timePlayedToHours = (timePlayed) => {
    return Math.trunc(timePlayed/3600)+"H";
}

const truncateOrComplete = (text, maxLength = 28, padRight = false) => {
    text = text+""; // Transform to text, just in case.
    if (padRight){
        text = text.padStart(maxLength); // Max is 28, fixed.
    }else{
        text = text.padEnd(maxLength); // Max is 28, fixed.    
    }
    if (text.length > maxLength){
        text = text.substr(0, maxLength-3) + "...";
    }

    return text;
}

const hardTruncate = (text, maxLength = 28) => {
    text = text+""; // Transform to text, just in case.
    if (text.length > maxLength){
        text = text.substr(0, maxLength);
    }
    return text;
}

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

const moderationActions = {
    Timeout:    { name: 'Timeout',  id: 1, conjugation: "Timeout",  color: 0x00DD00, emoji: '⏰'   }, // name & value used for options | colors: Green
    Mute:       { name: 'Timeout',  id: 1, conjugation: "Timeout",  color: 0x00DD00, emoji: '⏰'   }, // name & value used for options | colors: Green
    // Where did mute come from o.O?
    Kick:       { name: 'Kick',     id: 2, conjugation: "Kicked",   color: 0xDDDD00, emoji: '🦶'   }, // name & value used for options | colors: Yellow
    Ban:        { name: 'Ban',      id: 3, conjugation: "Banned",   color: 0xDD0000, emoji: '🔥'   }, // name & value used for options | colors: Red
    Warn:       { name: 'Warn',     id: 4, conjugation: "Warned",   color: 0x000000, emoji: '⚡'   }, // name & value used for options | colors: Black
    Unban:      { name: 'Unban',    id: 5, conjugation: "Unbanned", color: 0xFFFFFF, emoji: '😇'   },  // name & value used for options | colors: White
    Note:       { name: 'Note',     id: 6, conjugation: "Noted",    color: 0xFFFFFF, emoji: '📄'   }  // name & value used for options | colors: White
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
    getHHTPResult,
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
    moderationActions,
    deleteCodeBlocksFromText,
    actionToEmoji,
    groupBy,
    createRulesAndInfoEmbed,
}
