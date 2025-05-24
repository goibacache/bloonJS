module.exports = {
	token: 							"your-token",
	clientId: 						"your-client-id",
	bloonGuildId: 					"your-guild-id",

	rulesAndInfoChannel:			"your-news-and-info-channel",
	intruderGeneralChannel:			"your-general-channel-id", 		// Sends hi! message.
	intruderHelpChannel:			"your-help-channel-id",			// Uses the /regex to see if it has to reply to msgs?
	intruderMapmakingChannel:		"your-mapmaking-channel-id",
	bloonCommandsChannel:			"your-bloon-commands-channel",
	moderationActionsChannel:		"your-moderation-actions-channel",
	offTopicChannel:				"your-off-topic-channel",
	wikiChannel:					"your-wiki-channel",
	pugChannel:						"your-pug-channel",
	bloonsideChannel:				"your-bloonside-channel",
	bloonServerLogs:				"your-bloon-server-log",
	alertsChannel:					"your-alerts-channel",
	moderationActionForumChannel:	"your-moderation-action-forum",

	rulesMessageId:					"your-rules-message-id",
	newsSubscribeMessageId:			"your-subscribe-to-news-message-id",


	role_Developer:					"your-developer-role",
	role_CommunityManagementTeam:	"your-community-management-team-role",
	role_Mod:						"your-mod-role",
	role_Aug:						"your-aug-role",
	role_HiddenManager:				"your-hidden-manager-role",
	role_Pug: 						"your-role-pug-players",
	role_LookingToPlay: 			"your-role-lookingToPlay",
	role_NowPlaying: 				"your-role-nowplaying",
	role_Agent: 					"your-role-agent",
	role_News: 						"your-role-news",
	role_GameClub: 					"your-role-gameclub",

	wikiURL:						"your-wiki-url",
	wikiAPI:						"your-wiki-API-for-searchs",

	chromeEmoji: 					"<:your-chrome-emoji:0000000000>",
	firefoxEmoji:					"<:your-firefox-emoji:0000000000>",
	youtubeEmoji:					"<:your-youtube-emoji:0000000000>",
	twitterEmoji:					"<:your-twitter-emoji:0000000000>",
	helpraceEmoji:					"<:your-helprace-emoji:0000000000>",
	redditEmoji:					"<:your-reddit-emoji:0000000000>",
	twitchEmoji:					"<:your-twch-emoji:0000000000>",
	discordEmoji:					"<:your-discord-emoji:0000000000>",
	wikiEmoji:						"<:your-wiki-emoji:0000000000>",
	tiktokEmoji:					"<:your-tiktok-emoji:0000000000>",

	mysqlHost:						"your-sql-host",
	mysqlDDBB:						"your-ddbb-name",
	mysqlUser:						"your-sql-user",
	mysqlPass:						"your-sql-pass",

	WEB_Host:						"http://yoursite.local",
	WEB_Port:						"80",

	// ICL site config
	ICLServerId:					"your-icl-server-id",
	oAutClientId:					"your-discord-bot-client-id", 				// Your bot's oAuth Client Id
	oAutClientSecret:				"your-discord-bot-client-secret", 			// Your bot's oAuth Client Secret
	oAuthReturnUrl:					"your-discord-bot-oauth-return-url",		// I deploy the site on bloon.local/authorize but you can wherever
	oAuthTokenSecret:				"your-discord-bot-auth-token-to-sign-jwts",	// RSA key or a bunch of random strings for testing
	ICLWebHookToAddToTeam:			"your-discord-webhook-url-so-people-can-tell-you-they-want-to-join-a-team-but-are-banned-discord.com/api-is-pre-appended",

    // PubSubHubbub
    PubSubHubbubToken:              "your-desired-pubsub-token-to-verify-requests-are-yours"
}