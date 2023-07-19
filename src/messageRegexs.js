module.exports = [
	{ regex: /(what|how).*(switch|change|move|swap).*(maps?)/g,																					answer: "To change the map ingame make yourself an admin & then use `/changemap mapName` (You must be the admin to do this)." },
	{ regex: /(how|what).*(can)?.*(make|give|become|be) (admini?s?t?r?a?t?o?r?)/g,																answer: "To make yourself an admin use `/makeadmin` this only works if you are the original room creator." },
	{ regex: /(is).*(map|list).*(map|list)/g,																									answer: "The Official maps are Riverside, Mountainside, Cliffside, and Oceanside; there are many unofficial maps out there too, check them out at: <https://steamcommunity.com/app/518150/workshop/>" },
	{ regex: /(how).*(report).*(bugs?)/g,																										answer: "You can report bugs at: https://discord.com/channels/103933666417217536/895455707309162506" },
	{ regex: /(how|when|what) (long|length|doe?s?).*(ban?n?e?d?s?)/g,																			answer: "Temporary bans last about 15 minutes. A timer on the main menu will tell you how much time is left on your temporary ban.  " },
	{ regex: /(cant|can\'t|cannot).*(download).*(maps?)/g,																						answer: "If the map is not downloading correctly you may want to restart your game, if problems persist clear your map cache." },
	{ regex: /(what|how).*(tuning)/g,																											answer: "Server Tuning is settings that allow you to change minor or major game mechanics, like speed health & respawns. You can create tuning for your server at: <https://tuning.bloon.info>" },
	{ regex: /(game)?.*(why|is).*(is)?.*(game).*(dead)/g,																						answer: "If the servers are empty start your own and ping Looking To Play and have some fun." },
	{ regex: /(cant?n?o?t?|can|how|is).*(name|change).*(name|change)/g,																			answer: "Intruder uses your Steam profile username assuming that the characters within the name are supported. If you see your name as Agent_(12345) means you have unsupported characters in your steam name" },
	{ regex: /(who).*(creato?r?e?d?|mad?k?e).*(bloon)/g,																						answer: "Originally developed by DukeOfSussex, Ruby and Botri. Xixo took the reigns after the previous version... popped out of existance 🪦." },
	{ regex: /(what|how).*(is|cant?n?o?t?|do).*(aug)/g,																							answer: "The Advanced User Group (AUG) is a group formed to help serious players run matches, play tournaments, and engage in private community events and activities." },
	{ regex: /(who).*(creato?r?e?d?|mad?k?e).*(intruder)/g,																						answer: "Intruder is being developed by Rob Storm and Austin Roush." },
	{ regex: /(how|can) (to|do|you).*(kick)/g,																									answer: "To kick a player, use the button on their player profile by clicking the (i) icon next to their name in the Teams menu." },
	{ regex: /(is|how|can).*(show|change).*(fps)/g,																								answer: "You can show your current FPS on your hud simply by doing `/fps`. You can change your FPS and Vsync settings from the options" },
	{ regex: /(((what).*(is).*(default|normal|original).*(gravity))|((how|can|do).*(change|modify).*(gravity)))/g,								answer: "Gravity by default is at `-9.81`. To change the gravity you do `/gravity #`. You must activate cheats by typing `/sgcheats 1` as an admin" },
	{ regex: /(do|can|how|is|where).*(pay).*(with) (paypal)/g,																					answer: "You can use Paypal on Steam!" },
	{ regex: /(what).*(are).*(controls)/g,																										answer: "The controls are: https://steamuserimages-a.akamaihd.net/ugc/2015963092394388560/796AFF72C40103825C2D6CA55A7576DE8019BDDC" },
	{ regex: /(how|can).*(to|do|you|move).*(time|sun) (in) (game|intruder)/g,																	answer: "You can change the time of day in Riverside by doing `/suntime 15` (24 hour time scale)." },
	{ regex: /(how|what).*(can)?.*(make|give|become|be).*(master)/g,																			answer: "You can set the master client via the player profile cards. ***SIDE NOTE:** this only works if you are the room admin*" },
	{ regex: /((how|can).*(change|remove|disable|(turn.*off?)).*(hud))/g,																		answer: "You can turn off your HUD in game by hitting `q+p` at the same time (this odd key combo is so that you don\'t accidentaly turn off your hud in game)" },
	{ regex: /((how|can|what).*(((is|are)|(join|enter)|(leave|remove))) (ltp|looki?n?g? to play))/g,											answer: "Looking to play (or known as LTP) is a role you can give yourself by running the command `/ltp`. If you\'d like to leave the role, simply run the command again. You name will be marked purple once you\'re in." },
	{ regex: /((how|can|what).*(((is|are)|(activate|(start|begin)))).*(lms|last man standing))/g,												answer: "Last Man Standing, aka LMS, is a battle royale style gamemode on Riverside primarily and some custom maps. You can try it on the Riverside LMS map." },
	{ regex: /thank(?:s| you).*bloon/g,																											answer: "You\'re welcome, hooman" },
	{ regex: /(where|how).*(can|do).*(make|create).(custom|).*(maps?)/g,																		answer: "Get Started Making Custom Maps: <https://sharklootgilt.superbossgames.com/wiki/index.php/IntruderMM>\r\nMap Maker Resources: <https://docs.google.com/document/d/10Qvao_pA-lM8IFASWaAr6AGlNYG28CJaLqyOd5aUrss/edit?usp=sharing/>\r\nPoly's Ultimate Intruder MM guide: <https://www.youtube.com/watch?v=Vey9wi6n_pA>" },
	{ regex: /(where|how).*(can|do).*(access|show|get|pull).*(console)/g,																		answer: "You can access the console within the game at any time by using `\\ + Tab` at the same time. It\'ll open a black box with colored debugging." },
	{ regex: /(my|the|team).*(microphone|mic|team).*(quiet|silent|trouble hearing)/g,															answer: "1) USB Microphone? \r\nhttps://discordapp.com/channels/103933666417217536/306213064934424576/551549500251045907\r\n2) Check microphone volume within Windows (Sometimes this changes)\r\n3) Check microphone values within game settings" },
	{ regex: /(what|how).*(is|join|make|get).*(pug|pick*up*games).(game|player?s?)?.*/g,														answer: "PUG stands for pick-up-game in which players can track stats in a ranked game with set teams. \nYou can get the pick-up-games role by using the `/pug` command" },
	{ regex: /(what|how).*(is|join|make|get|go|play).*(comp |comps |competitive|competitively).?(player?s?)?/g,									answer: "You can ask a competitive team leader to join their team and participate in the next ICL (Intruder Competitive League)" },
	{ regex: /(what|how|open|use).*(is|do|open|with).*(rosetta|roseta).*(on|m1|mac)?/g,															answer: "Rosetta is a dynamic binary translator developed by Apple Inc. for macOS, an application compatibility layer between different instruction set architectures. It enables a transition to newer hardware, by automatically translating software. \n\nTo run the game with it, check the wiki link here: https://sharklootgilt.superbossgames.com/wiki/index.php/Rosetta" },
	{ regex: /(how|will|would)?.*(do i|do)?.*(play?able|execute|run).*(game)?.*(on|on a|with|while)?.*(a mac|mac|apple|apple computer)/g, 		answer: "You'll need to use Rosetta to run the game. Check the wiki link here to know how: https://sharklootgilt.superbossgames.com/wiki/index.php/Rosetta"},
	{ regex: /(what).*(is|are).*(sba|secret.?base.?alpha)/g, 																					answer: "Secret Base Alpha is a place where members can participate in beta tests of new features, join more in-depth discussions, and shape the future of the Intruder community.\n\nYou can apply to be part of SBA, here: https://discord.com/channels/103933666417217536/556614381870514176"},
];