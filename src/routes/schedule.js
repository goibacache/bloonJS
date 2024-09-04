const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Custom
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const jwt = require('jsonwebtoken');
const { match_GetInfo, match_GetDetails, match_UpdateMyTimes } = require('../utils/storedProcedures.js');



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
      return res.redirect(redirectTo);
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
      return res.redirect(redirectTo);
    }

    // Get match info:
    const scheduleIdInt = getMatchInfoId(scheduleId);
    if (scheduleIdInt == null || isNaN(scheduleIdInt) || !isFinite(scheduleIdInt)) {
      return res.redirect('/scheduleList');
    }

    const matchInfo = await match_GetInfo(scheduleIdInt);
    if (matchInfo == null) {
      return res.render('error', { message: `Sorry, couldn't load match info`, error: { status: 'error', stack: '-' } });
    }

    if (scheduleId != `${matchInfo.Name.replaceAll(" ", "-")}-${matchInfo.Id}`) {
      return res.redirect('/scheduleList');
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
      return res.render('error', { message: `Sorry, couldn't load match details`, error: { status: 'error', stack: '-' } });
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

    return res.render('schedule', {
      title: 'When2Bloon - Schedule',
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
    return res.render('error', {
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


/* PUT Save new schedule data from user! */
router.put('/:scheduleId', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');

    const scheduleId = req.params["scheduleId"];

    // Verify JWT token in cookies
    const jwtToken = req.cookies["jwt"];

    if (jwtToken == undefined || jwtToken == null) {
      // Clear process cookies
      res.clearCookie('jwt');

      return res.end(bloonUtils.match_createJsonResError("Couldn't identify the user."));
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

      return res.end(bloonUtils.match_createJsonResError("Your session has expired, please log in again."));
    }

    if (session.leagueOfficial) {
      return res.end(bloonUtils.match_createJsonResError("Sorry, can't modify a schedule while logged in as a league official"));
    }

    // Get match info:
    const scheduleIdInt = getMatchInfoId(scheduleId);
    if (scheduleIdInt == null || isNaN(scheduleIdInt) || !isFinite(scheduleIdInt)) {
      return res.end(bloonUtils.match_createJsonResError("Couldn't get schedule id."));
    }

    const matchInfo = await match_GetInfo(scheduleIdInt);
    if (matchInfo == null) {
      return res.end(bloonUtils.match_createJsonResError("Couldn't load match info, please try again."));
    }

    // Check against player roles!
    const teamRole = tokenContent.roles.find(x => x == matchInfo.Team1RoleId || x == matchInfo.Team2RoleId);
    if (teamRole == null) {
      return res.end(bloonUtils.match_createJsonResError("You're not on the team roster, can't modify the schedule."));
    }

    const update = await match_UpdateMyTimes(scheduleIdInt, tokenContent.id, tokenContent.name, tokenContent.avatar, req.body, teamRole);

    if (update == null) {
      return res.end(bloonUtils.match_createJsonResError("Sorry, there was a problem saving your times, please try again."));
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
    return res.end(bloonUtils.match_createJsonResError(error));
  }
});

module.exports = router;

