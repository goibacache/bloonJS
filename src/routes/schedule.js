const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Custom
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const jwt = require('jsonwebtoken');
const { match_GetInfo, match_GetDetails, match_UpdateMyTimes, match_CreateMatch, match_GetBasicAuthorization } = require('../utils/storedProcedures.js');



/* GET schedule */
router.get('/:scheduleId', async (req, res) => {
  try {

    const scheduleId = req.params["scheduleId"];

    // Verify JWT token in cookies
    const jwtToken = req.cookies["jwt"];

    if (jwtToken == undefined || jwtToken == null) {
      // Clear process cookies
      res.clearCookie('jwt');

      const redirectTo = `/?returnUrl=` + encodeURIComponent(`/schedule/${scheduleId}`);
      res.redirect(redirectTo);
      return;
    }

    // Verify token & get contents
    let tokenContent;
    let session;
    try {
      tokenContent = jwt.verify(jwtToken, config.oAuthTokenSecret);
      session = bloonUtils.getSessionFromTokenContent(tokenContent, [config.role_LeagueOfficial, config.role_HiddenManager]);
    } catch (error) {
      // Clear process cookies
      res.clearCookie('jwt');

      const redirectTo = `/?returnUrl=${encodeURIComponent(`/schedule/${scheduleId}`)}&error=${error}`;
      res.redirect(redirectTo);
      return;
    }

    // Get match info:
    const scheduleIdInt = getMatchInfoId(scheduleId);
    if (scheduleIdInt == null || isNaN(scheduleIdInt) || !isFinite(scheduleIdInt)) {
      res.redirect('/scheduleList');
      return;
    }

    const matchInfo = await match_GetInfo(scheduleIdInt);
    if (matchInfo == null) {
      res.render('error', { message: `Sorry, couldn't load match info`, error: { status: 'error', stack: '-' } });
      return;
    }

    if (scheduleId != `${matchInfo.Name.replaceAll(" ", "-")}-${matchInfo.Id}`) {
      res.redirect('/scheduleList');
      return;
    }

    // Prepare team outputs:
    const teamsJson = [
      {
        name: matchInfo.Team1Name,
        RoleId: matchInfo.Team1RoleId,
      },
      {
        name: matchInfo.Team2Name,
        RoleId: matchInfo.Team2RoleId,
      }
    ];

    // Check against player roles!
    const teamRole = tokenContent.roles.find(x => x == matchInfo.Team1RoleId || x == matchInfo.Team2RoleId);

    const matchDetails = await match_GetDetails(scheduleIdInt, session.leagueOfficial ? null : teamRole);
    if (matchDetails == null) {
      res.render('error', { message: `Sorry, couldn't load match details`, error: { status: 'error', stack: '-' } });
      return;
    }

    let mySelections, otherSelections;
    if (session.leagueOfficial) {
      otherSelections = matchDetails;
    } else {
      mySelections = matchDetails.filter(x => x.UserDiscordId == tokenContent.id);
      otherSelections = matchDetails.filter(x => x.UserDiscordId != tokenContent.id);
    }

    // Prepare breadcrumbs
    const breadCrumbs = [
      { url: '/scheduleList', name: 'Schedule List' },
      { url: '/schedule', name: 'Schedule' },
    ];

    res.render('schedule', {
      title: 'Bloon JS - Schedule',
      matchInfo: matchInfo,
      teams: JSON.stringify(teamsJson),
      matchDetails: JSON.stringify(otherSelections),
      mySelections: JSON.stringify(mySelections),
      myName: session.name,
      myTeam: teamRole,
      session: session,
      breadCrumbs: breadCrumbs
    });
  } catch (error) {
    res.render('error', {
      message: error,
      status: 500,
      stack: error
    });
  }
});

const getMatchInfoId = (scheduleId) => {
  try {
    const lastIndex = scheduleId.lastIndexOf('-');
    return parseInt(scheduleId.substring(lastIndex + 1));
  } catch (error) {
    console.log(`Error in getMatchInfoId. Schedule id was: ${scheduleId}`);
    return null;
  }
}


/* POST Save new schedule data from user! */
router.put('/:scheduleId', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');

    const scheduleId = req.params["scheduleId"];

    // Verify JWT token in cookies
    const jwtToken = req.cookies["jwt"];

    if (jwtToken == undefined || jwtToken == null) {
      // Clear process cookies
      res.clearCookie('jwt');

      return res.end(
        JSON.stringify(
          {
            res: false,
            msg: 'No JWT token found.'
          }
        )
      );
    }

    // Verify token & get contents
    let tokenContent;
    let session;
    try {
      tokenContent = jwt.verify(jwtToken, config.oAuthTokenSecret);
      session = bloonUtils.getSessionFromTokenContent(tokenContent, [config.role_LeagueOfficial, config.role_HiddenManager]);
    } catch (error) {
      // Clear process cookies
      res.clearCookie('jwt');

      return res.end(
        JSON.stringify(
          {
            res: false,
            msg: 'invalid session'
          }
        )
      );
    }

    if (session.leagueOfficial) {
      return res.end(
        JSON.stringify(
          {
            res: false,
            msg: `Sorry, can't modify a schedule as a league official`
          }
        )
      );
    }

    // Get match info:
    const scheduleIdInt = getMatchInfoId(scheduleId);
    if (scheduleIdInt == null || isNaN(scheduleIdInt) || !isFinite(scheduleIdInt)) {
      return res.end(
        JSON.stringify(
          {
            res: false,
            msg: `Sorry, couldn't get schedule id`
          }
        )
      );
    }

    const matchInfo = await match_GetInfo(scheduleIdInt);
    if (matchInfo == null) {
      return res.end(
        JSON.stringify(
          {
            res: false,
            msg: `Sorry, couldn't load match info`
          }
        )
      );
    }

    // Check against player roles!
    const teamRole = tokenContent.roles.find(x => x == matchInfo.Team1RoleId || x == matchInfo.Team2RoleId);
    if (teamRole == null) {
      return res.end(
        JSON.stringify(
          {
            res: false,
            msg: `Bloon couldn't find you on the team roles`
          }
        )
      );
    }

    const update = await match_UpdateMyTimes(scheduleIdInt, tokenContent.id, tokenContent.name, tokenContent.avatar, req.body, teamRole);

    if (update == null) {
      return res.end(
        JSON.stringify(
          {
            res: false,
            msg: `Sorry, there was a problem saving your times!`
          }
        )
      );
    }

    // Check for the specific server and get roles
    return res.end(
      JSON.stringify(
        {
          res: true,
          msg: '💾'
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

router.post('/', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');

    const body = req.body;
    
    const authorization = req.headers.authorization;
    if (authorization == null || authorization == undefined){
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
    if (authorizationParts.length != 2){
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
    if (authorizationData.indexOf(':') == -1){
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

    const name     = userAndPassArray[0];
    const passHash = crypto.createHash('md5').update(userAndPassArray[1]).digest('hex');

    const exists = await match_GetBasicAuthorization(name, passHash);
    if (exists.length == 0){
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

    const matchUrl = await match_CreateMatch(MatchName, Team1Name, Team2Name, Team1RoleId, Team2RoleId, StartDate, EndDate, DateTimeZone);
    if (matchUrl == null){
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

module.exports = router;

