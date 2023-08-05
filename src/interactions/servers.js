const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js')
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

			// Canvas config
			const width     = 640;
			const height    = 475;
			const baseYPosition = 65;
			const titleBoxWidth = 160;
			const titleBoxHeight = 50;
			const columnsPositionX = [90, 530, 600];
			const distanceBetweenColumns = 33;
			const bottomTablePadding = 105;

			// Register font
            registerFont('./assets/ShareTechMono-Regular.ttf', { family: 'Share Tech Mono' })

			// Create canvas
            const canvas = createCanvas(width, height);
            const ctx    = canvas.getContext('2d');

            // Create bg gradient
            const grd_bg = ctx.createRadialGradient(height/2,width/2,50,200,height,width);
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
            ctx.fillRect(20, 60, width-40, height-bottomTablePadding)

            // The table Border
            ctx.strokeStyle = "#FFFFFF";
            ctx.strokeRect(20, 60, width-40, height-bottomTablePadding);

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
            ctx.fillText("> SERVERS", 20, 15);
            
            // Table Header
            ctx.fillStyle = "#BBBBBB";
            ctx.textAlign = "end";
            ctx.fillText("Region",                                       columnsPositionX[0], baseYPosition);
            ctx.fillText("Name                                    ",     columnsPositionX[1], baseYPosition);
            ctx.fillText(bloonUtils.hardTruncateOrComplete("Agents", 7), columnsPositionX[2], baseYPosition);

            // First separation
            ctx.fillStyle = grd_divider;
            ctx.fillRect(30, baseYPosition + distanceBetweenColumns*0.75, width-60, 2);

            // Load servers
            const servers = await bloonUtils.getHHTPResult("https://api.intruderfps.com/rooms");

            // Order them by ammount of agents
            servers.data.sort(function(a, b){
                return b.agentCount - a.agentCount;
            });

            // Rows
            let i = 1;
            for (const server of servers.data){
                // Only draw 10.
                if (i > 10){
                    break;
                }
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
            ctx.fillText(`Superbossgames API | ${new Date().toUTCString()}`, 20, height-30);
            //#endregion

			//const attachment = canvas.toBuffer('image/png')
	        //await interaction.editReply({ content: `[**Current Server Information**](<https://intruderfps.com/rooms/>)\n\n`, files: [attachment] });

			//#region maybe add it as as a RoomEmbed

			const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'serverlist.png' }); 

			const roomEmbed = bloonUtils.createRoomEmbed(servers.data);

			roomEmbed.setImage('attachment://serverlist.png');
			
			await interaction.editReply({ embeds: [roomEmbed], files: [attachment] });

			//#endregion
		}catch(error){
			await interaction.editReply({ content: 'There was an error in /servers, sorry.' });
			console.error(`\nError in servers.js for ID ${interaction.member.id}: ` + error);
		}
	},
};