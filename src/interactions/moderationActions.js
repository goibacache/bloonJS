const { SlashCommandBuilder, PermissionFlagsBits, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require('discord.js')
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const storedProcedures = require('../utils/storedProcedures.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('moderationactions')
		.setDescription(`Does an admin action and creates a log in the #moderation-actions channel.`)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers | PermissionFlagsBits.AttachFiles)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The action to be taken')
                .setRequired(true)
                .addChoices(
                    { name: 'Note',     value: 'Note'       },
                    { name: 'Warn',     value: 'Warn'       },
                    { name: 'Timeout',  value: 'Timeout'    },
                    { name: 'Kick',     value: 'Kick'       },
                    { name: 'Ban',      value: 'Ban'        },
                    { name: 'Unban',    value: 'Unban'      }
                ))
        .addUserOption(option =>
			option
				.setName('target')
				.setDescription('Discord Id to act upon')
				.setRequired(true)
		)
        .addStringOption(option =>
			option
				.setName('reason')
				.setDescription('Reason for action')
				.setRequired(true)
		)
        .addAttachmentOption(option => 
            option
                .setName('evidence')
                .setDescription('Optional evidence for the action')
                .setRequired(false)
        )
        .addNumberOption(option => 
            option
                .setName('timeouttime')
                .setDescription('Only used in timeout, time in minutes to timeout a person')
                .setRequired(false)
        )
        .setDMPermission(false),
	async execute(interaction) {
		try{
            const actionName    = interaction.options.getString('type'); // Actually value, but eh.
            const action        = bloonUtils.moderationActions[actionName];
            const target        = interaction.options.getUser('target');
            const reason        = interaction.options.getString('reason') ?? 'No reason provided';
            const attachment    = interaction.options.getAttachment("evidence");
            const timeouttime   = interaction.options.getNumber('timeouttime') ?? 10;

            const confirm = new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel(`Confirm ${actionName}`)
                .setStyle(ButtonStyle.Danger);
    
            const cancel = new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Primary);
    
            const row = new ActionRowBuilder()
                .addComponents(confirm, cancel);
    
            const response = await interaction.reply({
                content: `Are you sure you want to ${actionName} ${target} for reason: ${reason}?`,
                components: [row],
                ephemeral: true
            });

            const collectorFilter = i => i.user.id === interaction.user.id; // Only the same user can use the buttons


            //const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });

            await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 })
            .then(async (confirmation) => {
                if (confirmation.customId === 'cancel') {
                    await confirmation.update({ content: `${actionName} has been cancelled`, components: [] });
                    return;
                }

                if (confirmation.customId === 'confirm') {
                    // Store in DDBB and create EMBED
                    const caseID            = await storedProcedures.moderationAction_Insert(action, target.id, reason, interaction.member.id);
                    const userToBeActedUpon = action == bloonUtils.moderationActions.Unban ? target : await interaction.member.guild.members.fetch(target.id); // Only get the user if he's in the server.
                    const channel           = await interaction.member.guild.channels.fetch(config.moderationActionsChannel);
                    const actionEmbed       = bloonUtils.createModerationActionEmbed(action, userToBeActedUpon, caseID, reason, interaction.member, attachment?.url);
                    
                    if (caseID == 0) {
                        await confirmation.update({ content: `Couldn't save ${actionName} in database.`, components: [] });
                        return;
                    }

                    switch(action){
                        case bloonUtils.moderationActions.Timeout:
                                try{
                                    const usertToBeMuted   = await interaction.member.guild.members.fetch(target.id);
                                    await usertToBeMuted.timeout(timeouttime * 60 * 1000);
                                }catch(error){
                                    confirmation.update({ content: `Sorry, can't mute a server adminsitrator.`, components: [] });
                                    return;
                                }
                            break;

                        case bloonUtils.moderationActions.Kick:
                            try{
                                await target.send({content: `You have been kicked from the server for the following reason: ${reason}`})
                                .catch(() => confirmation.update({ content: `Couldn't DM the user.`, components: [] }));
                                await interaction.guild.members.kick(target, reason);
                            }catch(error){
                                confirmation.update({ content: `Sorry, there was an error kicking that person. Error: ${error}`, components: [] });
                                return;
                            }

                            break;
                        case bloonUtils.moderationActions.Ban:
                            try{
                                await target.send({content: `You have been banned from the server for the following reason: ${reason}`})
                                .catch(() => confirmation.update({ content: `Couldn't DM the user.`, components: [] }));
                                await interaction.guild.bans.create(target, { reason });
                            }catch(error){
                                confirmation.update({ content: `Couldn't find the user to be banned. Error: ${error}`, components: [] });
                                return;
                            }
                            break;

                        case bloonUtils.moderationActions.Warn:
                            try{
                                await target.send({content: `You have received a warning from ${interaction.member.displayName} for the following reason: ${reason}. ${attachment != null ? `\nThis warning had the following attachment: ${attachment.url}` : ''}  \nPlease do not reply this message as we're not able to see it.`})
                            }catch(error){
                                confirmation.update({ content: `Sorry, can't send a DM to this user. Consider making a note.`, components: [] });
                                return;
                            }
                            break;

                        case bloonUtils.moderationActions.Unban:
                            await interaction.guild.bans.fetch()
                            .then(async bans => {
                                if (bans.size == 0) {
                                    await confirmation.update({ content: `There are no banned user on this server.`, ephemeral: true });
                                    return;
                                }

                                const bannedUser = bans.find(ban => ban.user.id === target.id);
                                if (!bannedUser) {
                                    await confirmation.update({ content: `The ID stated is not banned from this server.`, ephemeral: true });
                                    return;
                                }
                                // Removes the ban
                                await interaction.guild.bans.remove(target.id, reason);
                            });
                            
                            break;

                        case bloonUtils.moderationActions.Note:
                            //  For real it doesn't have to do anything, it's all handled after this :D
                            break;
                    }

                    await confirmation.update({ content: `${target.username} has been ${action.conjugation} for reason: ${reason}`, components: [] });      
                    // Write moderation action in the chat to log it.
                    channel.send({ embeds: [actionEmbed]});

                }
            })
            .catch(async error => {
                await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling. Error: ' + error, components: [] });
            });

		}catch(error){
			console.error("\nError in ban.js: " + error);
            await interaction.editReply({ content: 'There was an error, sorry. Error: ' + error, components: [] });
		}
	},
};