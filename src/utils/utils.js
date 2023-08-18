const { EmbedBuilder } = require('@discordjs/builders');
const { AttachmentBuilder } = require('discord.js')
const https = require('https');
const { registerFont, createCanvas, Image } = require('canvas');

//#region initialization

const maxRoomsForEmbed = 10;

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

/**
 * Creates the embeded message for current rooms. Beware, Embed descriptions are limited to 4096 characters.
 * @param {rooms.data from intruder https://api.intruderfps.com/rooms} rooms 
 * @returns 
 */
const createRoomEmbed = (rooms) => {
    const roomEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`Current Server Information`)
    .setURL("https://intruderfps.com/rooms")
    .setTimestamp();

    // How many left
    let roomsLeftOut = rooms.length - maxRoomsForEmbed;
    let totalPlayersOnlist = 0;
    rooms.map(x => totalPlayersOnlist += x.agentCount);

    // just do the max amount of them.
    if (rooms.length > maxRoomsForEmbed+1){
        rooms = rooms.slice(0, maxRoomsForEmbed);
    }

    // Create description with the code tag.
    let description =  "";
    let title = `Listed ${rooms.length} rooms`;

    // Rooms left, only if they're
    if (roomsLeftOut > 0){
        description = `There's ${roomsLeftOut} more rooms online.\n`;
        title = "Listed 10 rooms";
    }

    // Close the code tag
    roomEmbed.addFields(
        { name: title,  value: description }
    );

    const extensions = `<:chrome:1125641298213339167> [**Chrome**](https://chrome.google.com/webstore/detail/intruder-notifications/aoebpknpfcepopfgnbnikaipjeekalim) | [**Firefox**](https://addons.mozilla.org/en-US/firefox/addon/intruder-notifications/) <:firefox:1125641317565857833>`;
    roomEmbed.addFields({ name: "Browser Extensions", value: extensions });

    roomEmbed.setFooter({ text: `SuperbossGames | #current-server-info | Total Agents: ${totalPlayersOnlist}` });
    
    return roomEmbed;
}

// Canvas config
const width     = 640;
const height    = 475;
const titleBoxWidth = 160;
const titleBoxHeight = 50;
const bottomTablePadding = 105;
const baseYPosition = 65;
const columnsPositionX = [90, 530, 600];
const distanceBetweenColumns = 33;

const setupCanvas = () => {

    // Register font
    registerFont('./assets/ShareTechMono-Regular.ttf', { family: 'Share Tech Mono' })

    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx    = canvas.getContext('2d');

    // Create bg gradient
    const grd_bg = ctx.createRadialGradient(height/2,width/2,50,200,height,width);
    grd_bg.addColorStop(0,"#263138");
    grd_bg.addColorStop(1,"#212930");

    // Create divider gradient
    const grd_divider = ctx.createLinearGradient(30, 0, width-60, 0);
    grd_divider.addColorStop(0,     "#263138");
    grd_divider.addColorStop(0.5,   "#63676A");
    grd_divider.addColorStop(1,     "#263138");

    // Create title gradient
    const grd_title = ctx.createLinearGradient(0, 0, 0, titleBoxHeight);
    for (let i = 0; i <= 30; i++) {
        if (i % 2 == 0){
            grd_title.addColorStop(i/30, "#939596");
        }else{
            grd_title.addColorStop(i/30, "#6d6f73");
        }
    }

    // Fill with gradient
    ctx.fillStyle = grd_bg;
    ctx.fillRect(0, 0, width, height);

    // Title place
    ctx.fillStyle = grd_title;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(titleBoxWidth, 0);
    ctx.lineTo(titleBoxWidth-30, titleBoxHeight);
    ctx.lineTo(0, titleBoxHeight);
    ctx.closePath();
    ctx.fill();

    // The table BG
    ctx.fillStyle = "#263138";
    ctx.fillRect(20, 60, width-40, height-bottomTablePadding)

    // The table Border
    ctx.strokeStyle = "#FFFFFF";
    ctx.strokeRect(20, 60, width-40, height-bottomTablePadding);

    // Last, the window Border
    ctx.strokeStyle = "#FFFFFF";
    ctx.strokeRect(1, 1, width-2, height-2);

    //#endregion

    //#region draw canvas text

    // Draw texts:
    ctx.font = '20px "Share Tech Mono"'; // set font
    ctx.fillStyle = "white";

    // Title
    ctx.fillStyle = "#383838";
    ctx.textAlign = "start";
    ctx.textBaseline = "hanging";
    ctx.fillText("> SERVERS", 20, 15);
    
    // Table Header
    ctx.fillStyle = "#BBBBBB";
    ctx.textAlign = "end";
    ctx.fillText("Region",                                       columnsPositionX[0], baseYPosition);
    ctx.fillText("Name                                    ",     columnsPositionX[1], baseYPosition);
    ctx.fillText(hardTruncateOrComplete("Agents", 7), columnsPositionX[2], baseYPosition);

    // First separation
    ctx.fillStyle = grd_divider;
    ctx.fillRect(30, baseYPosition + distanceBetweenColumns*0.75, width-60, 2);

    return canvas;
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
 * Gets the actuall configuration file needed
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
    let count = 0;
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
    createRoomEmbed,
    setupCanvas,
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
