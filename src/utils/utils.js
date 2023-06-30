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

/**
 * Creates the embeded message for current rooms. Beware, Embed descriptions are limited to 4096 characters.
 * @param {rooms.data from intruder https://api.intruderfps.com/rooms} rooms 
 * @returns 
 */
const createRoomEmbed = (rooms) => {

    

    // Creates rooms embed
    const roomEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`Current Server Information`)
    .setURL("https://intruderfps.com/rooms")
    .setTimestamp();

    let maxRooms = 10;
    
    // Create description with the format.
    let description = "`\n";

    rooms.forEach((room, index) => {
        if (index > maxRooms) return;
        description += `${room.region.padEnd(3)} | ${deleteTagsFromText(room.name.trim())} | [${room.agentCount.toString().padStart(2)}/${room.maxAgents.toString().padStart(2)}]\n`;
    });

    description += "`";

    roomEmbed.addFields(
        { name: '`Reg | Name | Agents`',  value: description }
    );

    //roomEmbed.setDescription(description);
    
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

module.exports = {
    getHHTPResult,
    createRoomEmbed,
    getQuotedText,
    deleteTagsFromText
}