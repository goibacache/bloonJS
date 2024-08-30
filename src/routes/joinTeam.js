// required
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Custom
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const { match_GetAllTeams, match_ExternalUser_Create } = require('../utils/storedProcedures.js');

/* GET home page. */
router.get('/', async (req, res) => {

    // Check if user have token in cookies
    let tokenContent = null;
    let session = null;
    let externalUserData = req.cookies["externalUserData"];
    const cookieOptions = { SameSite: "none", secure: true };

    // Check if token is valid, if it is, it's logged, send him to the main page
    if (externalUserData == undefined || externalUserData == null || externalUserData.length == null) {
        // Clear process cookies
        res.clearCookie('jwt', cookieOptions);
        res.clearCookie('externalUserData', cookieOptions);
        return res.redirect('/');
    }

    if (externalUserData != undefined && externalUserData != null) {
        try {
            tokenContent = jwt.verify(externalUserData, config.oAuthTokenSecret);
            session = bloonUtils.getSessionFromTokenContent(tokenContent, []);
        } catch (error) {
            console.log("Error in JoinTeam View:", error);
            res.clearCookie('jwt', cookieOptions);
            res.clearCookie('externalUserData', cookieOptions);
            res.render('error', { message: `Sorry, couldn't load your profile, please log in again`, error: { status: 'error', stack: '-' } });
            res.end();
        }
    }

    const teams = await match_GetAllTeams();

    if (teams == null) {
        res.render('error', { message: `Sorry, couldn't load the team list`, error: { status: 'error', stack: '-' } });
        res.end();
        return;
    }

    res.render('joinTeam', { title: 'When2Bloon - Join a team', session: session, teams: teams });
});

/**
 * Sends message using a discord webhook
 */
router.post('/', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {

        // Check if user have token in cookies
        let tokenContent = null;
        let externalUserData = req.cookies["externalUserData"];
        const cookieOptions = { SameSite: "none", secure: true };

        // Check if token is valid, if it is, it's logged, send him to the main page
        if (externalUserData == undefined || externalUserData == null || externalUserData.length == null) {
            // Clear process cookies
            res.clearCookie('jwt', cookieOptions);
            res.clearCookie('externalUserData', cookieOptions);
            return res.end(
                JSON.stringify(
                    {
                        res: false,
                        msg: "Sorry, we couldn't load your session data, please log out and log in again."
                    }
                )
            );
        }

        if (externalUserData != undefined && externalUserData != null) {
            try {
                tokenContent = jwt.verify(externalUserData, config.oAuthTokenSecret);
            } catch (error) {
                console.log("Error in JoinTeam View:", error);
                res.clearCookie('jwt', cookieOptions);
                res.clearCookie('externalUserData', cookieOptions);

                return res.end(
                    JSON.stringify(
                        {
                            res: false,
                            msg: "Sorry, couldn't load your profile, please log in again"
                        }
                    )
                );
            }
        }

        // Check the body for the selected team
        if (!req.body) {
            return res.end(
                JSON.stringify(
                    {
                        res: false,
                        msg: "You need to select a team"
                    }
                )
            );
        }

        const selectedTeamBody = req.body.team;

        if (selectedTeamBody == undefined || selectedTeamBody == null || selectedTeamBody == "0") {
            return res.end(
                JSON.stringify(
                    {
                        res: false,
                        msg: "Please select a valid team"
                    }
                )
            );
        }

        // Get all teams
        const teams = await match_GetAllTeams();

        if (teams == null) {
            return res.end(
                JSON.stringify(
                    {
                        res: false,
                        msg: "Couldn't load teams, please try again."
                    }
                )
            );
        }

        const selectedTeam = teams.find(x => x.TeamRoleId == selectedTeamBody);

        if (selectedTeam == null) {
            return res.end(
                JSON.stringify(
                    {
                        res: false,
                        msg: "Couldn't find the selected team."
                    }
                )
            );
        }

        const createOnDatabaseResult = await match_ExternalUser_Create(tokenContent.id, tokenContent.name, tokenContent.avatar, selectedTeam.TeamRoleId);

        if (createOnDatabaseResult != ""){
            return res.end(
                JSON.stringify(
                    {
                        res: false,
                        msg: "You already have a pending exception."
                    }
                )
            );
        }

        const body = {
            "username": tokenContent.name,
            "content": `\`\`\`${tokenContent.name} (${tokenContent.id}) would like to be allowed to see ${selectedTeam.Name} (${selectedTeam.TeamRoleId}) matches.\nUsername: ${tokenContent.name}\nDiscord Id: ${tokenContent.id}\nAvatar: ${tokenContent.avatar}\nTeam name: ${selectedTeam.Name}\nTeam Id: ${selectedTeam.TeamRoleId}\`\`\``,
            "avatar_url": bloonUtils.getAvatarUrl(tokenContent.id, tokenContent.avatar, 80)
        }

        const discordResponse = await bloonUtils.discordApiRequest(config.ICLWebHookToAddToTeam, null, null, body, 'POST');

        if (discordResponse == null || discordResponse.code != 204) {
            return res.end(
                JSON.stringify(
                    {
                        res: false,
                        msg: "There was a problem sending the message, please try again."
                    }
                )
            );
        }

        // Won't need it anymore
        res.clearCookie('externalUserData');

        return res.end(
            JSON.stringify(
                { res: true }
            )
        );
    } catch (error) {
        return res.end(
            JSON.stringify(
                { res: false, msg: error }
            )
        );
    }

});


module.exports = router;