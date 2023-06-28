import { EmbedBuilder } from "@discordjs/builders";
import { Events } from "discord.js";

import fs 	from 'fs';
const config  = JSON.parse(fs.readFileSync('./config.json'));

export const evnt = {
    name: Events.GuildMemberAdd,
	async execute(member) {
		const agentRole = await member.guild.roles.fetch(config.role_Agent); // Lookup the "agent" role

		try{
			member.roles.add(agentRole);    // Assign it
		}catch(error){
			console.error("Error in GuildMemberAdd - Couldn't base role 'agent': "+error);
		}

		// Welcome message
		const channel 	= member.guild.channels.cache.get(config.intruderGeneralChannel);
		const avatarURL	= member.user.avatarURL();
		const dateJoined = new Date(member.joinedTimestamp).toDateString();

		// Creates the embed
		const exampleEmbed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(`New User Joined | ${member.user.username}`)
		.setThumbnail(avatarURL)
		.addFields(
			{ name: 'ID', value: member.user.id, inline: true }
		)
		.setTimestamp()
		.setFooter({ text: `Account Created: ${dateJoined}` });

		// Sends the embed into the General channel.
		channel.send({ embeds: [exampleEmbed] });
	},
};