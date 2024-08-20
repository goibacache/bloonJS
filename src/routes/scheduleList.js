// required
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Custom
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const { match_GetAllMatches } = require('../utils/storedProcedures.js');

/* GET home page. */
router.get('/', async(req, res) => {

    // Check if user have token in cookies
    const jwtToken = req.cookies["jwt"];
    let tokenContent = null;
    let session = null;

    // Check if token is valid, if it is, it's logged, send him to the main page
    
    if (jwtToken == undefined || jwtToken == null || jwtToken.length == null) {
        // Clear process cookies
        const cookieOptions = { SameSite: "none", secure: true };
        res.clearCookie('jwt', cookieOptions);
        res.redirect('/');
        res.end();
        return;
    }

    if (jwtToken != undefined && jwtToken != null) {
        try {
            tokenContent = jwt.verify(jwtToken, config.oAuthTokenSecret);
            if (tokenContent.roles != null || tokenContent.roles.length > 0){
                session = bloonUtils.getSessionFromTokenContent(tokenContent, [config.role_LeagueOfficial, config.role_HiddenManager]);
            }
        } catch (error) {
            res.clearCookie('jwt');
            res.redirect('/');
            res.end();
            return;
        }
    }

    const matches = await match_GetAllMatches(session.leagueOfficial ? null : tokenContent.roles.toString());

    // Parse matches and add them as DateTime to sort them in the main view
    matches.forEach(match => {
        const dateParts = match.StartDate.split('.');
        match.JSDateTime = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
    });

    // Prepare breadcrumbs
    const breadCrumbs = [
        { url: '/scheduleList', name: 'Schedule List' }
    ];

    res.render('scheduleList', { title: `Bloon JS - Your team's schedules`, matches: matches, session: session, breadCrumbs: breadCrumbs });
});


module.exports = router;