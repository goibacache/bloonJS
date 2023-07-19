const { SlashCommandBuilder } = require('discord.js')
const { EmbedBuilder } = require('@discordjs/builders');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();

/*
top kills, top upvotes top downvotes, top levels, top arrests
*/

const optionDictionary = {
    tlevels:            { name: 'Top levels',               query: `OrderBy=stats.totalXp:desc`,          lastColumnTitle: 'Playtime',      key: null},
    tkills:             { name: 'Top kills',                query: `OrderBy=stats.kills:desc`,            lastColumnTitle: 'Kills',         key: 'kills'},

    tarrests:           { name: 'Top arrests',              query: `OrderBy=stats.Arrests:desc`,          lastColumnTitle: 'Arrests',       key: 'arrests'},
    tgotarrested:       { name: 'Top got arrested',         query: `OrderBy=stats.gotArrested:desc`,      lastColumnTitle: 'Arrested',      key: 'gotArrested'},
    tdeaths:            { name: 'Top deaths',               query: `OrderBy=stats.knockdowns:desc`,       lastColumnTitle: 'Deaths',        key: 'deaths'},

    tteamkills:         { name: 'Top team kills',           query: `OrderBy=stats.teamKills:desc`,        lastColumnTitle: 'TeamKills',     key: 'teamKills'},
    tteamdamage:        { name: 'Top team damage',          query: `OrderBy=stats.teamDamage:desc`,       lastColumnTitle: 'TeamDamage',    key: 'teamDamage'},
    tmatcheswon:        { name: 'Top matches won',          query: `OrderBy=stats.matchesWon:desc`,       lastColumnTitle: 'M.Won',         key: 'matchesWon'},
    tmatcheslost:       { name: 'Top matches lost',         query: `OrderBy=stats.matchesLost:desc`,      lastColumnTitle: 'M.Lost',        key: 'matchesLost'},

    tcaptures:          { name: 'Top rounds won capture',   query: `OrderBy=stats.roundsWonCapture:desc`, lastColumnTitle: 'MWCapture',     key: 'roundsWonCapture'},
    tnetworkhacks:      { name: 'Top rounds won hacks',     query: `OrderBy=stats.roundsWonHack:desc`,    lastColumnTitle: 'MWonHacks',     key: 'roundsWonHack'},

    tknockdowns:        { name: 'Top knockdowns',           query: `OrderBy=stats.knockdowns:desc`,       lastColumnTitle: 'KDs',           key: 'knockdowns'},
    tteamknockdowns:    { name: 'Top team knockdowns',      query: `OrderBy=stats.teamknockdowns:desc`,   lastColumnTitle: 'TeamKDs',       key: 'teamKnockdowns'},
    tgotknockeddown:    { name: 'Top got knocked down',     query: `OrderBy=stats.gotKnockedDown:desc`,   lastColumnTitle: 'Got KD',        key: 'gotKnockedDown'},

    theals:             { name: 'Top heals',                query: `OrderBy=stats.heals:desc`,            lastColumnTitle: 'Heals',         key: 'heals'},
    tgothealed:         { name: 'Top got healed',           query: `OrderBy=stats.gotHealed:desc`,        lastColumnTitle: 'Healed',        key: 'gotHealed'},

    tsuicides:          { name: 'Top suicides',             query: `OrderBy=stats.suicides:desc`,         lastColumnTitle: 'Suicides',      key: 'suicides'},
    tsurvivals:         { name: 'Top survivals',            query: `OrderBy=stats.survivals:desc`,        lastColumnTitle: 'Survivals',     key: 'survivals'}
}

const columnWidths = [15, 6, 8, 8];

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

            if (interaction.channel.id != config.bloonCommandsChannel){
				await interaction.reply({ content: 'This command can only be used in the Bloon Commands Channel!', ephemeral: true });
				console.log(`\stats.js: Interaction used in wrong channel.`);
				return "noCooldown"; // Inmediatly remove cooldown
			}

            interaction.deferReply(); // This makes it so it can take more time to reply.

            const filterBy = interaction.options.getString('filterby');

			const statsEmbed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle(`Bloon commands /stats`)
			.setTimestamp();

            const agents = await bloonUtils.getHHTPResult(`https://api.intruderfps.com/agents?PerPage=10&${optionDictionary[filterBy].query}`)

            // For every agent bring extra info.

            const agentsStats = [];

            // Load the stats for every top player...
            for (const agent of agents.data){
                const extraInfo = await bloonUtils.getHHTPResult(`https://api.intruderfps.com/agents/${agent.steamId}/stats`);
                // const votes = await bloonUtils.getHHTPResult(`https://api.intruderfps.com/agents/${agent.steamId}/votes`);
                extraInfo["name"] = agent.name; // Create the "name" info on the same object.
                // extraInfo["positive"] = votes.positive;
                // extraInfo["negative"] = votes.negative;
                // extraInfo["received"] = votes.received;
                agentsStats.push(extraInfo);
            }

            console.log("Info we've got");
            console.log(agentsStats);

            // Create table
            let result = "";
            result += "```";

            // Header:
            const lastColumnTitle = optionDictionary[filterBy].lastColumnTitle;
            result += `${bloonUtils.truncateOrComplete("Username", columnWidths[0])} | ${bloonUtils.truncateOrComplete("Level", columnWidths[1])} | ${bloonUtils.truncateOrComplete("XP", columnWidths[2])} | ${ bloonUtils.truncateOrComplete(lastColumnTitle, columnWidths[3])}`;

            // Content
            agentsStats.forEach(agent => {
                const lastColumnValue = optionDictionary[filterBy].key == null ? bloonUtils.timePlayedToHours(agent.timePlayed) : agent[optionDictionary[filterBy].key];
                result += `\n${bloonUtils.truncateOrComplete(agent.name, columnWidths[0])} | ${bloonUtils.truncateOrComplete(agent.level, columnWidths[1], true)} | ${bloonUtils.truncateOrComplete(agent.totalXp, columnWidths[2], true)} | ${ bloonUtils.truncateOrComplete(lastColumnValue, columnWidths[3], true) }`
            });

            // End content
            result += "```";

            // Actually embed
            statsEmbed.addFields(
                { name: optionDictionary[filterBy].name,  value: result }
            );

            statsEmbed.setFooter({ text: "Superbossgames API"});

			await interaction.editReply({ embeds: [statsEmbed] });
		}catch(error){
			await interaction.editReply({ content: `There was an error in the /stats command, sorry.`, ephemeral: true});
			console.error(`\nError in stats.js for ID ${interaction.member.id}: ` + error);
		}
	},
};