DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `invite_get`(`_code` VARCHAR(100))
BEGIN
	SELECT 
		`code`, 
        `InviterDiscordId`, 
        `InviterDiscordName`, 
        `ChannelId`, 
        `ExpiresAt`, 
        `MaxUses`
    FROM invite where `code` = `_code`;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `invite_insert`(`_code` VARCHAR(100), `_guildId` Varchar(200), `_InviterDiscordId` Varchar(400), `_InviterDiscordName` Varchar(400), `_ChannelId` Varchar(200), `_ExpiresAt` DATETIME, `_MaxUses` INT)
BEGIN
	INSERT INTO `invite` (`code`, `guildId`, `InviterDiscordId`, `InviterDiscordName`, `ChannelId`, `ExpiresAt`, `MaxUses`, `creationTime`)
    VALUES (
		`_code`,
        `_guildId`,
        `_InviterDiscordId`,
        `_InviterDiscordName`,
        `_ChannelId`,
        `_ExpiresAt`,
        `_MaxUses`,
        NOW()
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `kofiphrase_InsertOrUpdate`(IN `_name` VARCHAR(400), IN `_phrase` VARCHAR(400), IN `_renewal` BOOLEAN)
BEGIN
    IF _renewal = 1 THEN
    	UPDATE `kofiphrase` 
			SET validuntil = DATE_ADD(CURDATE(), INTERVAL 30 DAY),
            	monthsBeingAwesome = monthsBeingAwesome + 1
		WHERE name = _name;
    ELSE
		IF EXISTS (SELECT * FROM `kofiphrase`WHERE name = _name) THEN
        	IF CHAR_LENGTH(_phrase) > 0 THEN
				UPDATE `kofiphrase` SET phrase = _phrase where name = _name;
			END IF;
      	ELSE
            INSERT INTO `kofiphrase` (name, phrase, validUntil, monthsBeingAwesome, active)
            VALUES (
                _name,
                _phrase,
                DATE_ADD(CURDATE(), INTERVAL 1 MONTH),
                1,
                1
            );
        END IF;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `kofiphrase_get`(IN `_userName` VARCHAR(400) CHARSET utf8mb4)
BEGIN
   SELECT
   	name, 
    phrase 
   FROM kofiphrase 
   WHERE 	active 		= 	1
   AND		name		= 	_userName
   AND 		validuntil 	>= 	CURDATE();
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `match_CreateLog`(IN `_Action` Varchar(1000), IN `_User` Varchar(1000), IN `_Detail` Varchar(1000))
BEGIN
	INSERT INTO matchLog (`Action`, `User`, `Detail`, `Date`)
    VALUES (
		`_Action`,
        `_User`,
        `_Detail`,
        CURRENT_DATE()
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `match_CreateMatch`(IN `Name` Varchar(1000), IN `Team1Name` Varchar(200), IN `Team2Name` Varchar(200), IN `Team1RoleId` Varchar(1000), IN `Team2RoleId` Varchar(1000), IN `StartDate` Varchar(100), IN `EndDate` Varchar(100), IN `DateTimeZone` Varchar(100), IN `User` Varchar(1000))
BEGIN
	-- GET ICL PARAM
    SET @_icl := (SELECT `Value` as 'ICL' FROM matchParams mp WHERE mp.Name = 'ICL');

	INSERT INTO matchSchedule (`Name`, `Team1Name`, `Team2Name`, `Team1RoleId`, `Team2RoleId`, `ICL`, `StartDate`, `EndDate`, `DateTimeZone`, `StartDateDate`, `EndDateDate`, `Active`)
    VALUES (
		`Name`,
        `Team1Name`,
        `Team2Name`,
        REGEXP_REPLACE(`Team1RoleId`, '[^0-9]', ''),
        REGEXP_REPLACE(`Team2RoleId`, '[^0-9]', ''),
        @_icl,
        `StartDate`,
        `EndDate`,
        `DateTimeZone`,
        STR_TO_DATE(`StartDate`, '%d.%m.%Y.%H.%i'),
        STR_TO_DATE(`EndDate`, '%d.%m.%Y.%H.%i'),
        1
    );
    
    SELECT CONCAT(REPLACE(`Name`, ' ', '-'), '-', LAST_INSERT_ID()) AS 'matchUrl';
    
    CALL match_CreateLog('CreateMatch', `User`, CONCAT('Created a match for ', `Team1Name` , ' (' , `Team1RoleId`, ') vs ', `Team2Name` , ' (', `Team2RoleId` , '). StartDate: ', `StartDate`, ' - EndDate: ', `EndDate`, ' - TimeZone: ', `DateTimeZone`));
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `match_ExternalUser_Create`(
	IN `_UserDiscordId` bigint, 
    IN `_UserDiscordName` Varchar(2000), 
    IN `_UserDiscordAvatar` Varchar(1000), 
    IN `_UserDiscordTeamRoleId` Varchar(1000)
)
proc_euc:BEGIN
	IF EXISTS (SELECT 1 FROM matchExternalUser meu where meu.UserDiscordId = `_UserDiscordId`) THEN
    
		IF (SELECT Active FROM matchExternalUser meu where meu.UserDiscordId = `_UserDiscordId`) = 1 THEN
			SELECT 'Your request have been accepted, please log in again.' as Res;
			LEAVE proc_euc;
		END IF;
        
		IF (SELECT AwaitingApproval FROM matchExternalUser meu where meu.UserDiscordId = `_UserDiscordId`) = 1 THEN
			SELECT "You already have a request that's awaiting for approval" as Res;
			LEAVE proc_euc;
		END IF;
        
		IF (SELECT AwaitingApproval FROM matchExternalUser meu where meu.UserDiscordId = `_UserDiscordId`) = 0 THEN
			SELECT 'Sorry, your request have been rejected' as Res;
			LEAVE proc_euc;
		END IF;
    
		SELECT "Your user already exists but it is in an odd limbo. Whoops" as Res;
		LEAVE proc_euc;
            
    END IF;
    
    INSERT INTO matchExternalUser (UserDiscordId, UserDiscordName, UserDiscordAvatar, UserDiscordTeamRoleId, Active, AwaitingApproval)
    VALUES (`_UserDiscordId`, `_UserDiscordName`, `_UserDiscordAvatar`, `_UserDiscordTeamRoleId`, false, true);
    
    SELECT '' as Res;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `match_FindExternalUsers`(IN `_Active` Tinyint, IN `_AwaitingApproval` Tinyint)
BEGIN
	SELECT 
		UserDiscordId,
        UserDiscordName,
        UserDiscordAvatar,
        UserDiscordTeamRoleId,
        Active,
        AwaitingApproval
    FROM matchExternalUser meu
    WHERE 
		(
				`_Active` IS NULL
			OR 	meu.Active = `_Active`
	)
	AND (
				`_AwaitingApproval` IS NULL
            OR 	meu.AwaitingApproval = `_AwaitingApproval`
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `match_GetAllMatches`(IN `_roles` Text, IN `_FutureOrPast` Varchar(20))
BEGIN
    -- Are you Ry or for some odd reason have "no roles"?
    IF `_roles` IS NULL
    THEN
		-- SELECT THEM ALL
		SELECT
			Id, Name, Team1Name, Team2Name, Team1RoleId, Team2RoleId, StartDate, EndDate, DateTimeZone,
            CASE WHEN DATE_ADD(EndDateDate, INTERVAL 1 DAY) <= current_date()
				THEN 'Past'
                ELSE 'Future'
			END AS MatchTime
		FROM matchSchedule ms
        WHERE (
					`_FutureOrPast` IS NULL
				OR 	CASE WHEN DATE_ADD(EndDateDate, INTERVAL 1 DAY) <= current_date()
						THEN 'Past'
						ELSE 'Future'
					END = `_FutureOrPast`
		)
        AND Active = 1
        ORDER BY EndDateDate desc;
    ELSE
		-- YOU HAVE ROLES, womp womp...
        
		-- Creates t_roles !
		CALL util_SplitRoles(`_roles`);
		
		-- MYSQL you absolute monster... ugh. ARE YOU KIDDING ME?!
		DROP TEMPORARY TABLE IF EXISTS temp1;
		DROP TEMPORARY TABLE IF EXISTS temp2;
		-- More ugh...
		CREATE TEMPORARY TABLE temp1 SELECT RoleId FROM t_roles;
		CREATE TEMPORARY TABLE temp2 SELECT RoleId FROM t_roles;
        
        -- Finally...
		SELECT
			Id, Name, Team1Name, Team2Name, Team1RoleId, Team2RoleId, StartDate, EndDate, DateTimeZone,
            CASE WHEN DATE_ADD(EndDateDate, INTERVAL 1 DAY) <= current_date()
				THEN 'Past'
                ELSE 'Future'
			END AS MatchTime
		FROM matchSchedule ms
		WHERE 
			(
					Team1RoleId in (select RoleId from temp1)
				OR 	Team2RoleId in (select RoleId from temp2)
			)
		AND (
					`_FutureOrPast` IS NULL
				OR 	CASE WHEN DATE_ADD(EndDateDate, INTERVAL 1 DAY) <= current_date()
						THEN 'Past'
						ELSE 'Future'
					END = `_FutureOrPast`
		)
        AND Active = 1
        ORDER BY EndDateDate desc;
        
        DROP TEMPORARY TABLE IF EXISTS temp1;
		DROP TEMPORARY TABLE IF EXISTS temp2;
        DROP TEMPORARY TABLE IF EXISTS t_roles;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `match_GetAllTeams`()
BEGIN
	SELECT 
		Id, Name, ShortName, TeamRoleId
    FROM matchTeam mt where mt.active = true;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `match_GetBasicAuthorization`(IN `UserName` Varchar(150), IN `PasswordHash` Varchar(1000))
BEGIN
	SELECT 
		Id
    FROM 	matchBasicAuthorization mba
    WHERE 	mba.UserName = `UserName`
    AND		mba.PasswordHash = `Passwordhash`
    AND 	mba.Active = true;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `match_GetDetails`(IN `_matchId` Int, IN `_role` Varchar(1000))
BEGIN
	
	SELECT 
		CASE WHEN _role = TeamRoleId THEN UserDiscordId ELSE -1 END AS UserDiscordId, 
        CASE WHEN _role = TeamRoleId THEN UserDiscordName ELSE 'Player' END AS UserDiscordName, 
        CASE WHEN _role = TeamRoleId THEN userDiscordAvatar ELSE 'NULL' END AS userDiscordAvatar, 
        UnixTime, 
        TeamRoleId
	FROM matchSchedule_Time 
	WHERE matchScheduleId = _matchId;
	-- AND (
	-- 		_role IS NULL 
	-- 	OR 	_role = TeamRoleId);
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `match_GetExternalUser`(IN `_userDiscordId` BIGINT)
BEGIN
	SELECT 
		UserDiscordId,
        UserDiscordName,
        UserDiscordAvatar,
        UserDiscordTeamRoleId
    FROM matchExternalUser meu
    WHERE meu.UserDiscordId = `_userDiscordId`
    AND meu.Active = true;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `match_GetInfo`(IN `_matchId` Int)
BEGIN
	SELECT 
		Id, Name, Team1Name, Team2Name, Team1RoleId, Team2RoleId, ICL, StartDate, EndDate, DateTimeZone
	FROM matchSchedule
	WHERE id = _matchId;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `match_UpdateMyTimes`(IN `_matchId` BIGINT, IN `_userDiscordId` BIGINT, IN `_userDiscordName` Varchar(2000), IN `_userDiscordAvatar` Varchar(1000), IN `_unixTimeStamps` TEXT, `_TeamRoleId` Varchar(1000))
BEGIN
	-- CREATE TEMP TABLE WITH ALL OF THE DATA
    DROP TEMPORARY TABLE IF EXISTS t_dateAndTimeZone;

	CREATE TEMPORARY TABLE t_dateAndTimeZone (
		-- `Date` Varchar(100),
        -- `TimeZone` Varchar(100),
        `UnixTime` BIGINT
    );
    
	SET @unixTimeStamps := `_unixTimeStamps`;
    
    -- Process all but the last one
	WHILE POSITION(',' IN @unixTimeStamps) > 0 DO
		set @current := SUBSTRING(@unixTimeStamps, 1, POSITION(',' IN @unixTimeStamps)-1);        
        SET @unixTimeStamps := SUBSTRING(@unixTimeStamps, POSITION(',' IN @unixTimeStamps)+1);
        -- select @current as CurrentInWhile, @unixTimeStamps UnixTimeStampsLeft;
        INSERT INTO t_dateAndTimeZone (UnixTime) VALUES (@current);
	END WHILE;
    
    -- Insert the last one if it's not null.
    -- set @current := SUBSTRING(@unixTimeStamps, 1, POSITION(',' IN @unixTimeStamps)-1);
    -- select @current as CurrentInWhile, @unixTimeStamps UnixTimeStampsLeft;
    IF LENGTH(@unixTimeStamps) > 0 THEN
		-- INSERT INTO t_dateAndTimeZone (Date, TimeZone) VALUES (@date, @timeZone);
        INSERT INTO t_dateAndTimeZone (UnixTime) VALUES (@unixTimeStamps);
	END IF;

	-- Delete old times before updating
	DELETE FROM matchSchedule_Time
    WHERE 	matchScheduleId = `_matchId`
    AND 	UserDiscordId = `_userDiscordId`;

    INSERT INTO matchSchedule_Time (matchScheduleId, UserDiscordId, UserDiscordName, UserDiscordAvatar, UnixTime, TeamRoleId)
    SELECT `_matchId`, `_userDiscordId`, REPLACE(REPLACE(`_userDiscordName`, '"', ""), "'", ""), `_userDiscordAvatar`, `UnixTime`, `_TeamRoleId` FROM t_dateAndTimeZone;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `moderationAction_Get`(IN `_userDiscordId` BIGINT)
BEGIN
   SELECT * FROM moderationAction
   INNER JOIN moderationType
   ON moderationAction.moderationType = moderationType.id
   WHERE moderationAction.userDiscordId = _userDiscordId;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `moderationAction_GetNewId`(IN `_moderationType` INT)
BEGIN
	SELECT
	CASE
		WHEN COUNT(1) = 0 THEN 1
		ELSE COUNT(1)
	END AS res
	FROM moderationAction ma where ma.moderationType = _moderationType;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `moderationAction_Insert`(IN `_moderationType` INT, IN `_userDiscordId` BIGINT, IN `_reason` VARCHAR(2000) CHARSET utf8mb4, IN `_handledByDiscordId` BIGINT, IN `_fullMessage` TEXT)
BEGIN
	INSERT INTO moderationAction (moderationType, userDiscordId, reason, handledByDiscordId, timeStamp, fullMessage) 	
    VALUES (_moderationType, _userDiscordId, _reason, _handledByDiscordId, NOW(), _fullMessage);
   
    SELECT
	CASE
		WHEN COUNT(1) = 0 THEN 1
		ELSE COUNT(1)
	END AS res
	FROM moderationAction ma where ma.moderationType = _moderationType;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `moderationAction_Profile`(IN `_userDiscordId` BIGINT)
SELECT
		ma.userDiscordId, 
		ma.timeStamp, 
		ma.handledByDiscordId, 
		mt.Type, 
		reason
	FROM 	moderationAction ma
	INNER JOIN moderationType mt 
	ON 		ma.moderationType = mt.id 
	WHERE 	userDiscordId = _userDiscordId
	ORDER BY ma.id DESC$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `serverConfig_Get`(IN `_serverId` VARCHAR(100))
BEGIN
	SELECT 
		* 
    FROM serverConfig 
    WHERE (
				`_serverId` IS NULL OR 
                ServerId = `_serverId`
	);
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `serverConfig_UpdateLastFetch`(IN `_serverId` VARCHAR(100), IN `_dateTime` DATETIME)
BEGIN
	UPDATE serverConfig
		SET PC_LastFetchedDate = `_dateTime`
    WHERE `ServerId` = `_serverId`;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`DatabaseDefiner`@`%` PROCEDURE `util_SplitRoles`(IN `_roles` Text)
BEGIN
	DROP TEMPORARY TABLE IF EXISTS t_roles;

	CREATE TEMPORARY TABLE t_roles (
		RoleId Bigint,
        PRIMARY KEY (`RoleId`)
    );
    
	SET @roles := `_roles`;

	WHILE POSITION(',' IN @roles) > 0 DO
		set @current := SUBSTRING(@roles, 1, POSITION(',' IN @roles)-1);
		SET @roles := SUBSTRING(@roles, POSITION(',' IN @roles)+1);
        
        IF LENGTH(@current) > 0 THEN
			INSERT INTO t_roles (RoleId) VALUES (@current);
		END IF;
	END WHILE;
    
    IF LENGTH(@roles) > 0 THEN
		INSERT INTO t_roles (RoleId) VALUES (@roles);
	END IF;
END$$
DELIMITER ;
