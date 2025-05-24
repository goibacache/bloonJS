const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Custom
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const { match_CreateMatch, match_GetBasicAuthorization } = require('../utils/storedProcedures.js');

const regUrl = /(https?:\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{1,6}\b([-a-zA-Z@:%_+.~#?&//=]*)?/gi;

router.post('/v1/createMatch', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        const body = req.body;

        const authorization = req.headers.authorization;
        if (authorization == null || authorization == undefined) {
            return res.end(bloonUtils.match_createJsonResError("No authorization"))
        }

        // Check it has 2 parts
        const authorizationParts = authorization.split(' ');
        if (authorizationParts.length != 2) {
            return res.end(bloonUtils.match_createJsonResError("Bad authorization format"));
        }

        const authorizationData = Buffer.from(authorizationParts[1], 'base64').toString('utf8');
        if (authorizationData.indexOf(':') == -1) {
            return res.end(bloonUtils.match_createJsonResError("Invalid authorization data"));
        }

        const userAndPassArray = authorizationData.split(':');

        const name = userAndPassArray[0];
        const passHash = crypto.createHash('md5').update(userAndPassArray[1]).digest('hex');

        const exists = await match_GetBasicAuthorization(name, passHash);
        if (exists.length == 0) {
            return res.end(bloonUtils.match_createJsonResError("Incorrect authorization data"));
        }

        // Get body params
        const { MatchName, Team1Name, Team1RoleId, Team2Name, Team2RoleId, StartDate, EndDate, DateTimeZone } = body;


        // Check body integrity.
        if (isNullUndefinedOrEmpty(MatchName) || isNullUndefinedOrEmpty(Team1Name) || isNullUndefinedOrEmpty(Team1RoleId)
            || isNullUndefinedOrEmpty(Team2Name) || isNullUndefinedOrEmpty(Team2RoleId) || isNullUndefinedOrEmpty(StartDate)
            || isNullUndefinedOrEmpty(EndDate) || isNullUndefinedOrEmpty(DateTimeZone)
        ) {
            return res.end(bloonUtils.match_createJsonResError("Missing parameters"));
        }

        if (MatchName == null || MatchName == undefined || MatchName.length == 0) {
            return res.end(bloonUtils.match_createJsonResError("Match name can't be empty"));
        }

        if (Team1Name == null || Team1Name == undefined || Team1Name.length == 0) {
            return res.end(bloonUtils.match_createJsonResError("Team 1 name can't be empty"));
        }

        if (Team2Name == null || Team2Name == undefined || Team2Name.length == 0) {
            return res.end(bloonUtils.match_createJsonResError("Team 1 name can't be empty"));
        }

        if (Team1RoleId == null || Team1RoleId == undefined || Team1RoleId.length == 0) {
            return res.end(bloonUtils.match_createJsonResError("Team 1 Id name can't be null or empty"));
        }

        if (Team2RoleId == null || Team2RoleId == undefined || Team2RoleId.length == 0) {
            return res.end(bloonUtils.match_createJsonResError("Team 2 Id name can't be null or empty"));
        }

        if (StartDate == null || StartDate == undefined || StartDate.length == 0 || !bloonUtils.match_isCustomDateFormatOK(StartDate)) {
            return res.end(bloonUtils.match_createJsonResError("Start date has an invalid format."));
        }

        if (EndDate == null || EndDate == undefined || EndDate.length == 0 || !bloonUtils.match_isCustomDateFormatOK(EndDate)) {
            return res.end(bloonUtils.match_createJsonResError("Start date has an invalid format."));
        }

        if (DateTimeZone == null || DateTimeZone == undefined || DateTimeZone.length == 0) {
            return res.end(bloonUtils.match_createJsonResError("Timezone seems to be invalid."));
        }

        const matchUrl = await match_CreateMatch(MatchName, Team1Name, Team2Name, Team1RoleId, Team2RoleId, StartDate, EndDate, DateTimeZone, name);
        if (matchUrl == null) {
            return res.end(bloonUtils.match_createJsonResError("There was an error creating the match, sorry."));
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
        return res.end(bloonUtils.match_createJsonResError(error));
    }
});

router.post('/v1/newVideo', async(req, res) => {
    try {

        const hook = req.query["hook"];
        const isUrl = hook.match(regUrl);
        if (!isUrl){
            console.log(`newVideo: Hook is not an URL ${hook}`);
            return res.end();
        }

        const youtubeVideoUrl = req.body.feed.entry[0].link[0]["$"].href;
        const isYoutubeVideoUrl = youtubeVideoUrl ? youtubeVideoUrl.match(regUrl) : false;
        if(!isYoutubeVideoUrl){
            console.log(`newVideo: Youtube link is not an URL ${youtubeVideoUrl}`);
            return res.end();
        }

        console.log(`posting to discord: ${youtubeVideoUrl}`);
        await fetch(hook, {
            method: 'POST',
              headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ "content": youtubeVideoUrl })
        });

        return res.end(
            youtubeVideoUrl
        );

    } catch (error) {
        return res.end(bloonUtils.match_createJsonResError(error));
    }
})

const isNullUndefinedOrEmpty = (variable) => {
    return variable == undefined || variable == null || variable.length == 0;
}

module.exports = router;