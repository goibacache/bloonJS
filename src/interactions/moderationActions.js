const { SlashCommandBuilder, PermissionFlagsBits, ButtonStyle, ButtonBuilder, ActionRowBuilder, ComponentType } = require('discord.js')
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

    banEmbed.addFields(
        { name: `User ${moderationAction.conjugation}:`,  value: `**${actedUponMember.displayName ?? actedUponMember.username}**\n${actedUponMember.id}`, inline: true },
        { name: 'Handled by:',  value: `**${handledBy.displayName}**\n${handledBy.id}`, inline: true },
        { name: `${moderationAction.name} reason:`,  value: reason, inline: false },
    );


    return banEmbed;
}

/*
interface ModerationProfile(    
    handledByDiscordId;
    reason;
    timeStamp;
    Type;
    userDiscordId;
)
*/

const resolveButtonState = (currentActionIndex, maxActionIndex, previousButton, nextButton) => {
    if (currentActionIndex == 0){
        previousButton.setDisabled(true);
    }else{
        previousButton.setDisabled(false);
    }

    if (currentActionIndex == maxActionIndex){
        nextButton.setDisabled(true);
    }else{
        nextButton.setDisabled(false);
    }
}

/**
 * Loads and creates the moderation embeds
 * @param {number} userId 
 * @returns moderationProfileEmbeds, moderationProfile
 */
const loadModerationProfileEmbeds = async (moderationProfile) => {
    let moderationProfileEmbeds = [];

    let resume = ``;

    if (moderationProfile.length == 0){
        resume += `😇 This profile has **no** previous moderation actions\n`;
    }else{
        const groupedByType = bloonUtils.groupBy('Type', moderationProfile);

        groupedByType.forEach((group, index) => {
            const emoji = bloonUtils.moderationActions[group.Type].emoji;
            if (index > 0){
                resume += `\n`;
            }
            resume += `${emoji} **${group.Type}**: ${group.items.length}`;      
        });          
    }

    if (moderationProfile.length == 0){
        const roomEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`Moderation profile`)
        .setTimestamp();
    
        roomEmbed.addFields({ name: `No moderation actions found for this user`, value: `-` });
    
        roomEmbed.setFooter({ text: `SuperbossGames | #moderation action` });
    
        moderationProfileEmbeds.push(roomEmbed);
    }else{
        // TODO: Do 3 mod actions in ONE embed.

        moderationProfile.forEach((current, index) => {
            const roomEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Moderation profile`)
            .setTimestamp();

            roomEmbed.addFields({ name: `Moderation resume`, value: resume }); // Load resume

            // Create current embed
            const date = new Date(current.timeStamp);
            const dateText = `${date.toLocaleDateString("en-US", {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'utc'})} ${date.toLocaleTimeString("en-US")}`;
        
            const emoji = bloonUtils.moderationActions[current.Type].emoji;

            roomEmbed.addFields({ name: `Moderation action Nº ${index+1}`, value: `${emoji} **${current.Type}**\n**Reason:** \`\`${current.reason}\`\` \n\`\`${dateText}\`\`` });

            roomEmbed.setFooter({ text: `SuperbossGames | #moderation action` });
        
            moderationProfileEmbeds.push(roomEmbed);
        });
    }

    return moderationProfileEmbeds;
};

