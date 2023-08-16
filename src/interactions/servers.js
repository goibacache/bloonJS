const { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType} = require('discord.js')
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const { registerFont, createCanvas, Image } = require('canvas');

const regionsToEmojis   = [];
regionsToEmojis["EU"]   = "./assets/svg/eu.svg";
regionsToEmojis["US"]   = "./assets/svg/us.svg";
regionsToEmojis["USW"]  = "./assets/svg/us.svg";
regionsToEmojis["Asia"] = "./assets/svg/sg.svg";
regionsToEmojis["JP"]   = "./assets/svg/jp.svg";
regionsToEmojis["AU"]   = "./assets/svg/au.svg";
regionsToEmojis["SA"]   = "./assets/svg/br.svg";
regionsToEmojis["CAE"]  = "./assets/svg/ca.svg";
regionsToEmojis["KR"]   = "./assets/svg/kr.svg";
regionsToEmojis["IN"]   = "./assets/svg/in.svg";
regionsToEmojis["RU"]   = "./assets/svg/ru.svg";
regionsToEmojis["CN"]   = "./assets/svg/cn.svg";

const lockEmoji         = "./assets/svg/lock.svg";

module.exports = {
	cooldown: 60,
	data: new SlashCommandBuilder()
		.setName('servers')
		.setDescription(`Provides information about Intruder's servers.`),
	async execute(interaction) {
		try{
			console.log(`\nservers.js: ${interaction.member.id}`);

			if (interaction.channel.id != config.bloonCommandsChannel){
				await interaction.reply({ content: 'This command can only be used in the Bloon Commands Channel!', ephemeral: true });
				console.log(`\nservers.js: Interaction used in wrong channel.`);
				return "noCooldown"; // Inmediatly remove cooldown
			}

			await interaction.deferReply(); // This makes it so it can take more than 3 seconds to reply.

            // Load servers
            const servers = await bloonUtils.getHHTPResult("https://api.intruderfps.com/rooms?OrderBy=agentCount%3Adesc");

            let currentPage = 0;
            const lastPage = Math.ceil(servers.data.length / 10) - 1;

            let pages = [];

            const baseYPosition = 65;
            const columnsPositionX = [90, 530, 600];
            const distanceBetweenColumns = 33;

            for (let p = 0; p <= lastPage; p++) {
                const canvas = bloonUtils.setupCanvas();
                const ctx = canvas.getContext('2d');

                // Rows
                let i = 1;
                for (let s = p * 10; s < servers.data.length && s < (p * 10) + 10; s++) {
                    const server = servers.data[s];

                    //const thirdColumn = agentStat[optionDictionary[filterBy].key] ?? bloonUtils.timePlayedToHours(agentStat.timePlayed);
                    ctx.fillStyle = "white";
                    const img = new Image();
                    img.onload = function() {
                        ctx.drawImage(img, 40, baseYPosition + distanceBetweenColumns * i, 30, 20);
                    }
                    img.src = regionsToEmojis[server.region];

                    let lock = "";
                    if (server.password){
                        lock = " ";
                    }

                    // Draw lock SVG
                    if (lock.length > 0){
                        const lockImg = new Image();
                        lockImg.onload = function() {
                            ctx.drawImage(lockImg, 95, 7 + baseYPosition + distanceBetweenColumns * i, 10, 10);
                        }
                        lockImg.src = lockEmoji;
                    }

                    const serverName = bloonUtils.hardTruncateOrComplete(bloonUtils.CyrillicOrStandard(bloonUtils.deleteTagsFromText(lock + server.name)), 40); // Max width: 40

                    ctx.fillText(serverName,	columnsPositionX[1], baseYPosition + distanceBetweenColumns * i);				
                    ctx.fillText(bloonUtils.hardTruncateOrComplete(`[${server.agentCount.toString().padStart(2)}/${server.maxAgents.toString().padStart(2)}]`, 	7), columnsPositionX[2], baseYPosition + distanceBetweenColumns * i); // Max width: 7       

                    // separation
                    //ctx.fillStyle = grd_divider;
                    //ctx.fillRect(30, (baseYPosition + distanceBetweenColumns * i) + distanceBetweenColumns/2, width-60, 2);

                    i++;
                }   

                // Disclaimer
                ctx.font = '10px "Share Tech Mono"'; // set font
                ctx.textAlign = "start";
                ctx.fillStyle = "#FFFFFF";
                ctx.fillText(`Superbossgames API | ${new Date().toUTCString()}`, 20, bloonUtils.height-30);
                //#endregion

                pages.push(canvas);
            }

			//const attachment = canvas.toBuffer('image/png')
	        //await interaction.editReply({ content: `[**Current Server Information**](<https://intruderfps.com/rooms/>)\n\n`, files: [attachment] });

			//#region maybe add it as as a RoomEmbed

            const attachment = new AttachmentBuilder(pages[currentPage].toBuffer('image/png'), { name: 'serverlist.png' }); 
			const roomEmbed = bloonUtils.createRoomEmbed(servers.data);
			roomEmbed.setImage('attachment://serverlist.png');

            const previousButton = new ButtonBuilder()
                .setCustomId('previous_button')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true);

            const nextButton = new ButtonBuilder()
                .setCustomId('next_button')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary);
            
            let buttonRow = new ActionRowBuilder().addComponents(previousButton, nextButton);
			

			await interaction.editReply({ embeds: [roomEmbed], files: [attachment], components: [buttonRow] });

            const msg = await interaction.fetchReply();

            const collector = msg.createMessageComponentCollector({time: 60_000, componentType: ComponentType.Button}); // 1 minute

            // triggers when the times runs out
            collector.on('end', collected => {
                interaction.editReply({ embeds: [roomEmbed], files: [attachment], components: [] });
            });

            // triggers when the buttons are pressed
            collector.on('collect', m => {
                if (m.customId == 'next_button') {
                    if (currentPage < lastPage){
                        currentPage++;
                        if (currentPage == lastPage){
                            nextButton.setDisabled(true);
                        }
                    }
                    previousButton.setDisabled(false);
                } 
                else if (m.customId == 'previous_button') {
                    if (currentPage > 0){
                        currentPage--;
                        if (currentPage == 0){
                            previousButton.setDisabled(true);
                        }
                    }
                    nextButton.setDisabled(false);
                } 

                buttonRow = new ActionRowBuilder().addComponents(previousButton, nextButton);

                const attachment = new AttachmentBuilder(pages[currentPage].toBuffer('image/png'), { name: 'serverlist.png' }); 
                const roomEmbed = bloonUtils.createRoomEmbed(servers.data);
                roomEmbed.setImage('attachment://serverlist.png');

                m.update({ embeds: [roomEmbed], files: [attachment], components: [buttonRow] });
             })

			//#endregion
		}catch(error){
			await interaction.editReply({ content: 'There was an error in /servers, sorry.' });
			console.error(`\nError in servers.js for ID ${interaction.member.id}: ` + error);
		}
	},
};