const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { localGuildManager } = require('../utils/guildManager');

/**
 * Indicates which subtype it has to be able to read the properties.
 */
const subTypes = {
    Channel: 'channel',
    Role: 'role'
}

const comandOptions = {
    welcomeChannel:         { title: 'welcomechannel',  description: 'The welcome message channel',     subtype: subTypes.Channel   },
    leaveChannel:           { title: 'leavechannel',    description: 'Leave message text channel',      subtype: subTypes.Channel   },
    autoRoleOnJoin:         { title: 'autorole',        description: 'Auto role to assign on join',     subtype: subTypes.Role      },
    autoRoleOnFirstMessage: { title: 'autoroleFM',      description: 'Auto role on first message',      subtype: subTypes.Role      }
};

module.exports = {
    cooldown: 0,
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription(`Setup bloon for server administrators`)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.BanMembers)
        .addSubcommand(subcommand => subcommand
                                        .setName(comandOptions.welcomeChannel.title)
                                        .setDescription(comandOptions.welcomeChannel.description)
                                        .addChannelOption(option => option
                                                                        .setName('channel')
                                                                        .setDescription('The channel to setup')
                                                        )
                        )
        .addSubcommand(subcommand => subcommand
                                .setName(comandOptions.leaveChannel.title)
                                .setDescription(comandOptions.leaveChannel.description)
                                .addChannelOption(option => option
                                                                .setName('channel')
                                                                .setDescription('The channel to setup')
                                                )
                )
        // .addStringOption(option =>
        //     option.setName('setup')
        //         .setDescription('What to setup')
        //         .setRequired(true)
        //         .addChoices(
        //             { name: 'Welcome message text channel',		                                        value: 'welcomeMessageTextChannel'      },
        //             { name: 'Leave message text channel',		                                        value: 'leaveMessageTextChannel'        },
        //             { name: 'Welcome/leave message log',   	                                            value: 'bloonsideLogTextChannel'        },
        //             { name: 'Bloon commands channel (for stats/player stats/server list)',              value: 'commandsTextChannel'            },
        //             { name: 'Moderation action channel (A copy is sent here for every moderation)',     value: 'moderationActionTextChannel'    },
        //             { name: 'Server logs channel (name changes/new invites/edit-delete msgs logs)',     value: 'serverLogsTextChannel'          },
        //             { name: 'Alerts channel (bot timeout channels)',                                    value: 'alertsTextChannel'              },
        //             { name: 'Moderation action forum channel',                                          value: 'moderationActionForumChannel'   },
        //             { name: 'Use SBG regex to reply to FAQ',   	                                        value: 'bool_useSBGRegex'               },
        //             { name: 'Auto role on join',   	                                                    value: 'autoRolOnJoin'                  },
        //         )
        //     )
        // .addChannelOption(option => 
        //     option.setName("channel")
        //         .setDescription("Channel to setup")
        //         .setRequired(true)
        // )
        .setDMPermission(false),
		/**
		 * 
		 * @type {import('discord.js').ChatInputCommandInteraction}
		 */
	async execute(interaction) {
        try{
            console.log(`\nsetup.js: ${interaction.member.id} for guild ${interaction.guildId}`);

            await interaction.deferReply({ ephemeral: true }); // This makes it so it can take more than 3 seconds to reply.

            const gm = new localGuildManager(interaction.guildId);

            const key = interaction.options.getString('setup');
            const channel = interaction.options.getChannel('channel');

            gm.updateConfigKey(key, channel.id);

            await interaction.editReply({ content: `Configuration saved successfully`, ephemeral: true});
        }catch(error){
            const answer = { content: `There was an error in the /setup command, sorry.`, ephemeral: true};
			
			if (interaction.deferred && !interaction.replied) {
                await interaction.editReply(answer);
            } else if (interaction.deferred && interaction.replied) {
                await interaction.followUp(answer);
            } else {
                await interaction.reply(answer);
            }

            console.error(`\nError in setup.js for ID ${interaction.member.id} for guild ${interaction.guildId}: ` + error);
        }
	},
};