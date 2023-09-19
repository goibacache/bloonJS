const { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType} = require('discord.js')
const { EmbedBuilder } = require('@discordjs/builders');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const { registerFont, createCanvas, Image } = require('canvas');

const backgroundSVG = "./assets/svg/BackgroundID.svg";
const profileBase   = "./assets/profiles/";

// Canvas config
const width     = 500;
const height    = 320;

module.exports = {
	cooldown: 60 * 5,
	data: new SlashCommandBuilder()
		.setName('playerstats')
        .setDescription(`Provides information about a player stats.`)
        .addStringOption(option => 
            option.setName('steamid')
            .setRequired(true)
            .setDescription(`The user steam's ID`)
            .setMaxLength(17)
            .setMinLength(15)
        ),
	async execute(interaction) {
		try{
            /*
            if (interaction.channel.id != config.bloonCommandsChannel){
				await interaction.reply({ content: 'This command can only be used in the Bloon Commands Channel!', ephemeral: true });
				console.log(`playerStats.js: Interaction used in wrong channel.`);
				return "noCooldown"; // Inmediatly remove cooldown
			}
            */

			console.log(`playerStats.js: ${interaction.member.id}`);

            // Get params
            const steamId = interaction.options.getString('steamid') ?? 0;

            if (steamId == 0 || isNaN(steamId)){
                await interaction.reply({ content: 'Please provide a valid steam ID', ephemeral: true });
                return "noCooldown";
            }

            await interaction.deferReply({ ephemeral: false }); // If everything is OK, makes it so it can take more than 3 seconds to reply.

            // Register font
            registerFont('./assets/ShareTechMono-Regular.ttf', { family: 'Share Tech Mono' });

            // Create canvas
            const canvas = createCanvas(width, height);
            const ctx    = canvas.getContext('2d');

            // Set font:
            ctx.font = '20px "Share Tech Mono"'; // set font
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            await addImage(backgroundSVG, ctx, 0, 0, width, height);

            // Draw photo frame
            ctx.fillStyle = "white";
            ctx.strokeStyle = "white";
            ctx.beginPath();
            ctx.roundRect(20, 60, 150, 150, 5);
            ctx.fill();

            // Set font:
            ctx.font = '30px "Share Tech Mono"'; // set font
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";

            const player = await bloonUtils.getHHTPResult(`https://api.intruderfps.com/agents/${steamId}`);

            if (player == null){
                await interaction.editReply({ content: 'No user found for that steam ID.', ephemeral: true });
                return;
            }

            const stats = await bloonUtils.getHHTPResult(`https://api.intruderfps.com/agents/${steamId}/stats`);

            if (stats == null){
                await interaction.editReply({ content: 'No stats found for that steam ID.', ephemeral: true });
                return;
            }
            try {
                await addImage(player.avatarUrl, ctx, 25, 65, 140, 140);    
            } catch (error) {
                // Backup profile picture
                const images = ["Guard.png", "Intruder.png"];
                const imageIndex = Math.floor(Math.random() * images.length);
                await addImage(`${profileBase}${images[imageIndex]}`, ctx, 25, 65, 140, 140);
            }
            
            // Title
            ctx.textAlign = "center";
            ctx.fillText("INTRUDER AGENT ID CARD",    width/2, 25, width-20); // Player name
            ctx.textAlign = "left";

            // Name & level
            ctx.fillText(player.name, 20, 250, 380); // Player name
        
            // Set font:
            ctx.font = '20px "Share Tech Mono"'; // set font
            ctx.fillText(`Level ${player.stats.level} clearance`, 20, 277.5, 380); // Level

            ctx.fillStyle = "white";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";   
            
            const spacing = 21;

            const totalWonMRounds   = stats.roundsWonElimination + stats.roundsWonCapture + stats.roundsWonHack + stats.roundsWonTimer + stats.roundsWonCustom;
            const timePlayed        = bloonUtils.timePlayedToHours(stats.timePlayed);

            ctx.fillText(`Arrests      : ${stats.arrests}`,                          190, 73,                  300);
            ctx.fillText(`Captures     : ${stats.captures}`,                         190, 73 + (spacing * 1),  300);
            ctx.fillText(`Hacks        : ${stats.networkHacks}`,                     190, 73 + (spacing * 2),  300);
            ctx.fillText(`Matches W/L  : ${stats.matchesWon}/${stats.matchesLost}`,  190, 73 + (spacing * 3),  300);
            ctx.fillText(`Rounds W/L   : ${totalWonMRounds}/${stats.roundsLost}`,    190, 73 + (spacing * 4),  300);
            ctx.fillText(`Kills/Deaths : ${stats.kills}/${stats.deaths}`,            190, 73 + (spacing * 5),  300);
            ctx.fillText(`Time played  : ${timePlayed}`,                             190, 73 + (spacing * 6),  300);
        
            // Disclaimer
            ctx.font = '10px "Share Tech Mono"'; // set font
            ctx.textAlign = "start";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(`Superbossgames API | ${new Date().toUTCString()}`, 20, height-20);

            // Send attachment
            const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'playerstats.png' }); 

            await interaction.editReply({ files: [attachment] });
		}catch(error){
            if (interaction.deferred && !interaction.replied) {
                await interaction.editReply({ content: 'There was an error in /playerStats, sorry.', components: [] });
            } else if (interaction.deferred && interaction.replied) {
                await interaction.followUp({ content: 'There was an error in /playerStats, sorry.', components: [] });
            } else {
                await interaction.reply({ content: 'There was an error in /playerStats, sorry.', components: [] });
            }
            console.error("error in playerStats.js:", error);
			console.error(`Error in playerStats.js for ID ${interaction.member.id}.\nName: ${error.name}\nmessage: ${error.message}`);
		}
	},
};

const addImage = (src, ctx, x, y, width, height) => {
    return new Promise((resolve, reject) => {
        let img = new Image()
        img.onload = () => {
            ctx.drawImage(img, x, y, width, height);
            resolve()
        }
        img.onerror = reject
        img.src = src
    });
}