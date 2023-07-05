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
    if (rooms.length > maxRoomsForEmbed){
        rooms = rooms.slice(0, maxRoomsForEmbed-1);
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

const createModerationActionEmbed = (moderationAction, bannedMember, caseId, reason, bannedBy) => {

    // Get the action name based on the sent one.
    const actionName = Object.keys(moderationActions)[moderationAction.id-1];

    const banEmbed = new EmbedBuilder()
    .setColor(0xFF0000) // Red?
    //.setColor(0xFF9900) // Yellow
    .setTitle(`${actionName}: Case #${caseId}`)
    .setTimestamp();

    banEmbed.addFields(
        { name: `User ${moderationAction.conjutation}:`,  value: `**${bannedMember.displayName}**\n${bannedMember.id}`, inline: true },
        { name: 'Handled by:',  value: `**${bannedBy.displayName}**\n${bannedBy.id}`, inline: true },
        { name: `${actionName} reason:`,  value: reason, inline: false },
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
    Mute:   { id: 1, conjutation: "Muted"   },
    Kick:   { id: 2, conjutation: "Kicked"  },
    Ban:    { id: 3, conjutation: "Banned"  },
    Warn:   { id: 4, conjutation: "Warned"  },
    Unban:  { id: 5, conjutation: "Unbaned" }
};

module.exports = {
    getHHTPResult,
    createRoomEmbed,
    createModerationActionEmbed,
    getQuotedText,
    deleteTagsFromText,
    getRunArgs,
    getConfig,
    moderationActions
}