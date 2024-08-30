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
            return res.end(
                JSON.stringify(
                    {
                        res: false,
                        msg: "You don't have the necessary permissions to create a match."
                    }
                )
            );
        }

        if (jwtToken != undefined && jwtToken != null) {
            try {
                tokenContent = jwt.verify(jwtToken, config.oAuthTokenSecret);
                session = bloonUtils.getSessionFromTokenContent(tokenContent, [config.role_LeagueOfficial, config.role_HiddenManager]);

                if (session == null || !session.leagueOfficial) {
                    return res.end(
                        JSON.stringify(
                            {
                                res: false,
                                msg: "You don't have the necessary permissions to create a match."
                            }
                        )
                    );
                }
            } catch (error) {
                return res.end(
                    JSON.stringify(
                        {
                            res: false,
                            msg: "You don't have the necessary permissions to create a match. Please log in again."
                        }
                    )
                );
            }
        }

        if (req.body == null || req.body.matches == null || req.body.matches.length == 0) {
            return res.end(
                JSON.stringify(
                    {
                        res: false,
                        msg: "No match data found"
                    }
                )
            );
        }

        const matches = JSON.parse(req.body.matches);
        const startDate = formatDate(req.body.startDate);
        const endDate = formatDate(req.body.endDate);
        const timeZone = req.body.timezone;

        // TODO: Validations

        const promises = [];

        for (const match of matches) {
            promises.push(match_CreateMatch(match.matchName, match.team1Name, match.team2Name, match.team1Id, match.team2Id, startDate, endDate, timeZone));
        }

        await Promise.all(promises);

        return res.end(
            JSON.stringify(
                { res: true }
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