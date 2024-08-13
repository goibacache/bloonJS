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

    // Check if token is valid, if it is, it's logged, send him to the main page
    if (jwtToken == undefined || jwtToken == null || jwtToken.length == null) {
        // Clear process cookies
        const cookieOptions = { SameSite: "none", secure: true };
        res.clearCookie('jwt', cookieOptions);
        res.clearCookie('avatar', cookieOptions);
        res.clearCookie('name', cookieOptions);
        res.redirect('/');
    }
    if (jwtToken != undefined && jwtToken != null) {
        try {
            tokenContent = jwt.verify(jwtToken, config.oAuthTokenSecret);
        } catch (error) {
            res.clearCookie('jwt');
            res.clearCookie('avatar');
            res.clearCookie('name');
            res.redirect('/');
        }
    }

    const matches = await match_GetAllMatches(tokenContent.roles.toString());

    res.render('scheduleList', { title: `Bloon JS - Your team's schedules`, matches: matches });
});


module.exports = router;