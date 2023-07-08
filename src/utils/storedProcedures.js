const bloonUtils = require('../utils/utils.js');
const mysql = require('mysql2/promise');
const config = bloonUtils.getConfig();

const moderationAction_Insert = async(moderationAction, banedUserDiscordId, banReason, handledByDiscordId) => {
    try{
        const query = `CALL moderationAction_Insert(?, ?, ?, ?)`;
    
        const connection = await createConnection();

        const [rows] = await connection.execute(query, [moderationAction.id, banedUserDiscordId, banReason, handledByDiscordId]);

        return parseInt(rows[0][0]['res']); // Awfull, but eh.

    }catch(error){
        console.error("Error in sp_banInsert: ", error);
        return 0;
    }
}

const moderationAction_GetNewId = async(moderationAction) => {
    const query = `CALL moderationAction_GetNewId(?)`;

    const connection = await createConnection();

    const [rows] = await connection.execute(query, [moderationAction.id]);

    return parseInt(rows[0][0]['res']); // Awfull, but eh.
}

const createConnection = async () => {
    return await mysql.createConnection({
        host:       config.mysqlHost,
        user:       config.mysqlUser,
        password:   config.mysqlPass,
        database:   config.mysqlDDBB,
        charset:    "utf8mb4_bin"
    });
}

const execSP = (query) => {
    const connection = createConnection();

    connection.connect(function(err) {
        if (err) {
            //return console.error('SQL connection error: ' + err.message);
            return false;
        }
    
        //console.log('Connected to SQL!');
    
        connection.query(query, function (err, result, fields) {
            if (err) {
                //console.error("SQL query error: ", err);
                return false;
            };

            // console.log("SQL RESULT: ", result);
            
            /* CLOSE CONECTION */
            connection.end(function(err) {
                if (err) {
                    //return console.log('SQL connection end error:' + err.message);
                    return false;
                }
                //console.log('Closed the database connection!');
                return true;
            });
        });
    });
}


module.exports = {
    moderationAction_Insert,
    moderationAction_GetNewId
}