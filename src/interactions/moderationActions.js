const { SlashCommandBuilder, PermissionFlagsBits, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require('discord.js')
const { EmbedBuilder } = require('@discordjs/builders');
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const storedProcedures = require('../utils/storedProcedures.js');

/**
 * Adds the basic command action: Target, reason & evidence.
 * @param {*} command 
 * @returns 
 */
const addBasicInteractionOptions = (command) => {
    return command
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
            .setMaxLength(6000)
            .setMinLength(1)
    )
    .addAttachmentOption(option => 
        option
            .setName('evidence')
            .setDescription('[Default: empty] Optional evidence for the action')
            .setRequired(false)
    )
}


const createModerationActionEmbed = (moderationAction, actedUponMember, caseId, reason, handledBy, attachmentUrl) => {
    const banEmbed = new EmbedBuilder()
    .setColor(moderationAction.color)
    .setTitle(`${moderationAction.name}: Case #${caseId}`)
    .setTimestamp();

    if (attachmentUrl != null && attachmentUrl.length > 0){
        banEmbed.setImage(attachmentUrl)
    }

    // console.log("createModerationActionEmbed > actedUponMember", actedUponMember);

    banEmbed.addFields(
        { name: `User ${moderationAction.conjugation}:`,  value: `**${actedUponMember.displayName ?? actedUponMember.username}**\n${actedUponMember.id}`, inline: true },
        { name: 'Handled by:',  value: `**${handledBy.displayName}**\n${handledBy.id}`, inline: true },
        { name: `${moderationAction.name} reason:`,  value: reason, inline: false },
    );


    return banEmbed;
}

