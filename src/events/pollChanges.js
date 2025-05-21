const { EmbedBuilder }  = require('@discordjs/builders');
// eslint-disable-next-line no-unused-vars
const { Guild, Client } = require('discord.js');
const bloonUtils        = require('../utils/utils.js');
const storedProcedures  = require('../utils/storedProcedures.js');
// eslint-disable-next-line no-unused-vars
const { ServerConfig }              = require('../interfaces/ServerConfig.js'); // Used so VSCODE can see the properties

let pollChangesTime = [];

const evnt = {
    name: "pollChanges",
    /**
     * 
     * @param {Client} client 
     */
	async execute(client) {
        try{

            /**
             * @type ServerConfig[]
             */
            const pollingServersConfigs = client.serverConfigs.filter(x => x.PC_EnablePolling && x.PC_UrlToPoll && x.PC_PropertyTreeId);

            for (const pollingServerConfig of pollingServersConfigs) {
                // (1) set initial minutes if not set or it already reached 0
                if (pollChangesTime[pollingServerConfig.ServerId] == null || pollChangesTime[pollingServerConfig.ServerId] <= 0) {
                    pollChangesTime[pollingServerConfig.ServerId] = pollingServerConfig.PC_MinutesToPoll;
                }else{
                    pollChangesTime[pollingServerConfig.ServerId]--; // Decrease minutes by one
                }

                if (pollChangesTime[pollingServerConfig.ServerId] == 0){
                    console.log(`Time to poll for server ${pollingServerConfig.ServerName}`);

                    // Consume URL
                    const response = await bloonUtils.getHTTPResult(pollingServerConfig.PC_UrlToPoll).catch((error) => { console.log(error); return null; });
                    if (response == null) continue; // Caught error

                    const separatedPropertyTree = pollingServerConfig.PC_PropertyTreeId.replace('\t', '').split('.');

                    let currentObject = response;
                    while(separatedPropertyTree.length > 0){

                        let currentProperty = separatedPropertyTree[0];

                        if (currentProperty != "[each]"){
                            currentObject = currentObject[currentProperty];
                        }else{
                            separatedPropertyTree.splice(0, 1); // Remove "[each]"

                            /**
                             * @type Guild
                             */
                            const currentGuild = await client.guilds.fetch(pollingServerConfig.ServerId);
                            if (!currentGuild){ // Guild not found
                                continue;
                            }

                            const channel = await currentGuild.channels.fetch(pollingServerConfig.PC_ChannelToPostAlert);
                            if (!channel){
                                continue; // Channel not found
                            }

                            let lastUpdateDate = undefined;

                            for await (const change of currentObject) {
                                /**
                                 * Used in the last iteration to get the actual property after the [each]
                                 */
                                const separatedPropertiesWhenReached = [...separatedPropertyTree];
                                
                                let currentChangeDate = new Date(GetRemainingProperties(change, separatedPropertiesWhenReached)); // Get the datetime

                                // Update the latest update (to save it later)
                                if (lastUpdateDate == undefined || lastUpdateDate < currentChangeDate){
                                    lastUpdateDate = currentChangeDate;
                                }

                                // If it was never fetched, the last change WILL be the new "date" to avoid posting old stuff
                                if (pollingServerConfig.PC_LastFetchedDate == undefined){
                                    console.log(`First ever polling for server ${pollingServerConfig.ServerName}. Saving last update as ${lastUpdateDate}`);
                                    break; // Stop While which will trigger the "save last update date" and update locally on memory
                                }

                                if (currentChangeDate > pollingServerConfig.PC_LastFetchedDate){

                                    // Wiki
                                    if (pollingServerConfig.PC_PollType == "wiki"){
                                        const changeURL             = `${pollingServerConfig.PC_WikiBaseUrl}${change.title.replace(/ /g, "_")}`;
                                        const dateModified 	        = new Date(change.timestamp).toUTCString();

                                        // Create the "see the differences" text if there are any.
                                        let differenceText          = "";
                                        if (change.old_revid != 0){
                                            const changeComparisonUrl   = `${pollingServerConfig.PC_WikiBaseUrl}?title=${change.title.replace(/ /g, "_")}&type=revision&diff=${change.revid}&oldid=${change.old_revid}`;
                                            differenceText = ` See the [differences](${changeComparisonUrl})`;
                                        }

                                        const wikiEmbed = new EmbedBuilder()
                                        .setColor(0xFFCC00)
                                        .setURL(changeURL)
                                        .setDescription(`New ${change.type} by ${change.user} in [${change.title}](${changeURL}).${differenceText}`)
                                        .setTimestamp()
                                        .setFooter({ text: `SuperbossGames Wiki | Modification date ${dateModified}` });

                                        await channel.send({ embeds: [wikiEmbed] });
                                        
                                        console.log("new wiki change found!");
                                    }

                                    if (pollingServerConfig.PC_PollType == "youtube"){
                                        await channel.send({ content: `${pollingServerConfig.PC_YoutubeMessage} ${change.snippet.title} https://youtu.be/${change.id.videoId}` });
                                        console.log(`new youtube change found ${change.id.videoId}`);
                                    }
                                }
                            }

                            separatedPropertyTree.splice(0, separatedPropertyTree.length); // Remove everything so it ends

                            // Update the last polled change date.
                            if (lastUpdateDate != null){
                                if (pollingServerConfig.PC_LastFetchedDate != null && lastUpdateDate.toUTCString() != pollingServerConfig.PC_LastFetchedDate.toUTCString()){
                                    await storedProcedures.serverConfig_UpdateLastFetch(pollingServerConfig.ServerId, lastUpdateDate);
                                    client.serverConfigs.find(x => x.ServerId == pollingServerConfig.ServerId)["PC_LastFetchedDate"] = lastUpdateDate; // Update in memory
                                }
                            }
                        }

                        separatedPropertyTree.splice(0, 1); // Delete iterated element
                    }
                }
            }
        }catch(error){
            console.error(`Error in pollChanges.js: ${error}`);
        }
	},
};

/**
 * After the [each] gets the property needed (usually a date) to do the comparison
 * @param {*} change 
 * @param {any[]} properties 
 * @returns 
 */
const GetRemainingProperties = (change, separatedProperties) => {

    while(separatedProperties.length > 0){
        change = change[separatedProperties[0]];
        separatedProperties.splice(0, 1);
    }

    return change;
}

module.exports = {
    evnt
}