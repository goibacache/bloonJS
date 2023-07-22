const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js')
const { EmbedBuilder } = require('@discordjs/builders');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const { registerFont, createCanvas } = require('canvas');

/**
 * This actually translates the options into something useful.
 */
const optionDictionary = {
    tlevels:            { name: 'Top levels',               query: `OrderBy=stats.totalXp:desc`,          lastColumnTitle: 'Playtime',      key: null},
    tkills:             { name: 'Top kills',                query: `OrderBy=stats.kills:desc`,            lastColumnTitle: 'Kills',         key: 'kills'},

    tarrests:           { name: 'Top arrests',              query: `OrderBy=stats.Arrests:desc`,          lastColumnTitle: 'Arrests',       key: 'arrests'},
    tgotarrested:       { name: 'Top got arrested',         query: `OrderBy=stats.gotArrested:desc`,      lastColumnTitle: 'Arrested',      key: 'gotArrested'},
    tdeaths:            { name: 'Top deaths',               query: `OrderBy=stats.knockdowns:desc`,       lastColumnTitle: 'Deaths',        key: 'deaths'},

    tteamkills:         { name: 'Top team kills',           query: `OrderBy=stats.teamKills:desc`,        lastColumnTitle: 'Team K',        key: 'teamKills'},
    tteamdamage:        { name: 'Top team damage',          query: `OrderBy=stats.teamDamage:desc`,       lastColumnTitle: 'Team D',        key: 'teamDamage'},
    tmatcheswon:        { name: 'Top matches won',          query: `OrderBy=stats.matchesWon:desc`,       lastColumnTitle: 'Match W',       key: 'matchesWon'},
    tmatcheslost:       { name: 'Top matches lost',         query: `OrderBy=stats.matchesLost:desc`,      lastColumnTitle: 'Match L',       key: 'matchesLost'},

    tcaptures:          { name: 'Top rounds won capture',   query: `OrderBy=stats.roundsWonCapture:desc`, lastColumnTitle: 'Capt. W',       key: 'roundsWonCapture'},
    tnetworkhacks:      { name: 'Top rounds won hacks',     query: `OrderBy=stats.roundsWonHack:desc`,    lastColumnTitle: 'Hacks W',       key: 'roundsWonHack'},

    tknockdowns:        { name: 'Top knockdowns',           query: `OrderBy=stats.knockdowns:desc`,       lastColumnTitle: 'KDs',           key: 'knockdowns'},
    tteamknockdowns:    { name: 'Top team knockdowns',      query: `OrderBy=stats.teamknockdowns:desc`,   lastColumnTitle: 'TeamKDs',       key: 'teamKnockdowns'},
    tgotknockeddown:    { name: 'Top got knocked down',     query: `OrderBy=stats.gotKnockedDown:desc`,   lastColumnTitle: 'Got KD',        key: 'gotKnockedDown'},

    theals:             { name: 'Top heals',                query: `OrderBy=stats.heals:desc`,            lastColumnTitle: 'Heals',         key: 'heals'},
    tgothealed:         { name: 'Top got healed',           query: `OrderBy=stats.gotHealed:desc`,        lastColumnTitle: 'Healed',        key: 'gotHealed'},

    tsuicides:          { name: 'Top suicides',             query: `OrderBy=stats.suicides:desc`,         lastColumnTitle: 'Suicides',      key: 'suicides'},
    tsurvivals:         { name: 'Top survivals',            query: `OrderBy=stats.survivals:desc`,        lastColumnTitle: 'Survived',      key: 'survivals'}
}

let playerCache = [];

