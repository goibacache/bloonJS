// required
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Custom
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const { match_GetAllMatches } = require('../utils/storedProcedures.js');

/* GET home page. */
router.get('/', async (req, res) => {

    // Check if user have token in cookies
    const jwtToken = req.cookies["jwt"];
    let tokenContent = null;
    let session = null;

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
        } catch (error) {
            res.clearCookie('jwt');
            return res.redirect('/');
        }
    }

    // Prepare breadcrumbs
    const breadCrumbs = [
        { url: '/scheduleList', name: 'Schedule List' }
    ];

    res.render('scheduleList', { title: `When2Bloon - Schedule List`, session: session, breadCrumbs: breadCrumbs });
});

router.post('/listMatches', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        // Check if user have token in cookies
        const jwtToken = req.cookies["jwt"];
        let tokenContent = null;
        let session = null;

        // Check if token is valid, if it is, it's logged, send him to the main page
        if (jwtToken == undefined || jwtToken == null || jwtToken.length == null) {
            return res.end(bloonUtils.match_createJsonResError("Couldn't identify your account, please log in again."));
        }

        if (jwtToken != undefined && jwtToken != null) {
            try {
                tokenContent = jwt.verify(jwtToken, config.oAuthTokenSecret);
                session = bloonUtils.getSessionFromTokenContent(tokenContent, [config.role_LeagueOfficial, config.role_HiddenManager]);
            } catch (error) {
                return res.end(bloonUtils.match_createJsonResError("Your session has expired, please log in again."));
            }
        }

        if (req.body.FutureOrPast == null || req.body.FutureOrPast == undefined || req.body.FutureOrPast.length == 0 || (req.body.FutureOrPast != "Future" && req.body.FutureOrPast != "Past")){
            return res.end(bloonUtils.match_createJsonResError("Please select if you want to see upcoming or past matches."));
        }

        const matches = await match_GetAllMatches(session.leagueOfficial ? null : tokenContent.roles.toString(), req.body.FutureOrPast);

        if (matches == null) {
            return res.end(bloonUtils.match_createJsonResError("Couldn't load matches, please try again."));
        }

        return res.end(
            JSON.stringify(
                {
                    res: true,
                    matches: matches
                }
            )
        );

    } catch (error) {
        return res.end(bloonUtils.match_createJsonResError(error));
    }


});


module.exports = router;