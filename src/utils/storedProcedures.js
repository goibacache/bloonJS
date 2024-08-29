const bloonUtils = require('../utils/utils.js');
const mysql = require('mysql2/promise');
const config = bloonUtils.getConfig();
const runArgs = bloonUtils.getRunArgs();

const moderationAction_Insert = async(moderationAction, banedUserDiscordId, banReason, handledByDiscordId, fullMessage = '') => {
    let connection;
    try{
        const query = `CALL moderationAction_Insert(?, ?, ?, ?, ?)`;
    
        connection = await createConnection();

        const [rows] = await connection.execute(query, [moderationAction.id, banedUserDiscordId, banReason, handledByDiscordId, fullMessage]);

        connection.release();

        return parseInt(rows[0][0]['res']); 

    }catch(error){
        if (connection != null){
            connection.release();
        }
        console.error("Error in sp_banInsert: ", error);
        return 0;
    }
}

const moderationAction_GetNewId = async(moderationAction) => {
    let connection;
    try{
        const query = `CALL moderationAction_GetNewId(?)`;

        connection = await createConnection();
    
        const [rows] = await connection.execute(query, [moderationAction.id]);

        connection.release();
    
        return parseInt(rows[0][0]['res']); 
    }catch(error){
        if (connection != null){
            connection.release();
        }
        console.error("Error in moderationAction_GetNewId: ", error);
        return 0;
    }
}

const kofi_GetKofiPhrase = async(_userName) => {
    let connection;
    try{
        const query = `CALL kofiphrase_get(?)`;

        const connection = await createConnection();

        const [rows] = await connection.execute(query, [_userName]);

        connection.release();

        return rows[0]; 
    }catch(error){
        if (connection != null){
            connection.release();
        }
        console.error("Error in kofiphrase_get: ", error);
        return null;
    }
}

const moderationAction_Profile = async(_userId) => {
    let connection;
    try{
        const query = `CALL moderationAction_Profile(?)`;

        const connection = await createConnection();

        const [rows] = await connection.execute(query, [_userId]);

        connection.release();

        return rows[0]; 
    }catch(error){
        if (connection != null){
            connection.release();
        }
        console.error("Error in moderationAction_Profile: ", error);
        return null;
    }
}

/**
 * @param {string} _userName    username with no spaces and all in lower case to trigger a response
 * @param {string} _phrase      the phrase the bot will answer when asked for the user
 * @param {boolean} _renewal    the bit that sets if it's just a renewal or if it's trying to add a new or update an old phrase
 * @returns 
 */
const kofi_InsertOrUpdate = async(_userName, _phrase = '', _renewal = null) => {
    let connection;
    try{
        const query = `CALL kofiphrase_InsertOrUpdate(?, ?, ?)`;

        connection = await createConnection();

        const [rows] = await connection.execute(query, [_userName, _phrase, _renewal ?? 0]);

        connection.release();

        return rows[0]; 
    }catch(error){
        if (connection != null){
            connection.release();
        }
        console.error("Error in kofiphrase_InsertOrUpdate: ", error);
        return null;
    }
}

/**
 * 
 * @param {string} _matchId The match id with underscores instead of spaces and the id at the end of the name 
 */
const match_GetInfo = async(_matchId) => {
    let connection;
    try{
        const query = `CALL match_GetInfo(?)`;

        connection = await createConnection();

        const [rows] = await connection.execute(query, [_matchId]);

        connection.release();

        return rows[0][0]; // Get first result only.
    }catch(error){
        if (connection != null){
            connection.release();
        }
        console.error("Error in match_GetInfo: ", error);
        return null;
    }
}

const match_GetDetails = async(_matchId, _role) => {
    let connection;
    try{
        const query = `CALL match_GetDetails(?, ?)`;

        connection = await createConnection();

        const [rows] = await connection.execute(query, [_matchId, _role]);

        connection.release();

        return rows[0]; 
    }catch(error){
        if (connection != null){
            connection.release();
        }
        console.error("Error in match_GetDetails: ", error);
        return null;
    }
}

/**
 * 
 * @param {string} _roles Role list coma separated (,) [IK, IK...]
 */
const match_GetAllMatches = async(_roles) => {
    let connection;
    try{
        const query = `CALL match_GetAllMatches(?)`;

        connection = await createConnection();

        const [rows] = await connection.execute(query, [_roles]);

        connection.release();

        return rows[0]; 
    }catch(error){
        if (connection != null){
            connection.release();
        }
        console.error("Error in match_GetAllMatches: ", error);
        return null;
    }
}

const match_UpdateMyTimes = async(_matchId, _userDiscordId, _userDiscordName, _userDiscordAvatar, _dateAndTimeZone, _TeamRoleId) => {
    let connection;
    try{        
        const _formattedDateAndTimeZone = _dateAndTimeZone.map(x => x.DateTimeStr+"|"+x.TimeZone).join(',');
        const query = `CALL match_UpdateMyTimes(?, ?, ?, ?, ?, ?)`;

        connection = await createConnection();

        const [rows] = await connection.execute(query, [_matchId, _userDiscordId, _userDiscordName, _userDiscordAvatar, _formattedDateAndTimeZone, _TeamRoleId]);

        connection.release();

        return rows[0];
    }catch(error){
        if (connection != null){
            connection.release();
        }
        console.error("Error in match_UpdateMyTimes: ", error);
        return null;
    }
}


