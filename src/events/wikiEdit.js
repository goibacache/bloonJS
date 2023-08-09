const { EmbedBuilder }  = require('@discordjs/builders');
const { Events }        = require('discord.js');
const bloonUtils        = require('../utils/utils.js');
const config            = bloonUtils.getConfig();
const fs 			    = require('fs');

/**
 * @typedef {Object} change
 * @property { string } type;
 * @property { string } ns;
 * @property { string } title;
 * @property { string } pageid;
 * @property { number } revid;
 * @property { number } old_revid;
 * @property { number } rcid;
 * @property { string } user;
 * @property { string } oldlen;
 * @property { string } newlen;
 * @property { Date }   timestamp;
 */

let     lastRCID    = 0;
const   fileRoute   = './localMemory/lastWikiEdit.bak';

const evnt = {
    name: "wikiedit",
	async execute(client) {
        try{

            // Load channel and guild
            const guild = await client.guilds.fetch(config.bloonGuildId);
            const channel = await guild.channels.cache.get(config.wikiChannel) || await guild.channels.fetch(config.wikiChannel);


            lastRCID = readSavedRCID();

            const response = await bloonUtils.getHHTPResult('https://sharklootgilt.superbossgames.com/wiki/api.php?action=query&format=json&list=recentchanges&rcprop=title|ids|sizes|flags|user|timestamp');
            //const lists = changes;

            const changes = response.query.recentchanges;

            // Order by rcid
            changes.sort(function(a, b){
                return a.rcid - b.rcid;
            });

            let lastRcidInList = 0;

            for(change of changes.filter(x => x.rcid > lastRCID)){

                console.log("change:", change);

                const changeURL = `${config.wikiURL}index.php/${change.title.replace(/ /g, "_")}`;
                const changeComparisonUrl = `${config.wikiURL}index.php?title=${change.title.replace(/ /g, "_")}&type=revision&diff=${change.revid}&oldid=${change.old_revid}`;

                const wikiEmbed = new EmbedBuilder()
                .setColor(0xFFCC00)
                // .setTitle(`Wiki change in ${change.title}`)
                .setURL(changeURL)
                .setDescription(`New ${change.type} by ${change.user} in [${change.title}](${changeURL}). See the [differences](${changeComparisonUrl})`)
                .setTimestamp()
                .setFooter({ text: `SuperbossGames Wiki | ` });

                await channel.send({ embeds: [wikiEmbed] });

                if (change.rcid > lastRcidInList){
                    lastRcidInList = change.rcid;
                }
            }

            if (lastRcidInList != 0){
                SaveRCID(lastRcidInList);
                console.log(`lastRcid is ${lastRcidInList}`)
            }
           
        }catch(error){
            console.error(`\nError in wikiedit.js: ${error}`);
        }
	},
};

const readSavedRCID = () => {
    // Read from file 
    if (fs.existsSync(fileRoute)){
        const data = fs.readFileSync(fileRoute, { encoding: 'utf8', flag: 'r' });
        return data;
    }else{
        // It's just 0
        return 0;
    }
}

const SaveRCID = (lastRCID) => {
    fs.writeFileSync(fileRoute, lastRCID+""); // Write new value
}

module.exports = {
    evnt
}