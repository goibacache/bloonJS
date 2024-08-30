const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Custom
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const { match_CreateMatch, match_GetBasicAuthorization } = require('../utils/storedProcedures.js');


router.post('/v1/createMatch', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        const body = req.body;

        const authorization = req.headers.authorization;
        if (authorization == null || authorization == undefined) {
            return res.end(
                JSON.stringify(
                    {
                        res: false,
                        msg: 'No authorization'
                    }
                )
            );
        }

        // Check it has 2 parts
        const authorizationParts = authorization.split(' ');
        if (authorizationParts.length != 2) {
            return res.end(
                JSON.stringify(
                    {
                        res: false,
                        msg: 'Bad authorization format'
                    }
                )
            );
        }

        const authorizationData = Buffer.from(authorizationParts[1], 'base64').toString('utf8');
        if (authorizationData.indexOf(':') == -1) {
            return res.end(
                JSON.stringify(
                    {
                        res: false,
                        msg: 'Invalid authorization data'
                    }
                )
            );
        }

        const userAndPassArray = authorizationData.split(':');

        const name = userAndPassArray[0];
        const passHash = crypto.createHash('md5').update(userAndPassArray[1]).digest('hex');

        const exists = await match_GetBasicAuthorization(name, passHash);
        if (exists.length == 0) {
            return res.end(
                JSON.stringify(
                    {
                        res: false,
                        msg: 'Incorrect authorization data'
                    }
                )
            );
        }

        // Get body params
        const { MatchName, Team1Name, Team1RoleId, Team2Name, Team2RoleId, StartDate, EndDate, DateTimeZone } = body;


        // Check body integrity.
        if (isNullUndefinedOrEmpty(MatchName) || isNullUndefinedOrEmpty(Team1Name) || isNullUndefinedOrEmpty(Team1RoleId)
            || isNullUndefinedOrEmpty(Team2Name) || isNullUndefinedOrEmpty(Team2RoleId) || isNullUndefinedOrEmpty(StartDate)
            || isNullUndefinedOrEmpty(EndDate) || isNullUndefinedOrEmpty(DateTimeZone)
        ) {
            return res.end(
                JSON.stringify(
                    {
                        res: false,
                        msg: 'Missing parameters'
                    }
                )
            );
        }

        const matchUrl = await match_CreateMatch(MatchName, Team1Name, Team2Name, Team1RoleId, Team2RoleId, StartDate, EndDate, DateTimeZone, name);
        if (matchUrl == null) {
            return res.end(
                JSON.stringify(
                    {
                        res: false,
                        msg: 'There was an error creating the match'
                    }
                )
            );
        }

        const url = `${config.WEB_Host}/schedule/${matchUrl}`;

        console.log(`📅 ${name} created a match with the name "${MatchName}" for ${Team1Name} (${Team1RoleId}) and ${Team2Name} (${Team2RoleId})\nUrl: ${url}`);

        return res.end(
            JSON.stringify(
                {
                    res: true,
                    matchUrl: url
                }
            )
        );
    } catch (error) {
        return res.end(
            JSON.stringify(
                {
                    res: false,
                    msg: error
                }
            )
        );
    }
})

const isNullUndefinedOrEmpty = (variable) => {
    return variable == undefined || variable == null || variable.length == 0;
}