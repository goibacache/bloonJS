/*
 * The core of the modal actions.
 * This file exists only to stop me from duplicating code :^)
 */

const { ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder } = require('discord.js');
const bloonUtils = require('./utils.js');
const { registerFont, createCanvas, Image } = require('canvas');

/**
 * @typedef {import('discord.js').ModalBuilder} ModalBuilder
 * @typedef {import('discord.js').TextInputBuilder} TextInputBuilder
 * @typedef {import('discord.js').MessageContextMenuCommandInteraction} MessageContextMenuCommandInteraction
 * * @typedef {import('discord.js').UserContextMenuCommandInteraction} UserContextMenuCommandInteraction
 */

/**
 * 
 * @param {MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction} interaction
 * @returns ModalBuilder
 */
const createNoteModal = (interaction) => {

    const { guild, channel, messageId, selectedUserId } = getGuildChannelMessageAndTarget(interaction);
    const isMessageAction = messageId != 0;

    const inputText = getInputText(interaction);

    // Create modal:
    const modal = new ModalBuilder()
        .setCustomId(`noteModal/${guild}/${channel}/${messageId}/${selectedUserId}`)
        .setTitle(isMessageAction ? 'Create note & delete message (No DM)' : 'Note user (No DM)');

    // Create the text input components
    const note = new TextInputBuilder()
        .setCustomId('noteText')
        .setLabel('Note') // The label is the prompt the user sees for this input
        .setStyle(TextInputStyle.Paragraph) // Short means only a single line of text
        .setValue(inputText)
        .setRequired(true)
        .setPlaceholder('The note text that will be saved in the evidence channel');

    const noteActionRow = new ActionRowBuilder().addComponents(note);

    // Add inputs to the modal
    modal.addComponents(noteActionRow);

    return modal;
}

/**
 * 
 * @param {MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction} interaction
 * @returns ModalBuilder
 */
const createTimeoutModal = (interaction, defaultTime = '10') => {

    const { guild, channel, messageId, selectedUserId } = getGuildChannelMessageAndTarget(interaction);
    const isMessageAction = messageId != 0;

    const inputText = getInputText(interaction);

    // Create modal:
    const modal = new ModalBuilder()
        .setCustomId(`timeoutModal/${guild}/${channel}/${messageId}/${selectedUserId}`)
        .setTitle(isMessageAction ? 'Timeout user & delete message (DM)' : 'Timeout user (DM)');

    // Create the text input components
    const note = new TextInputBuilder()
        .setCustomId('noteText')
        .setLabel('Note') // The label is the prompt the user sees for this input
        .setStyle(TextInputStyle.Paragraph) // Short means only a single line of text
        .setValue(inputText)
        .setRequired(true)
        .setPlaceholder('The note text that will be saved in the evidence channel');

    const noteActionRow = new ActionRowBuilder().addComponents(note);

    // Create the text input components
    const timeoutTime = new TextInputBuilder()
    .setCustomId('timeoutText')
    .setLabel('Timeout time in minutes [1-40320]') // The label is the prompt the user sees for this input
    .setStyle(TextInputStyle.Short) // Short means only a single line of text
    .setValue(defaultTime)
    .setMinLength(1)
    .setMaxLength(5)
    .setRequired(true)
    .setPlaceholder('Amount of minutes to timeout for');

    const timeoutTimeRow = new ActionRowBuilder().addComponents(timeoutTime);

    // Add inputs to the modal
    modal.addComponents(noteActionRow);
    modal.addComponents(timeoutTimeRow);

    return modal;
}

/**
 * 
 * @param {MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction} interaction
 * @returns ModalBuilder
 */
const createWarnModal = (interaction) => {

    const { guild, channel, messageId, selectedUserId } = getGuildChannelMessageAndTarget(interaction);
    const isMessageAction = messageId != 0;

    const inputText = `You have been warned for the following:\n\n${getInputText(interaction)}\nRemember that continuously breaking the server rules will result in either a kick or a ban.`

    // Create modal:
    const modal = new ModalBuilder()
        .setCustomId(`warnModal/${guild}/${channel}/${messageId}/${selectedUserId}`)
        .setTitle(isMessageAction ? 'Warn user & delete message (DM)' : 'Warn user (DM)');

    // Create the text input components
    const note = new TextInputBuilder()
        .setCustomId('warnText')
        .setLabel('Warning message (DM & evidence)') // The label is the prompt the user sees for this input
        .setStyle(TextInputStyle.Paragraph) // Short means only a single line of text
        .setValue(inputText)
        .setRequired(true)
        .setPlaceholder('The warning/DM that will be sent to the user and saved in the evidence channel');

    const noteActionRow = new ActionRowBuilder().addComponents(note);

    // Add inputs to the modal
    modal.addComponents(noteActionRow);

    return modal;
}

/**
 * 
 * @param {MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction} interaction
 * @returns ModalBuilder
 */
