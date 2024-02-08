const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } = require('discord.js')
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const { moderationAction_Profile } = require('../utils/storedProcedures.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('moderationprofile')
		.setDescription(`Lists all of the moderation actions an user has. No one else will be able to see this reply.`)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers | PermissionFlagsBits.AttachFiles)
        .setDMPermission(false)
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('Discord user to check')
                .setRequired(true)
        ),
	async execute(interaction) {
		try{
			console.log(`\nmoderationProfile.js: ${interaction.member.id}`);

            if (interaction.channelId != config.modChatChannel){
                await interaction.reply( { ephemeral: true, content: "This command can only be used in #mod-chat" } );
                return;
            }

			await interaction.deferReply({ ephemeral: true }); // This makes it so it can take more than 3 seconds to reply.

            const target = interaction.options.getUser('target');
            if (target == null){
                await interaction.editReply( { content: "No valid user was specified" } );
                return;
            }

            const res = await moderationAction_Profile(target.id);

            if (res.length == 0){
                await interaction.editReply({ content: `There is no information about ${target.username} 😇 in the mod logs.` });
                return;
            }

            let currentPage = 0;
            let actionIndex = 1;
            const maxAmountOfChars = (res.length.toString()).length;
            const amountOfPages = Math.ceil(res.length / 10);

            // #region create pages

            const mpEmbeds = [];

            for (let index = 0; index < amountOfPages; index++) {
                const mpEmbed = new EmbedBuilder()
                .setColor(0x106487)
                .setTitle(`🔍 Moderation profile for ${target.username}`)
                .setTimestamp();

                let embedText = `Found ${res.length} records.`;

                if (res.length > 10){
                    embedText += ` Showing 10 per page.`;
                    embedText += `\nPage ${index+1} of ${amountOfPages}`;
                }

                for(const action of res.slice(index * 10, index*10 + 10)){
                    const date = new Date(action.timeStamp);
                    const dateText = `${date.toLocaleDateString("en-US", {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'utc'})} ${date.toLocaleTimeString("en-US")}`;
                    mpEmbed.addFields({ name: `-${actionIndex.toString().padStart(maxAmountOfChars)}-   ${bloonUtils.actionToEmoji[action.Type]} ${action.Type}`, value: `\`${dateText}\`\n**Reason:** ${action.reason}\n` });
                    actionIndex++;
                }
                
                mpEmbed.setDescription(embedText);

                mpEmbeds.push(mpEmbed); // Add to array.
            }

            // #endregion

            // If there's only one page break execution with no buttons.
            if (currentPage == amountOfPages - 1){
                await interaction.editReply({ embeds: [mpEmbeds[0]] });
                return; // End execution.
            }

            const previousButton = new ButtonBuilder()
                .setCustomId('previous_button')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true);

            const nextButton = new ButtonBuilder()
                .setCustomId('next_button')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary);
            
            let buttonRow = new ActionRowBuilder().addComponents(previousButton, nextButton);
			
			await interaction.editReply({ embeds: [mpEmbeds[currentPage]], components: [buttonRow] });

            const msg = await interaction.fetchReply();
            const collector = msg.createMessageComponentCollector({time: 60_000, componentType: ComponentType.Button}); // 1 minute

            // triggers when the times runs out
            collector.on('end', () => {
                interaction.editReply({ embeds: [mpEmbeds[currentPage]], components: [] });
            });

            // triggers when the buttons are pressed
            collector.on('collect', m => {

                // Only usable by the person who used the command. (unreachable atm)
                if (interaction.user.id != m.user.id){
                    m.reply({ content: `Sorry, this action can only be used by the person who used the /moderationProfile command.`, ephemeral: true });
                    return;
                }

                if (m.customId == 'next_button') {
                    if (currentPage < amountOfPages){
                        currentPage++;
                        if (currentPage == amountOfPages - 1){
                            nextButton.setDisabled(true);
                        }
                    }
                    previousButton.setDisabled(false);
                } 
                else if (m.customId == 'previous_button') {
                    if (currentPage > 0){
                        currentPage--;
                        if (currentPage == 0){
                            previousButton.setDisabled(true);
                        }
                    }
                    nextButton.setDisabled(false);
                } 

                buttonRow = new ActionRowBuilder().addComponents(previousButton, nextButton);

                m.update({ embeds: [mpEmbeds[currentPage]], components: [buttonRow] });
             });
			
			//await interaction.editReply({ embeds: [mpEmbeds[0]]});  	// Reply
		}catch(error){
			const answer = { content: `Error in moderationProfile: ${error}`, ephemeral: true };
			
			if (interaction.deferred && !interaction.replied) {
                await interaction.editReply(answer);
            } else if (interaction.deferred && interaction.replied) {
                await interaction.followUp(answer);
            } else {
                await interaction.reply(answer);
            }

			console.log(`Error in moderationProfile ${interaction.member.id}: ${error}`)
		}
	},
};