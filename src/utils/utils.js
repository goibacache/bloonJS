const https = require('https');


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
    Timeout:    { name: 'Timeout',  id: 1, conjugation: "Timeout",  color: 0x00DD00   }, // name & value used for options | colors: Green
    Kick:       { name: 'Kick',     id: 2, conjugation: "Kicked",   color: 0xDDDD00   }, // name & value used for options | colors: Yellow
    Ban:        { name: 'Ban',      id: 3, conjugation: "Banned",   color: 0xDD0000   }, // name & value used for options | colors: Red
    Warn:       { name: 'Warn',     id: 4, conjugation: "Warned",   color: 0x000000   }, // name & value used for options | colors: Black
    Unban:      { name: 'Unban',    id: 5, conjugation: "Unbanned", color: 0xFFFFFF   },  // name & value used for options | colors: White
    Note:       { name: 'Note',     id: 5, conjugation: "Noted",    color: 0xFFFFFF   }  // name & value used for options | colors: White
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
}
