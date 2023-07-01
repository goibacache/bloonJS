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
regionsToEmojis["EU"]   = "🇪🇺 ";
regionsToEmojis["US"]   = "🇺🇸 ";
regionsToEmojis["USW"]  = "🇺🇸W";
regionsToEmojis["Asia"] = "🇸🇬 ";
regionsToEmojis["JP"]   = "🇯🇵 ";
regionsToEmojis["AU"]   = "🇦🇺 ";
regionsToEmojis["SA"]   = "🇧🇷 ";
regionsToEmojis["CAE"]  = "🇨🇦 ";
regionsToEmojis["KR"]   = "🇰🇷 ";
regionsToEmojis["IN"]   = "🇮🇳 ";
regionsToEmojis["RU"]   = "🇷🇺 ";

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
    let description =  "`";
    description     += `\nReg | ${truncateOrComplete("Name")} | Agents\n`;

    // Rooms
    rooms.forEach((room, index) => {
        if (index > maxRoomsForEmbed) return;

        const emojiFlag = regionsToEmojis[room.region];
        description += `${emojiFlag == undefined ? "❓" : emojiFlag} | ${truncateOrComplete(deleteTagsFromText(room.name.trim()))} | [${room.agentCount.toString().padStart(2)}/${room.maxAgents.toString().padStart(2)}]\n`;
    });

    // Rooms left, only if they're
    if (roomsLeftOut > 0){
        description += `\nAnd ${roomsLeftOut} more rooms.\n`    
    }

    // Close the code tag
    description += "`";

    roomEmbed.addFields(
        { name: '\u200B',  value: description }
    );

    const extensions = `🌏 [**Chrome**](https://chrome.google.com/webstore/detail/intruder-notifications/aoebpknpfcepopfgnbnikaipjeekalim) | [**Firefox**](https://addons.mozilla.org/en-US/firefox/addon/intruder-notifications/) 🔥`;
    roomEmbed.addFields({ name: "Browser Extensions", value: extensions });

    roomEmbed.setFooter({ text: `SuperbossGames | #current-server-info | Total Agents: ${totalPlayersOnlist}` });
    
    return roomEmbed;
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
    const maxLength = 27; // Mobile size defines this.
    text = text.padEnd(maxLength); // Max is 27, fixed.
    if (text.length > maxLength){
        text = text.substr(0, maxLength-3) + "...";
    }

    return text;
}

module.exports = {
    getHHTPResult,
    createRoomEmbed,
    getQuotedText,
    deleteTagsFromText
}