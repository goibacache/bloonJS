// required
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Custom
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const { match_GetAllTeams } = require('../utils/storedProcedures.js');
const { match_CreateMatch } = require('../utils/storedProcedures.js');

/* GET home page. */
router.get('/', async (req, res) => {

    // Check if user have token in cookies
    let tokenContent, session;
    const jwtToken = req.cookies["jwt"];

    // Check if token is valid, if it is, it's logged, send him to the main page
    if (jwtToken == undefined || jwtToken == null || jwtToken.length == null) {
        // Clear process cookies
        const cookieOptions = { SameSite: "none", secure: true };
        res.clearCookie('jwt', cookieOptions);
        return res.redirect('/');
    }

    if (jwtToken != undefined && jwtToken != null) {
        try {
            tokenContent = jwt.verify(jwtToken, config.oAuthTokenSecret);
            session = bloonUtils.getSessionFromTokenContent(tokenContent, [config.role_LeagueOfficial, config.role_HiddenManager]);

            if (session == null || !session.leagueOfficial) {
                return res.redirect('/scheduleList');
            }
        } catch (error) {
            res.clearCookie('jwt');
            return res.redirect('/');
        }
    }

    const teams = await match_GetAllTeams();

    if (teams == null) {
        res.render('error', { message: `Sorry, couldn't load the team list`, error: { status: 'error', stack: '-' } });
        res.end();
        return;
    }

    res.render('createMatch', { title: 'When2Bloon - Create match', session: session, teams: teams });
});

router.post('/', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {

        // Check if user have token in cookies
        let tokenContent, session;
        const jwtToken = req.cookies["jwt"];

        // Check if token is valid, if it is, it's logged, send him to the main page
        if (jwtToken == undefined || jwtToken == null || jwtToken.length == null) {
            return res.end(bloonUtils.match_createJsonResError("You don't have the necessary permissions to create a match."));
        }

        if (jwtToken != undefined && jwtToken != null) {
            try {
                tokenContent = jwt.verify(jwtToken, config.oAuthTokenSecret);
                session = bloonUtils.getSessionFromTokenContent(tokenContent, [config.role_LeagueOfficial, config.role_HiddenManager]);

                if (session == null || !session.leagueOfficial) {
                    return res.end(bloonUtils.match_createJsonResError("You don't have the necessary permissions to create a match."));
                }
            } catch (error) {
                return res.end(bloonUtils.match_createJsonResError("You don't have the necessary permissions to create a match, please log in again."));
            }
        }

        if (req.body == null || req.body.matches == null || req.body.matches.length == 0) {
            return res.end(bloonUtils.match_createJsonResError("No match data found."));
        }

        const matches = JSON.parse(req.body.matches);
        const startDate = formatDate(req.body.startDate);
        const endDate = formatDate(req.body.endDate);
        const timeZone = req.body.timezone;

        const promises = [];

        // Validate every match...
        for (const match of matches) {
            if (match.matchName == null || match.matchName == undefined || match.matchName.length == 0) {
                return res.end(bloonUtils.match_createJsonResError("Match name can't be empty"));
            }

            if (match.team1Name == null || match.team1Name == undefined || match.team1Name.length == 0) {
                return res.end(bloonUtils.match_createJsonResError("Team 1 name can't be empty"));
            }

            if (match.team2Name == null || match.team2Name == undefined || match.team2Name.length == 0) {
                return res.end(bloonUtils.match_createJsonResError("Team 1 name can't be empty"));
            }

            if (match.team1Id == null || match.team1Id == undefined || match.team1Id.length == 0) {
                return res.end(bloonUtils.match_createJsonResError("Team 1 Id name can't be null or empty"));
            }

            if (match.team2Id == null || match.team2Id == undefined || match.team2Id.length == 0) {
                return res.end(bloonUtils.match_createJsonResError("Team 2 Id name can't be null or empty"));
            }

            if (startDate == null || startDate == undefined || startDate.length == 0 || !bloonUtils.match_isCustomDateFormatOK(startDate)) {
                return res.end(bloonUtils.match_createJsonResError("Start date has an invalid format."));
            }

            if (endDate == null || endDate == undefined || endDate.length == 0 || !bloonUtils.match_isCustomDateFormatOK(endDate)) {
                return res.end(bloonUtils.match_createJsonResError("Start date has an invalid format."));
            }

            if (timeZone == null || timeZone == undefined || timeZone.length == 0) {
                return res.end(bloonUtils.match_createJsonResError("Timezone seems to be invalid."));
            }
        }

        for (const match of matches) {
            promises.push(match_CreateMatch(match.matchName, match.team1Name, match.team2Name, match.team1Id, match.team2Id, startDate, endDate, timeZone, `${session.name} (${session.id})`));
        }

        const allPromises = await Promise.all(promises);

        // If all of them failed x_x
        if (allPromises.filter(x => x != null).length == 0){
            return res.end(bloonUtils.match_createJsonResError(`Couldn't save the matches, please try again.`));
        }

        const urls = [];

        allPromises.forEach(element => {
            urls.push(`${config.WEB_Host}/schedule/${element}`);
        });

        return res.end(
            JSON.stringify(
                { 
                    res: true,
                    matchUrls: urls
                 }
            )
        );
    } catch (error) {
        return res.end(bloonUtils.match_createJsonResError(error));
    }

});



/**
 * Expects a date in the YYYY-MM-DD format and transforms it into DD.MM.YYYY.00.00
 * @param {*} date 
 */
const formatDate = (date) => {
    const dateParts = date.split("-");
    return `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}.00.00`;
}

module.exports = router;