const getModerationProfileEmbed = (currentActionIndex, moderationProfileEmbeds, previousButton, nextButton) => {
    resolveButtonState(currentActionIndex, moderationProfileEmbeds.length - 1, previousButton, nextButton);
    return moderationProfileEmbeds[currentActionIndex];
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


            await interaction.deferReply({ ephemeral: true }); // This makes it so it can take more than 3 seconds to reply.

            //#region Button configuration
            const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel(`Confirm`)
            .setStyle(ButtonStyle.Danger);

            const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Primary);

            const previousButton = new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('Previous action')
            .setStyle(ButtonStyle.Secondary);

            const nextButton = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next action')
            .setStyle(ButtonStyle.Secondary);

            const acceptDenyButtons = new ActionRowBuilder()
            .addComponents(confirm, cancel, previousButton, nextButton);

            //#endregion

            // Get log of actions of a user
            let     currentActionIndex      = 0;
            const   moderationProfile       = await storedProcedures.moderationAction_Profile(target.id);
            const   moderationProfileEmbeds = await loadModerationProfileEmbeds(moderationProfile);
            let     moderationHistoryEmbed  = getModerationProfileEmbed(0, moderationProfileEmbeds, previousButton, nextButton);

            // Initial response:
            await interaction.editReply({
                content: `Are you sure you want to **${actionName}** ${target} for the following reason: ${reason}?`,
                components: [acceptDenyButtons],
                embeds: [moderationHistoryEmbed]
            });

            // Activate buttons:
            const currentMessage = await interaction.fetchReply();
            const collector = currentMessage.createMessageComponentCollector({time: 300_000, componentType: ComponentType.Button}); // 5 minutes

            // triggers when the times runs out, removes buttons
            collector.on('end', () => {
                interaction.editReply({ components: [] });
            });
                        
            // triggers when the buttons are pressed
            collector.on('collect', async (m) => {

                if (m.customId === 'previous' || m.customId === 'next'){
                    if (m.customId === 'previous' && currentActionIndex > 0){
                        console.log(`Previous moderationAction: ${actionName}\ntarget: ${target}\nreason: ${reason}\ntimeouttime: ${timeouttime}\ndirectmessage: ${directmessage}\nhoursofmessagestodelete: ${hoursofmessagestodelete}`);
                        currentActionIndex--;
                    }
    
                    if (m.customId === 'next' && currentActionIndex < moderationProfileEmbeds.length){
                        console.log(`Next moderationAction: ${actionName}\ntarget: ${target}\nreason: ${reason}\ntimeouttime: ${timeouttime}\ndirectmessage: ${directmessage}\nhoursofmessagestodelete: ${hoursofmessagestodelete}`);
                        currentActionIndex++;
                    }
    
                    let moderationHistoryEmbed = getModerationProfileEmbed(currentActionIndex, moderationProfileEmbeds, previousButton, nextButton);
    
                    m.update({ embeds: [moderationHistoryEmbed], files: [], components: [acceptDenyButtons] });
                }

                if (m.customId === 'cancel') {
                    console.log(`Canceled moderationAction: ${actionName}\ntarget: ${target}\nreason: ${reason}\ntimeouttime: ${timeouttime}\ndirectmessage: ${directmessage}\nhoursofmessagestodelete: ${hoursofmessagestodelete}`);
                    await m.update({ content: `${actionName} has been cancelled`, components: [], embeds: [] });
                    return;
                }

                if (m.customId === 'confirm') {

                    console.log(`Confirmed moderationAction: ${actionName}\ntarget: ${target}\nreason: ${reason}\ntimeouttime: ${timeouttime}\ndirectmessage: ${directmessage}\nhoursofmessagestodelete: ${hoursofmessagestodelete}`);

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
                    
                    if (caseID == 0) {
                        await interaction.editReply({ content: `Couldn't save ${actionName} in database.`, components: [] });
                        return;
                    }

                    switch(action){
                        case bloonUtils.moderationActions.Timeout:
                            try{
                                const userToBeMuted   = await interaction.member.guild.members.fetch(target.id);
                                await userToBeMuted.timeout(timeouttime * 60 * 1000);
                                if (directmessage){
                                    await target.send({content: `You have been timed out from Superboss' Discord server for the following reason: ${reason}. ${attachment != null ? `\nThis timeout has the following attachment: ${attachment.url}` : ''}  \nPlease do not reply this message as we're not able to see it and remember that continuously breaking the server rules will result in a kick or a ban`})
                                    .then(() => interaction.editReply({ content: `The user was timed out and the DM was delivered 🔥.`, components: [], embeds: [] }))
                                    .catch(() => interaction.editReply({ content: `The user was timed out but I couldn't send a DM, sorry.`, components: [], embeds: [] }));
                                }else{
                                    interaction.editReply({ content: `${target.username} has been timed out correctly and no DM was sent`, components: [], embeds: [] });
                                }
                            }catch(error){
                                console.log(`⚠ Error in Kick: ${error}`)
                                interaction.editReply({ content: `Sorry, couldn't mute that user. Maybe he's a server admin?`, components: [], embeds: [] });
                            }

                            break;
                        case bloonUtils.moderationActions.Kick:
                            try{
                                await interaction.guild.members.kick(target, reason);
                                if (directmessage){
                                    await target.send({content: `You have been kicked from Superboss' Discord server for the following reason: ${reason}. ${attachment != null ? `\nThis kick had the following attachment: ${attachment.url}` : ''}  \nPlease do not reply this message as we're not able to see it and remember that continuously breaking the server rules will result in a kick or a ban.`})
                                    .then(() => interaction.editReply({ content: `The user was kicked and the DM was delivered 🔥.`, components: [], embeds: [] }))
                                    .catch(() => interaction.editReply({ content: `The user was kicked but I couldn't send a DM, sorry.`, components: [], embeds: [] }));
                                }else{
                                    interaction.editReply({ content: `${target.username} has been kicked correctly and no DM was sent`, components: [], embeds: [] });
                                }
                            }catch(error){
                                console.log(`Error in Kick: ${error}`)
                                interaction.editReply({ content: `Sorry, there was an error when trying to kick that user.\n${error.message}`, components: [], embeds: [] });
                            }

                            break;
                        case bloonUtils.moderationActions.Ban:
                            try{
                                await interaction.guild.bans.create(target, { reason, deleteMessageSeconds: hoursofmessagestodelete * 3600 }); // 12 hours by default.
                                if (directmessage){
                                    await target.send({content: `You have been banned from Superboss' Discord server for the following reason: ${reason}. ${attachment != null ? `\nThis ban had the following attachment: ${attachment.url}` : ''}  \nPlease do not reply this message as we're not able to see it and remember that continuously breaking the server rules will result in a kick or a ban.`})
                                    .then(() => interaction.editReply({ content: `The user was banned and the DM was delivered 🔥.`, components: [], embeds: [] }))
                                    .catch(() => confirmation.update({ content: `Couldn't DM the user.`, components: [], embeds: [] }));
                                }else{
                                    interaction.editReply({ content: `${target.username} has been banned correctly and no DM was sent`, components: [], embeds: [] });
                                }
                            }catch(error){
                                interaction.editReply({ content: `Couldn't find the user to be banned. Error: ${error}`, components: [], embeds: [] });
                                return;
                            }

                            break;
                        case bloonUtils.moderationActions.Warn:
                            try{
                                await target.send({content: `You have received a warning from Superboss' Discord server for the following reason: ${reason}. ${attachment != null ? `\nThis warning had the following attachment: ${attachment.url}` : ''}  \nPlease do not reply this message as we're not able to see it and remember that continuously breaking the server rules will result in a kick or a ban.`})
                                .then(() => interaction.editReply({ content: `The warning was delivered via DM 🔥.`, components: [], embeds: [] }))
                                .catch(() => confirmation.update({ content: `Couldn't DM the user, sorry`, components: [], embeds: [] }));
                            }catch(error){
                                interaction.editReply({ content: `Sorry, can't send a DM to this user. Consider making a note and/or contact the user directly.`, components: [], embeds: [] });
                                return;
                            }

                            break;
                        case bloonUtils.moderationActions.Unban:
                            try{
                                const bans = await interaction.guild.bans.fetch();

                                let unbanMessage = ``;
                            
                                if (bans.size == 0) {
                                    unbanMessage = `There are no banned user on this server.`;
                                    return;
                                }

                                const bannedUser = await bans.find(ban => ban.user.id === target.id);
                                if (!bannedUser) {
                                    unbanMessage = `The ID stated is not banned from this server.`;
                                    return;
                                }
                                // Removes the ban
                                await interaction.guild.bans.remove(target.id, reason);

                                interaction.editReply({ content: unbanMessage, components: [], embeds: [] });
                            
                            }catch(error){
                                console.log(`Unban Error: ${error}`)
                                interaction.editReply({ content: `There was an error unbanning the user.`, components: [], embeds: [] });
                            }
                            
                            break;

                        case bloonUtils.moderationActions.Note:
                            try{
                                interaction.editReply({ content: `Note created successfully.`, components: [], embeds: [] });
                            }catch(error){
                                console.log(`Note Error: ${error}`)
                                interaction.editReply({ content: `There was an error creating the note for the user.`, components: [], embeds: [] });
                            }

                            break;
                    }

                    // Write the moderation action in the chat to log it in the DDBB
                    channel.send({ embeds: [actionEmbed]});
                    // TODO: upload attachment as blob.
                    await storedProcedures.moderationAction_Insert(action, target.id, reason, interaction.member.id); // Also save it on the DB :D
                }
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