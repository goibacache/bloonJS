const bloonUtils = require('../utils/utils.js');
const mysql = require('mysql2/promise');
const config = bloonUtils.getConfig();

const moderationAction_Insert = async(moderationAction, banedUserDiscordId, banReason, handledByDiscordId, fullMessage = '') => {
    try{
        const query = `CALL moderationAction_Insert(?, ?, ?, ?, ?)`;
    
        const connection = await createConnection();

        const [rows] = await connection.execute(query, [moderationAction.id, banedUserDiscordId, banReason, handledByDiscordId, fullMessage]);

        return parseInt(rows[0][0]['res']); // Awful, but eh.

    }catch(error){
        console.error("Error in sp_banInsert: ", error);
        return 0;
    }
}

const moderationAction_GetNewId = async(moderationAction) => {
    try{
        const query = `CALL moderationAction_GetNewId(?)`;

        const connection = await createConnection();
    
        const [rows] = await connection.execute(query, [moderationAction.id]);
    
        return parseInt(rows[0][0]['res']); // Awful, but eh.
    }catch(error){
        console.error("Error in moderationAction_GetNewId: ", error);
        return 0;
    }
}

const kofi_GetKofiPhrase = async(_userName) => {
    try{
        const query = `CALL kofiphrase_get(?)`;

        const connection = await createConnection();

        const [rows] = await connection.execute(query, [_userName]);

        return rows[0]; // Awful, but eh.
    }catch(error){
        console.error("Error in kofiphrase_get: ", error);
        return null;
    }
}

const moderationAction_Profile = async(_userId) => {
    try{
        const query = `CALL moderationAction_Profile(?)`;

        const connection = await createConnection();

        const [rows] = await connection.execute(query, [_userId]);

        return rows[0]; // Awful, but eh.
    }catch(error){
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
    try{
        const query = `CALL kofiphrase_InsertOrUpdate(?, ?, ?)`;

        const connection = await createConnection();

        const [rows] = await connection.execute(query, [_userName, _phrase, _renewal ?? 0]);

        return rows[0]; // Awful, but eh.
    }catch(error){
        console.error("Error in kofiphrase_InsertOrUpdate: ", error);
        return null;
    }
}

/**
 * 
 * @param {string} _matchId The match id with underscores instead of spaces and the id at the end of the name 
 */
const match_GetInfo = async(_matchId) => {
    try{
        const query = `CALL match_GetInfo(?)`;

        const connection = await createConnection();

        const [rows] = await connection.execute(query, [_matchId]);

        return rows[0][0]; // Get first result only.
    }catch(error){
        console.error("Error in match_GetInfo: ", error);
        return null;
    }
}

const match_GetDetails = async(_matchId, _role) => {
    // match_GetDetails
    try{
        const query = `CALL match_GetDetails(?, ?)`;

        const connection = await createConnection();

        const [rows] = await connection.execute(query, [_matchId, _role]);

        return rows[0]; // Awful, but eh.
    }catch(error){
        console.error("Error in match_GetDetails: ", error);
        return null;
    }
}

/**
 * 
 * @param {string} _roles Role list coma separated (,) [IK, IK...]
 */
const match_GetAllMatches = async(_roles) => {
    // match_GetAllMatches
    try{
        const query = `CALL match_GetAllMatches(?)`;

        const connection = await createConnection();

        const [rows] = await connection.execute(query, [_roles]);

        return rows[0]; // Awful, but eh.
    }catch(error){
        console.error("Error in match_GetAllMatches: ", error);
        return null;
    }
}

const createConnection = async () => {
    return await mysql.createConnection({
        host:               config.mysqlHost,
        user:               config.mysqlUser,
        password:           config.mysqlPass,
        database:           config.mysqlDDBB,
        charset:            "utf8mb4_bin",
        connectTimeout:     120 * 60
    });
}

module.exports = {
    moderationAction_Insert,
    moderationAction_GetNewId,
    kofi_GetKofiPhrase,
    kofi_InsertOrUpdate,
    moderationAction_Profile,
    match_GetInfo,
    match_GetDetails,
    match_GetAllMatches
}