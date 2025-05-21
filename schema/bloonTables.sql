SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


DROP TABLE IF EXISTS `invite`;
CREATE TABLE `invite` (
  `id` int NOT NULL,
  `code` varchar(100) DEFAULT NULL,
  `guildId` varchar(200) DEFAULT NULL,
  `InviterDiscordId` varchar(400) DEFAULT NULL,
  `InviterDiscordName` varchar(400) DEFAULT NULL,
  `ChannelId` varchar(200) DEFAULT NULL,
  `ExpiresAt` datetime DEFAULT NULL,
  `MaxUses` int DEFAULT NULL,
  `creationTime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `kofiphrase`;
CREATE TABLE `kofiphrase` (
  `id` int NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_bin NOT NULL,
  `phrase` varchar(4000) COLLATE utf8mb4_bin NOT NULL,
  `active` bit(1) NOT NULL,
  `validUntil` date NOT NULL,
  `monthsBeingAwesome` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

DROP TABLE IF EXISTS `matchBasicAuthorization`;
CREATE TABLE `matchBasicAuthorization` (
  `Id` int NOT NULL,
  `UserName` varchar(150) NOT NULL,
  `PasswordHash` varchar(1000) NOT NULL,
  `active` tinyint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `matchExternalUser`;
CREATE TABLE `matchExternalUser` (
  `UserDiscordId` bigint NOT NULL,
  `UserDiscordName` varchar(2000) NOT NULL,
  `UserDiscordAvatar` varchar(1000) NOT NULL,
  `UserDiscordTeamRoleId` varchar(1000) NOT NULL,
  `Active` tinyint NOT NULL,
  `AwaitingApproval` tinyint NOT NULL,
  `RejectionReason` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `matchLog`;
CREATE TABLE `matchLog` (
  `Id` bigint NOT NULL,
  `Action` varchar(1000) DEFAULT NULL,
  `User` varchar(1000) DEFAULT NULL,
  `Detail` varchar(1000) DEFAULT NULL,
  `Date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `matchParams`;
CREATE TABLE `matchParams` (
  `Id` int NOT NULL,
  `Name` text,
  `Value` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `matchSchedule`;
CREATE TABLE `matchSchedule` (
  `Id` bigint NOT NULL,
  `Name` varchar(1000) NOT NULL,
  `Team1Name` varchar(200) NOT NULL,
  `Team2Name` varchar(200) NOT NULL,
  `Team1RoleId` varchar(1000) NOT NULL,
  `Team2RoleId` varchar(1000) NOT NULL,
  `ICL` varchar(100) NOT NULL,
  `StartDate` varchar(100) NOT NULL,
  `EndDate` varchar(100) NOT NULL,
  `DateTimeZone` varchar(100) NOT NULL,
  `StartDateDate` date NOT NULL,
  `EndDateDate` date NOT NULL,
  `Active` tinyint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `matchSchedule_Time`;
CREATE TABLE `matchSchedule_Time` (
  `matchScheduleTimeId` bigint NOT NULL,
  `matchScheduleId` bigint NOT NULL,
  `UserDiscordId` bigint NOT NULL,
  `UserDiscordName` varchar(2000) NOT NULL,
  `UserDiscordAvatar` varchar(1000) NOT NULL,
  `DateTime` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `TimeZone` varchar(100) DEFAULT NULL,
  `TeamRoleId` varchar(1000) NOT NULL,
  `UnixTime` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `matchTeam`;
CREATE TABLE `matchTeam` (
  `id` int NOT NULL,
  `Name` varchar(1000) DEFAULT NULL,
  `ShortName` varchar(40) DEFAULT NULL,
  `TeamRoleId` varchar(1000) DEFAULT NULL,
  `Active` tinyint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `moderationAction`;
CREATE TABLE `moderationAction` (
  `id` bigint NOT NULL,
  `moderationType` int NOT NULL,
  `userDiscordId` bigint NOT NULL,
  `reason` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `handledByDiscordId` bigint NOT NULL,
  `timeStamp` datetime DEFAULT NULL,
  `evidence` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `fullMessage` text COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

DROP TABLE IF EXISTS `moderationType`;
CREATE TABLE `moderationType` (
  `id` int NOT NULL,
  `Type` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

DROP TABLE IF EXISTS `serverConfig`;
CREATE TABLE `serverConfig` (
  `ServerId` varchar(100) NOT NULL,
  `ServerName` varchar(4000) DEFAULT NULL,
  `GMA_RoleOnJoin` tinyint NOT NULL DEFAULT '0',
  `GMA_RoleToAssignOnJoin` varchar(100) DEFAULT NULL,
  `GMA_AddWelcomeMessage` tinyint NOT NULL DEFAULT '0',
  `GMA_AddWelcomeMessageChannel` varchar(100) DEFAULT NULL,
  `GMA_AddWelcomeMessageChannelBackup` varchar(100) DEFAULT NULL,
  `GMA_AddWelcomeMessageEmojiReaction` varchar(5) DEFAULT NULL,
  `GMR_LogMemberLeave` tinyint NOT NULL DEFAULT '0',
  `GMR_LogMemberLeaveChannel` varchar(100) DEFAULT NULL,
  `GMR_LogMemberLeaveChannelBackup` varchar(100) DEFAULT NULL,
  `GMU_LogNicknameChanges` tinyint NOT NULL DEFAULT '0',
  `GMU_LogNicknameChangesChannel` varchar(100) DEFAULT NULL,
  `GMU_LogNicknameChangesChannelBackup` varchar(100) DEFAULT NULL,
  `M_UseRegexSPAMProtection` tinyint NOT NULL DEFAULT '0',
  `M_RegexSPAMProtectionChannel` varchar(100) DEFAULT NULL,
  `M_AssignRoleOnMessage` tinyint NOT NULL DEFAULT '0',
  `M_RoleToAssignOnMessage` varchar(100) DEFAULT NULL,
  `M_MessageRegexWhoIs` tinyint NOT NULL DEFAULT '0',
  `M_SBGFaq` tinyint NOT NULL DEFAULT '0',
  `M_SBGFaqValidChannels` varchar(2000) DEFAULT NULL,
  `M_SendSpamAfterMessages` tinyint NOT NULL DEFAULT '0',
  `M_QuantityOfMessagesAfterSpam` int NOT NULL DEFAULT '2000',
  `M_SendSpamAfterMessagesChannel` varchar(100) DEFAULT NULL,
  `MD_SaveMessageDeletionLogs` tinyint NOT NULL DEFAULT '0',
  `MD_MessageDeletionLogsChannel` varchar(100) DEFAULT NULL,
  `MRA_UseMessageReaction` tinyint NOT NULL DEFAULT '0',
  `MRA_MessageIdToReact` varchar(100) DEFAULT NULL,
  `MRA_RoleToToggleOnReact` varchar(100) DEFAULT NULL,
  `MRA_RemoveReactionsOnModerationThreads` tinyint NOT NULL DEFAULT '1',
  `MU_LogMessageUpdates` tinyint NOT NULL DEFAULT '0',
  `MU_ChannelToLogMessageUpdates` varchar(100) DEFAULT NULL,
  `NP_EnableNowPlayingRoles` tinyint NOT NULL DEFAULT '0',
  `NP_LookingToPlayRole` varchar(100) DEFAULT NULL,
  `NP_NowPlayingRole` varchar(100) DEFAULT NULL,
  `NP_ActivityName` varchar(2000) DEFAULT NULL,
  `PC_EnablePolling` tinyint NOT NULL DEFAULT '0',
  `PC_UrlToPoll` varchar(2000) DEFAULT NULL,
  `PC_MinutesToPoll` int NOT NULL DEFAULT '5',
  `PC_PollType` varchar(45) DEFAULT NULL,
  `PC_PropertyTreeId` varchar(2000) DEFAULT NULL,
  `PC_WikiBaseUrl` varchar(100) DEFAULT NULL,
  `PC_YoutubeMessage` varchar(100) DEFAULT NULL,
  `PC_ChannelToPostAlert` varchar(100) DEFAULT NULL,
  `PC_LastFetchedDate` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


ALTER TABLE `invite`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `kofiphrase`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `matchBasicAuthorization`
  ADD PRIMARY KEY (`Id`);

ALTER TABLE `matchExternalUser`
  ADD PRIMARY KEY (`UserDiscordId`);

ALTER TABLE `matchLog`
  ADD PRIMARY KEY (`Id`);

ALTER TABLE `matchParams`
  ADD PRIMARY KEY (`Id`);

ALTER TABLE `matchSchedule`
  ADD PRIMARY KEY (`Id`);

ALTER TABLE `matchSchedule_Time`
  ADD PRIMARY KEY (`matchScheduleTimeId`),
  ADD KEY `matchSchedule_Time_matchSchedule_FK` (`matchScheduleId`);

ALTER TABLE `matchTeam`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `moderationAction`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `moderationType`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `serverConfig`
  ADD PRIMARY KEY (`ServerId`);


ALTER TABLE `invite`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `kofiphrase`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `matchBasicAuthorization`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `matchLog`
  MODIFY `Id` bigint NOT NULL AUTO_INCREMENT;

ALTER TABLE `matchSchedule`
  MODIFY `Id` bigint NOT NULL AUTO_INCREMENT;

ALTER TABLE `matchSchedule_Time`
  MODIFY `matchScheduleTimeId` bigint NOT NULL AUTO_INCREMENT;

ALTER TABLE `matchTeam`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `moderationAction`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

ALTER TABLE `moderationType`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;


ALTER TABLE `matchSchedule_Time`
  ADD CONSTRAINT `matchSchedule_Time_matchSchedule_FK` FOREIGN KEY (`matchScheduleId`) REFERENCES `matchSchedule` (`Id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