const clearCachedLongerThanTimeStamp = () => {
    playerCache = playerCache.filter(x => x.timestamp > new Date());
}

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription(`Shows stats`)
        .addStringOption(option =>
            option.setName('filterby')
                .setDescription('The filter to apply')
                .setRequired(true)
                .addChoices(
                    { name: 'Top levels',				value: 'tlevels'            },
                    { name: 'Top kills', 				value: 'tkills'             },
                    { name: 'Top arrests', 				value: 'tarrests'           },
                    { name: 'Top got arrested', 		value: 'tgotarrested'       },
                    { name: 'Top deaths', 				value: 'tdeaths'            },
                    { name: 'Top team kills', 			value: 'tteamkills'         },
                    { name: 'Top team damage', 			value: 'tteamdamage'        },
                    { name: 'Top matches won', 			value: 'tmatcheswon'        },
                    { name: 'Top matches lost', 		value: 'tmatcheslost'		},
                    { name: 'Top captures', 			value: 'tcaptures'			},
                    { name: 'Top network hacks', 		value: 'tnetworkhacks'		},
                    { name: 'Top knockdowns', 			value: 'tknockdowns'		},
                    { name: 'Top team knockdowns', 		value: 'tteamknockdowns'	},
                    { name: 'Top got knocked down', 	value: 'tgotknockeddown'	},
                    { name: 'Top heals', 				value: 'theals'				},
                    { name: 'Top got healed', 			value: 'tgothealed'			},
                    { name: 'Top suicides', 			value: 'tsuicides'			},
                    { name: 'Top survivals', 			value: 'tsurvivals'			}
                )
            ),
	async execute(interaction) {
		try{
			console.log(`\stats.js: ${interaction.member.id}`);

            //#region fetch data

            
            if (interaction.channel.id != config.bloonCommandsChannel){
				await interaction.reply({ content: 'This command can only be used in the Bloon Commands Channel!', ephemeral: true });
				console.log(`\stats.js: Interaction used in wrong channel.`);
				return "noCooldown"; // Immediately remove cooldown
			}
            

            await interaction.deferReply(); // This makes it so it can take more than 3 seconds to reply.

            const filterBy = interaction.options.getString('filterby');

            const agents = await bloonUtils.getHHTPResult(`https://api.intruderfps.com/agents?PerPage=10&${optionDictionary[filterBy].query}`)

            // For every agent bring extra info.
            const agentsStats = [];
            const promiseList = [];

            // Remove all players cached for longer than 10 minutes.
            clearCachedLongerThanTimeStamp();

            // Load the stats for every top player...
            for (const agent of agents.data){
                promiseList.push(
                    new Promise((resolve, reject) => {
                        // Check if is cached, if it is, return that.
                        if (playerCache.some(x => x.steamId == agent.steamId)){
                            resolve(playerCache.find(x => x.steamId == agent.steamId));
                            return;
                        }

                        // Get new result and cache it
                        bloonUtils.getHHTPResult(`https://api.intruderfps.com/agents/${agent.steamId}/stats`)
                        .then(result => {
                            result["steamId"] = agent.steamId;
                            result["name"] = agent.name;
                            result["avatarUrl"] = agent.avatarUrl;
                            result["timestamp"]  = new Date(new Date().getTime() + 10*60000); // The timestamp is set to expire in 10 minutes
                            playerCache.push(result);
                            resolve(result);
                        })
                        .catch(error => {
                            reject(error);
                        })
                      })
                );
            }

            //Wait for all the responses (if not all are ok, it throws an error)
            const allResponses = await Promise.all(promiseList);

            // Finally add it ot the list
            allResponses.forEach(response => {
                agentsStats.push(response);
            });

            //#endregion

            //#region draw canvas background

            // Canvas config
            const width     = 400;
            const height    = 640;
            const baseYPosition = 70;
            const titleBoxWidth = 140;
            const titleBoxHeight = 50;
            const columnsPositionX = [140, 240, 340];
            const distanceBetweenColumns = 47;
            const bottomTablePadding = 105;

            // Register font
            registerFont('./assets/ShareTechMono-Regular.ttf', { family: 'Share Tech Mono' })

            // Create canvas
            const canvas = createCanvas(width, height);
            const ctx    = canvas.getContext('2d');

            // Create bg gradient
            const grd_bg = ctx.createRadialGradient(width/2,height/2,50,200,width,height);
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
            ctx.fillRect(20, 55, width-40, height-bottomTablePadding)

            // The table Border
            ctx.strokeStyle = "#FFFFFF";
            ctx.strokeRect(20, 55, width-40, height-bottomTablePadding);

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
            ctx.fillText("> STATS", 20, 15);

            // What are the stats about?
            ctx.fillStyle = "#FFFF00";
            ctx.textAlign = "end";
            ctx.fillText(optionDictionary[filterBy].name, width-20, 15);
            ctx.font = '14px "Share Tech Mono"'; // set font
            
            // Table Header
            ctx.fillStyle = "#BBBBBB";
            ctx.fillText("Player",                                      columnsPositionX[0], baseYPosition);
            ctx.fillText("Level",                                       columnsPositionX[1], baseYPosition);
            ctx.fillText(optionDictionary[filterBy].lastColumnTitle,    columnsPositionX[2], baseYPosition);

            // First separation
            ctx.fillStyle = grd_divider;
            ctx.fillRect(30, baseYPosition + distanceBetweenColumns/2, width-60, 2);

            // Rows
            let i = 1;
            for (const agentStat of agentsStats){
                const thirdColumn = agentStat[optionDictionary[filterBy].key] ?? bloonUtils.timePlayedToHours(agentStat.timePlayed);
                ctx.fillStyle = "white";
                ctx.fillText(bloonUtils.hardTruncate(agentStat.name, 14), columnsPositionX[0], baseYPosition + distanceBetweenColumns * i); // Max width: 14
                ctx.fillText(bloonUtils.hardTruncate(agentStat.level, 9), columnsPositionX[1], baseYPosition + distanceBetweenColumns * i); // Max width: 9
                ctx.fillText(bloonUtils.hardTruncate(thirdColumn, 9),     columnsPositionX[2], baseYPosition + distanceBetweenColumns * i); // Max width: 9

                // separation
                ctx.fillStyle = grd_divider;
                ctx.fillRect(30, (baseYPosition + distanceBetweenColumns * i) + distanceBetweenColumns/2, width-60, 2);

                i++;
            }

            // Disclaimer
            ctx.font = '10px "Share Tech Mono"'; // set font
            ctx.textAlign = "start";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(`Superbossgames API | ${new Date().toUTCString()}`, 20, 610);

            //#endregion

            // Reply
            const attachment = canvas.toBuffer('image/png', { compressionLevel: 3, filters: canvas.PNG_FILTER_NONE })
	        await interaction.editReply({ files: [attachment] });
		}catch(error){
            console.error(`\nError in stats.js for ID ${interaction.member.id}: ` + error);
			await interaction.editReply({ content: `There was an error in the /stats command, sorry.`});
		}
	},
};

