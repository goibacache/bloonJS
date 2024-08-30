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

router.get('/matches', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        // Check if user have token in cookies
        const jwtToken = req.cookies["jwt"];
        let tokenContent = null;
        let session = null;

        // Check if token is valid, if it is, it's logged, send him to the main page
        if (jwtToken == undefined || jwtToken == null || jwtToken.length == null) {
            return res.end(
                JSON.stringify(
                    {
                        res: false,
                        msg: `Couldn't identify your`
                    }
                )
            );
        }

        if (jwtToken != undefined && jwtToken != null) {
            try {
                tokenContent = jwt.verify(jwtToken, config.oAuthTokenSecret);
                session = bloonUtils.getSessionFromTokenContent(tokenContent, [config.role_LeagueOfficial, config.role_HiddenManager]);
            } catch (error) {
                return res.end(
                    JSON.stringify(
                        {
                            res: false,
                            msg: `Couldn't identify your user`
                        }
                    )
                );
            }
        }

        const matches = await match_GetAllMatches(session.leagueOfficial ? null : tokenContent.roles.toString());

        if (matches == null) {
            return res.end(
                JSON.stringify(
                    {
                        res: false,
                        msg: `Couldn't load matches`
                    }
                )
            );
        }

        // Parse matches and add them as DateTime to sort them in the main view
        // matches.forEach(match => {
        //     const dateParts = match.StartDate.split('.');
        //     match.JSDateTime = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
        // });

        return res.end(
            JSON.stringify(
                {
                    res: true,
                    matches: matches
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


});


module.exports = router;