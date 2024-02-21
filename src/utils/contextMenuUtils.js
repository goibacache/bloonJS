/**
 * @typedef {import('discord.js').ModalBuilder} ModalBuilder
 * @typedef {import('discord.js').TextInputBuilder} TextInputBuilder
 * @typedef {import('discord.js').MessageContextMenuCommandInteraction} MessageContextMenuCommandInteraction
 * * @typedef {import('discord.js').UserContextMenuCommandInteraction} UserContextMenuCommandInteraction
 */

/*
 * The core of the modal actions.
 * This file exists only to stop me from duplicating code :^)
 */

const { ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder } = require('discord.js');
const bloonUtils = require('./utils.js');

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
        .setTitle(isMessageAction ? 'Creating a note and deleting message' : 'Creating a note on user');

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
const createTimeoutModal = (interaction) => {

    const { guild, channel, messageId, selectedUserId } = getGuildChannelMessageAndTarget(interaction);
    const isMessageAction = messageId != 0;

    const inputText = getInputText(interaction);

    // Create modal:
    const modal = new ModalBuilder()
        .setCustomId(`timeoutModal/${guild}/${channel}/${messageId}/${selectedUserId}`)
        .setTitle(isMessageAction ? 'Timing out and deleting message' : 'Timing out user');

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
    .setLabel('Timeout time (in minutes)') // The label is the prompt the user sees for this input
    .setStyle(TextInputStyle.Short) // Short means only a single line of text
    .setValue('10')
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

    const inputText = `You have received a warning from Superboss' Discord server for the following reason:\n-\n\nPlease do not reply this message as we're not able to see it and remember that continuously breaking the server rules will result in either a kick or a ban.`

    // Create modal:
    const modal = new ModalBuilder()
        .setCustomId(`warnModal/${guild}/${channel}/${messageId}/${selectedUserId}`)
        .setTitle(isMessageAction ? 'Warning and deleting message' : 'Warn a user (DM)');

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

    const inputText = `You have been kicked for the follow reasons:\n${getInputText(interaction)}`;

    // Create modal:
    const modal = new ModalBuilder()
        .setCustomId(`kickModal/${guild}/${channel}/${messageId}/${selectedUserId}`)
        .setTitle(isMessageAction ? 'Kicking and deleting message' : 'Kick a user and send a DM with the reason');

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
        attachments += inputText.length > 0 ? `\nWith the following attachments:\n` : 'Posted the following attachments:\n';

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
    createKickModal
};