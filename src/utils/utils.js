const { EmbedBuilder } = require('@discordjs/builders');
const https = require('https');

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

    // just do the max ammount of them.
    if (rooms.length > maxRoomsForEmbed+1){
        rooms = rooms.slice(0, maxRoomsForEmbed);
    }

    // Create description with the code tag.
    let description =  "";
    description     += `\`Re\` | \`${truncateOrComplete("Name")}\` | \`Agents\`\n`;

    // Rooms
    rooms.forEach((room, index) => {
        if (index > maxRoomsForEmbed) return;

        const emojiFlag = regionsToEmojis[room.region];
        description += `${emojiFlag == undefined ? "❓" : emojiFlag} | \`${truncateOrComplete(deleteTagsFromText(room.name.trim()))}\` | \`[${room.agentCount.toString().padStart(2)}/${room.maxAgents.toString().padStart(2)}]\`\n`;
    });

    // Rooms left, only if they're
    if (roomsLeftOut > 0){
        description += `\nAnd ${roomsLeftOut} more rooms.\n`    
    }

    // Close the code tag
    //description += "";

    roomEmbed.addFields(
        { name: '\u200B',  value: description }
    );

    const extensions = `<:chrome:1125641298213339167> [**Chrome**](https://chrome.google.com/webstore/detail/intruder-notifications/aoebpknpfcepopfgnbnikaipjeekalim) | [**Firefox**](https://addons.mozilla.org/en-US/firefox/addon/intruder-notifications/) <:firefox:1125641317565857833>`;
    roomEmbed.addFields({ name: "Browser Extensions", value: extensions });

    roomEmbed.setFooter({ text: `SuperbossGames | #current-server-info | Total Agents: ${totalPlayersOnlist}` });
    
    return roomEmbed;
}

const createHelpEmbed = () => {
    const helpEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`Bloon commands`)
    .setTimestamp();

    helpEmbed.addFields(
        { name: '/news',                        value: 'add yourself to the "News" role so you can be notified when something important is going on!' },
        { name: '/ltp',                         value: 'add yourself to the "Looking to play" role so you can be notified when a new server is up!' },
        { name: '/pug',                         value: 'add yourself to the "Pick up games" role so you can be notified when new PUG game is being set up!' },
        { name: '/wiki',                        value: 'search directly in the wiki for a specified article, if found, it will be posted as an answer for everyone to see!' },
        { name: '/help',                        value: 'shows this message so you know which commands are available!' },
        { name: '/servers',                     value: 'list the top 10 servers available in the game!' },
    );
    
    return helpEmbed;
}

const createModHelpEmbed = () => {
    const helpEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`Bloon Mods commands`)
    .setTimestamp();

    helpEmbed.addFields(
        { name: '/moderationaction timeout',        value: `Timeouts an user and creates a log in the evidence channel. The amount of time a user is timed out can be set as an optional parameter, if not set manually, the time out will last 10 minutes.` },
        { name: '/moderationaction warn',           value: `Warns an user with a DM from bloon and creates a log in the evidence channel. If you don't want to send a DM from bloon, consider making a note and warning the user yourself.` },
        { name: '/moderationaction kick',           value: `Kicks an user and creates a log in the evidence channel. If the offending user receives a DM from bloon explaining the kick reason can be set as  an optional parameter, by default it's set to off.` },
        { name: '/moderationaction ban',            value: `Bans an user and creates a log in the evidence channel. If the offending user receives a DM from bloon explaining the ban reason can be set as  an optional parameter, by default it's set to off.` },
        { name: '/moderationaction unban',          value: `Lifts a ban from an user and leaves a record in the evidence channel` },
    );
    


    return helpEmbed;
}

const createModerationActionEmbed = (moderationAction, actedUponMember, caseId, reason, handledBy, attachmentUrl) => {
    const banEmbed = new EmbedBuilder()
    .setColor(moderationAction.color)
    .setTitle(`${moderationAction.name}: Case #${caseId}`)
    .setTimestamp();

    if (attachmentUrl != null && attachmentUrl.length > 0){
        banEmbed.setImage(attachmentUrl)
    }

    // console.log("createModerationActionEmbed > actedUponMember", actedUponMember);

    banEmbed.addFields(
        { name: `User ${moderationAction.conjugation}:`,  value: `**${actedUponMember.displayName ?? actedUponMember.username}**\n${actedUponMember.id}`, inline: true },
        { name: 'Handled by:',  value: `**${handledBy.displayName}**\n${handledBy.id}`, inline: true },
        { name: `${moderationAction.name} reason:`,  value: reason, inline: false },
    );


    return banEmbed;
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

const truncateOrComplete = (text) => {
    const maxLength = 28; // Mobile size defines this.
    text = text.padEnd(maxLength); // Max is 28, fixed.
    if (text.length > maxLength){
        text = text.substr(0, maxLength-3) + "...";
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
    createRoomEmbed,
    createModerationActionEmbed,
    createHelpEmbed,
    createModHelpEmbed,
    getQuotedText,
    deleteTagsFromText,
    getRunArgs,
    getConfig,
    moderationActions,
    moderationActionsToChoices,
    capitalizeFirstLetter
}
