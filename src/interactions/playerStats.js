const { SlashCommandBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType} = require('discord.js')
const { EmbedBuilder } = require('@discordjs/builders');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const { registerFont, createCanvas, Image } = require('canvas');

const backgroundSVG = "./assets/svg/BackgroundID.svg";
const guard         = "./assets/profiles/Guard.png";
const intruder      = "./assets/profiles/Intruder.png";

// Canvas config
const width     = 500;
const height    = 320;

module.exports = {
	cooldown: 60,
	data: new SlashCommandBuilder()
		.setName('playerstats')
		.setDescription(`Provides information about a player stats.`),
	async execute(interaction) {
		try{
			console.log(`playerStats.js: ${interaction.member.id}`);

			// if (interaction.channel.id != config.bloonCommandsChannel){
			// 	await interaction.reply({ content: 'This command can only be used in the Bloon Commands Channel!', ephemeral: true });
			// 	console.log(`playerStats.js: Interaction used in wrong channel.`);
			// 	return "noCooldown"; // Inmediatly remove cooldown
			// }

			await interaction.deferReply(); // This makes it so it can take more than 3 seconds to reply.

            // Register font
            registerFont('./assets/ShareTechMono-Regular.ttf', { family: 'Share Tech Mono' });

            // Create canvas
            const canvas = createCanvas(width, height);
            const ctx    = canvas.getContext('2d');

            // Load background
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0, width, height);
            }
            img.src = backgroundSVG;

            // Load avatar
            const avatar = new Image();
            avatar.onload = function() {
                ctx.drawImage(avatar, 10, 10, 140, 140);
            }
            avatar.src = guard;

            
            const player = await bloonUtils.getHHTPResult(`https://api.intruderfps.com/agents/76561197995577177`);

            if (player == null){
                await interaction.editReply({ content: 'No user found under that name.', components: [] });
                return;
            }

            const stats = await bloonUtils.getHHTPResult(`https://api.intruderfps.com/agents/76561197995577177/stats`);

            // Set font:
            ctx.font = '20px "Share Tech Mono"'; // set font
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Stats
            ctx.fillText(player.name,                   93.367, 45,  140);
            ctx.fillText(`Level ${player.stats.level}`, 93.367, 225, 140);

            ctx.textAlign = "left";

            const WLRatio = Math.ceil((stats.matchesWon / (stats.matchesWon + stats.matchesLost)) * 100);

            const totalWonMRounds = stats.roundsWonElimination + stats.roundsWonCapture + stats.roundsWonHack + stats.roundsWonTimer + stats.roundsWonCustom;
            const roundsWL = Math.ceil((totalWonMRounds / (totalWonMRounds + stats.roundsLost)) * 100);

            const kdRatio = (stats.kills / (stats.kills + stats.deaths));

            const timePlayed = bloonUtils.timePlayedToHours(stats.timePlayed);

            ctx.fillText(`Arrests     : ${stats.arrests}`,      182, 10,         230);
            ctx.fillText(`Captures    : ${stats.arrests}`,      182, 10 + 20,    230);
            ctx.fillText(`Hacks       : ${stats.networkHacks}`, 182, 10 + 40,    230);
            ctx.fillText(`Matches W/L : ${WLRatio}`,            182, 10 + 60,    230);
            ctx.fillText(`Rounds W/L  : ${roundsWL}`,           182, 10 + 80,    230);
            ctx.fillText(`K/D ratio   : ${kdRatio}`,            182, 10 + 100,   230);
            ctx.fillText(`Time played : ${timePlayed}`,         182, 10 + 120,   230);

            // Send attachment
            const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'serverlist.png' }); 
			

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