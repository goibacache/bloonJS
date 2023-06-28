import { Events } from "discord.js";

import fs 	from 'fs';
const config  = JSON.parse(fs.readFileSync('./config.json'));

const commands = [".ltp", ".servers"]

export const evnt = {
    name: Events.MessageCreate,
	async execute(message) {
        console.log(`${message.author.username}: ${message.content}`);
        
        // Doesn't include a command.
        if (!commands.includes(message.content.trim())){
            return;
        }

        // Includes a command but not in the right channel.
        if (commands.includes(message.content.trim()) && !isInBloonCommandsChannel(message)){
            message.react("🚫");        // React
            return;
        }

        // .ltp
		if (message.content === commands[0]) {
            
            const member = message.guild.members.cache.get(message.author.id);  // Get current member
            const ltpRole = await message.guild.roles.fetch(config.role_LookingToPlay);

            // Check if the user already has "looking to play"
            if (member.roles.cache.some(role => role.id === config.role_LookingToPlay)){
                member.roles.remove(ltpRole);   // Remove
            }else{
                member.roles.add(ltpRole);      // Assign
                
            }
            message.react("👍");                // React
        }

        // .servers
		if (message.content === commands[1]) {

            message.reply("Work in progress, ok?")
        }
	},
};

function isInBloonCommandsChannel(message){
    return message.channelId == config.bloonCommandsChannel;
}