/**
 * Based on the user Discord ID it checks the external users table
 * @param {String} _userDiscordId 
 * @returns 
 */
const match_GetExternalUser = async(_userDiscordId) => {
    let connection;
    try{
        const query = `CALL match_GetExternalUser(?)`;

        connection = await createConnection();

        const [rows] = await connection.execute(query, [_userDiscordId]);

        connection.release();

        return rows[0]; 
    }catch(error){
        if (connection != null){
            connection.release();
        }
        console.error("Error in match_GetAllMatches: ", error);
        return null;
    }
}


/**
 * Returns a list of all the teams.
 * @returns 
 */
const match_GetAllTeams = async() => {
    let connection;
    try{
        const query = `CALL match_GetAllTeams()`;

        connection = await createConnection();

        const [rows] = await connection.execute(query);

        connection.release();

        return rows[0]; 
    }catch(error){
        if (connection != null){
            connection.release();
        }
        console.error("Error in match_GetAllTeams: ", error);
        return null;
    }
}

/**
 * Creates a Match for the users
 * @param {*} Name 
 * @param {*} Team1Name 
 * @param {*} Team2Name 
 * @param {*} Team1RoleId 
 * @param {*} Team2RoleId 
 * @param {*} StartDate 
 * @param {*} EndDate 
 * @param {*} DateTimeZone 
 * @returns 
 */
const match_CreateMatch = async(Name, Team1Name, Team2Name, Team1RoleId, Team2RoleId, StartDate, EndDate, DateTimeZone) => {
    let connection;
    try{
        const query = `CALL match_CreateMatch(?, ?, ?, ?, ?, ?, ?, ?)`;

        connection = await createConnection();

        const [rows] = await connection.execute(query, [Name, Team1Name, Team2Name, Team1RoleId, Team2RoleId, StartDate, EndDate, DateTimeZone]);

        connection.release();

        return rows[0][0]["matchUrl"];
    }catch(error){
        if (connection != null){
            connection.release();
        }
        console.error("Error in match_CreateMatch: ", error);
        return null;
    }
}


/**
 * Creates a Match for the users
 * @param {*} Name 
 * @param {*} Team1Name 
 * @param {*} Team2Name 
 * @param {*} Team1RoleId 
 * @param {*} Team2RoleId 
 * @param {*} StartDate 
 * @param {*} EndDate 
 * @param {*} DateTimeZone 
 * @returns 
 */
const match_GetBasicAuthorization = async(Name, PasswordHash) => {
    let connection;
    try{
        const query = `CALL match_GetBasicAuthorization(?, ?)`;

        connection = await createConnection();

        const [rows] = await connection.execute(query, [Name, PasswordHash]);

        connection.release();

        return rows[0];
    }catch(error){
        if (connection != null){
            connection.release();
        }
        console.error("Error in match_GetBasicAuthorization: ", error);
        return null;
    }
}

/**
 * Create a new pending role
 * @param {*} UserDiscordId 
 * @param {*} UserDiscordName 
 * @param {*} UserDiscordAvatar 
 * @param {*} UserDiscordTeamRoleId 
 * @returns 
 */
const match_ExternalUser_Create = async(UserDiscordId, UserDiscordName, UserDiscordAvatar, UserDiscordTeamRoleId) => {
    let connection;
    try{
        const query = `CALL match_ExternalUser_Create(?, ?, ?, ?)`;

        connection = await createConnection();

        const [rows] = await connection.execute(query, [UserDiscordId, UserDiscordName, UserDiscordAvatar, UserDiscordTeamRoleId]);

        connection.release();

        return rows[0][0]["Res"];
    }catch(error){
        if (connection != null){
            connection.release();
        }
        console.error("Error in match_ExternalUser_Create: ", error);
        return null;
    }
}

const createConnection = async () => {
    // Create global pool object to avoid reconnecting to the MySQL instance multiple times
    if (global.poolObject === undefined) {
        global.poolObject = await mysql.createPool({
            host:               config.mysqlHost,
            user:               config.mysqlUser,
            password:           config.mysqlPass,
            database:           config.mysqlDDBB,
            charset:            "utf8mb4_bin",
            connectTimeout:     120 * 60,
            connectionLimit:    0,
            waitForConnections: true
        });

        if (runArgs[0] === "develop"){ // Two means it's dev
            global.poolObject.on('connection', (connection) => {
                console.log('new pool mysql connection!', connection.threadId);
            })

            global.poolObject.on('release', function (connection) {
                console.log('Connection %d released', connection.threadId);
            });
        }
        return await global.poolObject.getConnection();
    }else{
        return await global.poolObject.getConnection();
    }
}

module.exports = {
    moderationAction_Insert,
    moderationAction_GetNewId,
    kofi_GetKofiPhrase,
    kofi_InsertOrUpdate,
    moderationAction_Profile,
    match_GetInfo,
    match_GetDetails,
    match_GetAllMatches,
    match_UpdateMyTimes,
    match_GetExternalUser,
    match_GetAllTeams,
    match_CreateMatch,
    match_GetBasicAuthorization,
    match_ExternalUser_Create
}