const command = {
    cooldown: 0,
    data: new SlashCommandBuilder()
        .setName('moderationactions')
        .setDescription(`Does an admin action and creates a log in the #moderation-actions channel.`)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers | PermissionFlagsBits.AttachFiles)
        .setDMPermission(false)
        .addSubcommand(subcommand => {
            subcommand
                .setName('note')
                .setDescription('Creates a note about a user');
    
            return addBasicInteractionOptions(subcommand)
        })
        .addSubcommand(subcommand => {
            subcommand
                .setName('warn')
                .setDescription('Warns a user directly via DM and adds a note');
    
            return addBasicInteractionOptions(subcommand);
        })
        .addSubcommand(subcommand => {
            subcommand
                .setName('timeout')
                .setDescription('Timeouts a user');
    
            return  addBasicInteractionOptions(subcommand)
                    .addBooleanOption(option =>
                        option.setName('directmessage')
                        .setRequired(false)
                        .setDescription('[Default: False] Whether or not a DM will be sent towards the user')
                    )
                    .addNumberOption(option => 
                        option
                            .setName('timeouttime')
                            .setDescription('[Default: 10] Time in minutes to timeout a person')
                            .setRequired(false)
                    );
        })
        .addSubcommand(subcommand => {
            subcommand
                .setName('kick')
                .setDescription('Kicks a user from the server and creates a note');
    
            return  addBasicInteractionOptions(subcommand)
                    .addBooleanOption(option =>
                        option.setName('directmessage')
                        .setRequired(false)
                        .setDescription('[Default: False] Whether or not a DM will be sent towards the user')
                    )
        })
        .addSubcommand(subcommand => {
            subcommand
                .setName('ban')
                .setDescription('Bans a user from the server and creates a note');
            return  addBasicInteractionOptions(subcommand)
                    .addBooleanOption(option =>
                        option.setName('directmessage')
                        .setRequired(false)
                        .setDescription('[Default: False] Whether or not a DM will be sent towards the user')
                    )
                    .addNumberOption(option => 
                        option.setName('hoursofmessagestodelete')
                        .setRequired(false)
                        .setDescription('[Default: 12] Number of hours of messages to delete, must be between 0 and 168 (7 days), inclusive')
                        .setMinValue(0)
                        .setMaxValue(168)
                    )
        })
        .addSubcommand(subcommand => {
            subcommand
                .setName('unban')
                .setDescription('Removes the ban from a user');
            return addBasicInteractionOptions(subcommand);
        }),
    async execute(interaction) {
        try{
            console.log(`moderationactions.js: ${interaction.member.id}`);
            const subCommand                = interaction.options.getSubcommand();
            const actionName                = bloonUtils.capitalizeFirstLetter(subCommand); // Actually value, but eh.
            const action                    = bloonUtils.moderationActions[actionName];
            const target                    = interaction.options.getUser('target');
            const reason                    = interaction.options.getString('reason') ?? 'No reason provided';
            const attachment                = interaction.options.getAttachment("evidence");
            const timeouttime               = interaction.options.getNumber('timeouttime') ?? 10;
            const directmessage             = interaction.options.getBoolean('directmessage') ?? false;
            const hoursofmessagestodelete   = interaction.options.getNumber('hoursofmessagestodelete') ?? 12;

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
                content: `Are you sure you want to ${actionName} ${target} for the following reason: ${reason}?`,
                components: [row],
                ephemeral: true
            });
    
            const collectorFilter = i => i.user.id === interaction.user.id; // Only the same user can use the buttons
    
            await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 })
            .then(async (confirmation) => {
                if (confirmation.customId === 'cancel') {
                    console.log(`moderationactions.js: cancelled by ${interaction.member.id}`);
                    await confirmation.update({ content: `${actionName} has been cancelled`, components: [] });
                    return;
                }

                console.log(`Confirmed moderationAction: ${actionName}\ntarget: ${target}\nreason: ${reason}\ntimeouttime: ${timeouttime}\ndirectmessage: ${directmessage}\nhoursofmessagestodelete: ${hoursofmessagestodelete}`);
    
                if (confirmation.customId === 'confirm') {
                    // Store in DDBB and create EMBED

                    let userToBeActedUpon;
                    try{
                        userToBeActedUpon = await interaction.member.guild.members.fetch(target.id);
                    }catch(error){
                        userToBeActedUpon = target;
                    }
                    
                    //const userToBeActedUpon = await interaction.member.guild.members.fetch(target.id) ?? target; // Only get the user if he's in the server.
                    const caseID            = await storedProcedures.moderationAction_GetNewId(action);
                    const channel           = await interaction.member.guild.channels.fetch(config.moderationActionsChannel);
                    const actionEmbed       = createModerationActionEmbed(action, userToBeActedUpon, caseID, reason, interaction.member, attachment?.url);
                    let   overrideMessage   = null; // Useful to try and catch unban errors.
                    
                    if (caseID == 0) {
                        await confirmation.update({ content: `Couldn't save ${actionName} in database.`, components: [] });
                        return;
                    }
    
                    switch(action){
                        case bloonUtils.moderationActions.Timeout:
                            try{
                                const userToBeMuted   = await interaction.member.guild.members.fetch(target.id);
                                if (directmessage){
                                    await target.send({content: `You have been timed out from Superboss' Discord server for the following reason: ${reason}. ${attachment != null ? `\nThis time out had the following attachment: ${attachment.url}` : ''}  \nPlease do not reply this message as we're not able to see it.`})
                                }
                                await userToBeMuted.timeout(timeouttime * 60 * 1000);
                            }catch(error){
                                confirmation.update({ content: `Sorry, can't mute a server administrator.`, components: [] });
                                return;
                            }
                            break;
    
                        case bloonUtils.moderationActions.Kick:
                            try{
                                if (directmessage){
                                    await target.send({content: `You have been kicked from Superboss' Discord server for the following reason: ${reason}. ${attachment != null ? `\nThis kick had the following attachment: ${attachment.url}` : ''}  \nPlease do not reply this message as we're not able to see it.`})
                                    .catch(() => confirmation.update({ content: `Couldn't DM the user.`, components: [] }));
                                }
                                await interaction.guild.members.kick(target, reason);
                            }catch(error){
                                confirmation.update({ content: `Sorry, there was an error kicking that person. Error: ${error}`, components: [] });
                                return;
                            }
    
                            break;
                        case bloonUtils.moderationActions.Ban:
                            try{
                                if (directmessage){
                                    await target.send({content: `You have been banned from Superboss' Discord server for the following reason: ${reason}. ${attachment != null ? `\nThis ban had the following attachment: ${attachment.url}` : ''}  \nPlease do not reply this message as we're not able to see it.`})
                                    .catch(() => confirmation.update({ content: `Couldn't DM the user.`, components: [] }));
                                }
                                await interaction.guild.bans.create(target, { reason, deleteMessageSeconds: hoursofmessagestodelete * 3600 }); // 12 hours by default.
                            }catch(error){
                                confirmation.update({ content: `Couldn't find the user to be banned. Error: ${error}`, components: [] });
                                return;
                            }
                            break;
    
                        case bloonUtils.moderationActions.Warn:
                            try{
                                await target.send({content: `You have received a warning from Superboss' Discord server for the following reason: ${reason}. ${attachment != null ? `\nThis warning had the following attachment: ${attachment.url}` : ''}  \nPlease do not reply this message as we're not able to see it.`})
                            }catch(error){
                                confirmation.update({ content: `Sorry, can't send a DM to this user. Consider making a note and/or contact the user directly.`, components: [] });
                                return;
                            }
                            break;
    
                        case bloonUtils.moderationActions.Unban:
                            try{
                                const bans = await interaction.guild.bans.fetch()
                            
                                if (bans.size == 0) {
                                    overrideMessage = `There are no banned user on this server.`;
                                    return;
                                }
    
                                const bannedUser = await bans.find(ban => ban.user.id === target.id);
                                if (!bannedUser) {
                                    overrideMessage = `The ID stated is not banned from this server.`;
                                    return;
                                }
                                // Removes the ban
                                await interaction.guild.bans.remove(target.id, reason);
                            
                            }catch(error){
                                overrideMessage = `There was an error unbanning the user. Error: ${error}`
                            }
                            
                            break;
    
                        case bloonUtils.moderationActions.Note:
                            //  For real it doesn't have to do anything, it's all handled after this :D
                            break;
                    }
    
                    // If overrideMessage is set, that's the message, if not, the standard one.
                    let content = overrideMessage ?? `${target.username} has been ${action.conjugation} for the following reason: ${reason}`;
    
                    await confirmation.update({ content: content, components: [] });      
    
                    // If nothing overwrote the message, then write the moderation action in the chat to log it in the DDBB
                    if (overrideMessage == null){
                        channel.send({ embeds: [actionEmbed]});
                        await storedProcedures.moderationAction_Insert(action, target.id, reason, interaction.member.id); // Also save it on the DB :D
                    }
    
                }
            })
            .catch(async error => {
                await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling. Error: ' + error, components: [] });
                console.error(`Possible error in moderationActions.js for ID ${interaction.member.id}, action ${action.name}: ` + error);
            });
    
        }catch(error){
            const answer = { content: 'There was an error in /moderationActions, sorry.', components: [], ephemeral: true };
            
			if (interaction.deferred && !interaction.replied) {
                await interaction.editReply(answer);
            } else if (interaction.deferred && interaction.replied) {
                await interaction.followUp(answer);
            } else {
                await interaction.reply(answer);
            }

            console.error(`Error in moderationActions.js for ID ${interaction.member.id}, action ${interaction.options.getString('type')}: ` + error);
        }
    }
}

// Basic export
module.exports = command;