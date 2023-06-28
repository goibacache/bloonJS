import { EmbedBuilder } from '@discordjs/builders';
import https from 'https'

export const getHHTPResult = (requestURL) => {
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
 * Creates the embeded message for current rooms
 * @param {rooms.data from intruder https://api.intruderfps.com/rooms} rooms 
 * @returns 
 */
export const createRoomEmbed = (rooms) => {

    let regions   = "";
    let names     = "";
    let agents    = "";

    // Creates rooms embed
    const roomEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`Current Server Information`)
    .setURL("https://intruderfps.com/rooms")
    .setTimestamp();

    
    rooms.forEach(room => {
        regions += `${room.region}\n`;
        names   += `${room.name}\n`;
        agents  += `[${room.agentCount}/${room.maxAgents}]\n`;
    });
    
    roomEmbed.addFields(
        { name: 'Region',  value: regions, inline: true },
        { name: 'Names',   value: names, inline: true },
        { name: 'Agents',  value: agents, inline: true },
    );

    return roomEmbed;
}