const createKickModal = (interaction) => {

    const { guild, channel, messageId, selectedUserId } = getGuildChannelMessageAndTarget(interaction);
    const isMessageAction = messageId != 0;

    const inputText = `You have been kicked for the following reasons:\n\n${getInputText(interaction)}`;

    // Create modal:
    const modal = new ModalBuilder()
        .setCustomId(`kickModal/${guild}/${channel}/${messageId}/${selectedUserId}`)
        .setTitle(isMessageAction ? 'Kick user & delete message (DM)' : 'Kick user (DM)');

    // Create the text input components
    const note = new TextInputBuilder()
        .setCustomId('kickText')
        .setLabel('Kick message (DM & evidence)') // The label is the prompt the user sees for this input
        .setStyle(TextInputStyle.Paragraph) // Short means only a single line of text
        .setValue(inputText)
        .setRequired(true)
        .setPlaceholder('The kick/DM that will be sent to the user and saved in the evidence channel');

    const noteActionRow = new ActionRowBuilder().addComponents(note);

    // Add inputs to the modal
    modal.addComponents(noteActionRow);

    return modal;
}


/**
 * 
 * @param {MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction} interaction
 * @returns ModalBuilder
 */
const createBanModal = (interaction) => {

    const { guild, channel, messageId, selectedUserId } = getGuildChannelMessageAndTarget(interaction);
    const isMessageAction = messageId != 0;

    const inputText = `You have been banned for the following reasons:\n\n${getInputText(interaction)}`;

    // Create modal:
    const modal = new ModalBuilder()
        .setCustomId(`banModal/${guild}/${channel}/${messageId}/${selectedUserId}`)
        .setTitle(isMessageAction ? 'Ban user & delete message (DM)' : 'Ban user (DM)');

    // Create the text input components
    const banText = new TextInputBuilder()
        .setCustomId('banText')
        .setLabel('Ban message (DM & evidence)') // The label is the prompt the user sees for this input
        .setStyle(TextInputStyle.Paragraph) // Short means only a single line of text
        .setValue(inputText)
        .setRequired(true)
        .setPlaceholder('The ban/DM that will be sent to the user and saved in the evidence channel');

    // Create the text input components
    const hoursOfMessagesToDelete = new TextInputBuilder()
        .setCustomId('hoursToDelete')
        .setLabel('Hours of messages to delete [0-168]') // The label is the prompt the user sees for this input
        .setStyle(TextInputStyle.Short) // Short means only a single line of text
        .setValue("12")
        .setRequired(true)
        .setPlaceholder('The ban/DM that will be sent to the user and saved in the evidence channel');

    const banTextActionRow                  = new ActionRowBuilder().addComponents(banText);
    const hoursOfMessagesToDeleteActionRow  = new ActionRowBuilder().addComponents(hoursOfMessagesToDelete);

    // Add inputs to the modal
    modal.addComponents(banTextActionRow);
    modal.addComponents(hoursOfMessagesToDeleteActionRow);

    return modal;
}


/**
 * 
 * @param {MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction} interaction
 * @returns ModalBuilder
 */
const createUnbanModal = (interaction) => {

    const { guild, channel, messageId, selectedUserId } = getGuildChannelMessageAndTarget(interaction);
    //const isMessageAction = messageId != 0;

    const inputText = `You have been unbanned from Superboss's discord server.`;

    // Create modal:
    const modal = new ModalBuilder()
        .setCustomId(`unbanModal/${guild}/${channel}/${messageId}/${selectedUserId}`)
        .setTitle('Unbanning user');

    // Create the text input components
    const unbanText = new TextInputBuilder()
        .setCustomId('unbanText')
        .setLabel('Unban message (DM & evidence)') // The label is the prompt the user sees for this input
        .setStyle(TextInputStyle.Paragraph) // Short means only a single line of text
        .setValue(inputText)
        .setRequired(true)
        .setPlaceholder('The unban direct message that will be sent to the user and saved in the evidence channel');

    const unbanTextActionRow = new ActionRowBuilder().addComponents(unbanText);

    // Add inputs to the modal
    modal.addComponents(unbanTextActionRow);

    return modal;
}


/**
 * Gets the input text from the selected message. If message is null, it returns empty.
 * @param {MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction} interaction
 * @returns string
 */
const getInputText = (interaction) => {
    // If it doesn't have a targetMessage, then stop trying to get the message's text
    if (interaction.targetMessage == null) return "";

    let inputText = "";

    if (interaction.targetMessage.content.length > 0){
        inputText = `Posted the following message:\n\`\`\`${bloonUtils.deleteCodeBlocksFromText(interaction.targetMessage.content)}\`\`\``;
    }

    // Attachments:
    let attachments = "";
    if (interaction.targetMessage.attachments.size > 0){
        attachments += inputText.length > 0 ? `\nWith the following attachment(s):\n` : 'Posted the following attachment(s):\n';

        interaction.targetMessage.attachments.forEach(async (attachment) => {
            attachments += `[${attachment.name}](<${attachment.url}>)\n`
        });

        inputText += `\n${attachments}`;
    }

    return inputText;
}

/**
 * 
 * @param {MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction} interaction 
 * @returns string, string, string, number
 */
const getGuildChannelMessageAndTarget = (interaction) => {
    const guild 			= interaction.targetMessage ? interaction.targetMessage.guildId : 0;
    const channel 			= interaction.targetMessage ? interaction.targetMessage.channelId : 0;
    const messageId 		= interaction.targetMessage ? interaction.targetMessage.id : 0;
    const selectedUserId 	= interaction.targetMessage ? interaction.targetMessage.author.id : interaction.targetUser.id;

    return { guild, channel, messageId, selectedUserId };
}

module.exports = {
    createNoteModal,
    createTimeoutModal,
    createWarnModal,
    createKickModal,
    createBanModal,
    createUnbanModal,
    getGuildChannelMessageAndTarget
};