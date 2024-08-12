const express = require('express');
const router = express.Router();

// Custom
const bloonUtils 	            = require('../utils/utils.js');
const config 		              = bloonUtils.getConfig();
const jwt                     = require('jsonwebtoken');
const { match_GetInfo, match_GetDetails } = require('../utils/storedProcedures.js');

const discordApiRequest = async(discordApiEndpoint, tokenType, accessToken) => {
  return await fetch(`https://discord.com/api/${discordApiEndpoint}`, {
      headers: {
          authorization: `${tokenType} ${accessToken}`,
      },
  })
  .then(result => result.json())
  .catch(error => {
      console.error(error);
      return null;
  });
};

/* GET schedule */
router.get('/:scheduleId', async (req, res) => {

  const scheduleId = req.params["scheduleId"];

  //const timeZones = Intl.supportedValuesOf('timeZone');

  // Verify JWT token in cookies
  const jwtToken = req.cookies["jwt"];

  if (jwtToken == undefined || jwtToken == null){
    const redirectTo = `/?returnUrl=` + encodeURIComponent(`/schedule/${scheduleId}`);
    res.redirect(redirectTo);
    return;
  }

  // Verify token & get contents
  let tokenContent;
  try{
    tokenContent = jwt.verify(jwtToken, config.oAuthTokenSecret);
  }catch(error){
    const redirectTo = `/?returnUrl=${encodeURIComponent(`/schedule/${scheduleId}`)}&error=${error}`;
    res.redirect(redirectTo);
    return;
  }

  // Get match info:
  const scheduleIdInt = getMatchInfoId(scheduleId);
  if (scheduleIdInt == null || isNaN(scheduleIdInt) || !isFinite(scheduleIdInt)){
    res.render('error', {message: `Sorry, couldn't get schedule id`, error: { status: 'wrong match url', stack: '-' } });
    return;
  }

  const matchInfo = await match_GetInfo(scheduleIdInt);
  if (matchInfo == null){
    res.render('error', {message: `Sorry, couldn't load match info`, error: { status: 'error', stack: '-' } });
    return;
  }

  // Check against player roles!
  const teamRole = tokenContent.roles.find(x => x == matchInfo.Team1RoleId || matchInfo.Team2RoleId);

  let isHiddenManager = false;
  if (tokenContent.roles.some(x => x == config.role_HiddenManager)){
    isHiddenManager = true;
  }

  const matchDetails = await match_GetDetails(scheduleIdInt, isHiddenManager ? null : teamRole);
  if (matchDetails == null){
    res.render('error', {message: `Sorry, couldn't load match details`, error: { status: 'error', stack: '-' } });
    return;
  }

  // Prepare outputs:
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

  res.render('schedule', { 
    title:            'Bloon JS - Schedule',
    matchTitle:       matchInfo.Name,
    teams:            JSON.stringify(teamsJson),
    matchDetails:     JSON.stringify(matchDetails),
    isHiddenManager:  isHiddenManager,
    clearCookies:     false
  });
});

const getMatchInfoId = (scheduleId) => {
  try{
    const lastIndex = scheduleId.lastIndexOf('-');
    return parseInt(scheduleId.substring(lastIndex+1));
  }catch(error){
    console.log(`Error in getMatchInfoId. Schedule id was: ${scheduleId}`);
    return null;
  }
}


/* POST authorize */
router.post('/', async (req, res) => {
  try{
    res.setHeader('Content-Type', 'application/json');
    
    // Check for the specific server and get roles
    return res.end(
        JSON.stringify(
        { 
          res: true
         }
      )
    );
  }catch(error){
    return res.end(
      JSON.stringify(
        { res: false }
      )
    );
  }
});

module.exports = router;

