const express = require('express');
const router = express.Router();

// Custom
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const jwt = require('jsonwebtoken');
const { match_GetExternalUser } = require('../utils/storedProcedures.js');

const ICLDiscordServerId = config.ICLServerId;

/* GET authorize */
router.get('/', (req, res) => {
  res.render('authorize', { title: 'When2Bloon - Authorize' });
});


/* POST authorize */
router.post('/', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');

    // Check for user info

    const { accessToken, tokenType, expiresIn } = req.body;

    const userData = await bloonUtils.discordApiRequest('users/@me', tokenType, accessToken);
    if (userData === null) {
      return res.end(bloonUtils.match_createJsonResError("Couldn't get your discord profile information."));
    }

    // Load all servers
    const userServers = await bloonUtils.discordApiRequest('users/@me/guilds', tokenType, accessToken);
    if (userServers === null) {
      return res.end(bloonUtils.match_createJsonResError("There was a problem getting your server list from Discord."));
    }

    let discordServerProfile;
    // Check if user in the ICL server
    if (!userServers.some(x => x.id === ICLDiscordServerId)) {

      // Check on external user database table
      const externalUser = await match_GetExternalUser(userData.id);

      // If user doesn't exists in external database, sorry.
      if (externalUser == null || externalUser.length == 0){
        // Create self-signed JWT token used in the external request page
        const externalUserData = jwt.sign({
          id: userData.id,
          name: userData.global_name,
          avatar: userData.avatar ?? 'NULL',
          username: userData.username,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (expiresIn * 60),
          isExternal: true
        }, config.oAuthTokenSecret);

        // Set cookies!
        const cookieOptions = {
          SameSite: "Strict", // Only on the same site
          httpOnly: true, // The cookie only accessible by the web server
          Secure: true
        }

        res.cookie('externalUserData', externalUserData, cookieOptions);

        return res.end(bloonUtils.match_createJsonResError(`Sorry ${userData.global_name}, you don't appear to be in the Superboss' Discord server.<br/>To ask for an exclusion fill <a href="/jointeam">this form.</a>`));
      }

      if (externalUser[0].UserDiscordTeamRoleId == null || externalUser[0].UserDiscordTeamRoleId.length == 0){
        return res.end(bloonUtils.match_createJsonResError(`Sorry ${userData.global_name}, There are no roles in the ICL server associated to your account.`));
      }

      console.log(`External user (${userData.id}) login in with data:\nName: ${externalUser[0].UserDiscordName}\nRoles: ${externalUser[0].UserDiscordTeamRoleId}`);

      discordServerProfile = {
        nick: externalUser[0].UserDiscordName,
        roles: [externalUser[0].UserDiscordTeamRoleId]
      };

    }else{
      // Get info from the ICL server
      discordServerProfile = await bloonUtils.discordApiRequest(`users/@me/guilds/${ICLDiscordServerId}/member`, tokenType, accessToken);
      if (discordServerProfile === null || discordServerProfile.code === 0) {
        return res.end(bloonUtils.match_createJsonResError(`Sorry ${userData.global_name}, You're in the ICL server, but I can get your information right now.`));
      }
    }

    // At this point, all was ok, so it's time to delete the external user data used for the form if it exists.
    res.clearCookie("externalUserData");

    // Create self-signed JWT token to save in localStorage
    const signedJwt = jwt.sign({
      id: userData.id,
      name: discordServerProfile.nick || userData.global_name,
      avatar: userData.avatar ?? 'NULL',
      roles: discordServerProfile.roles,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (expiresIn * 60),
    }, config.oAuthTokenSecret);

    // Set cookies!
    const cookieOptions = {
      SameSite: "Strict", // Only on the same site
      httpOnly: true, // The cookie only accessible by the web server
      Secure: true
    }

    res.cookie('jwt', signedJwt, cookieOptions);

    // Check if it has the hidden manager or league official role.
    let leagueOfficial = false;
    if (discordServerProfile.roles.some(x => x == config.role_HiddenManager || x == config.role_LeagueOfficial)) {
      leagueOfficial = true;
    }

    // Check for the specific server and get roles
    return res.end(
      JSON.stringify(
        {
          name: discordServerProfile.nick || userData.global_name,
          leagueOfficial: leagueOfficial,
          res: true
        }
      )
    );
  } catch (error) {
    return res.end(bloonUtils.match_createJsonResError(error));
  }
});

/**
 * Basically creates the same token but with no LeagueOfficial/Hidden Manager role.
 */
router.post('/noLeagueOfficial/', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  try {

    // Verify JWT token in cookies
    const jwtToken = req.cookies["jwt"];

    if (jwtToken == undefined || jwtToken == null) {
      // Clear process cookies
      return res.end(bloonUtils.match_createJsonResError("Couldn't identify your session"));
    }

    const tokenContent = jwt.verify(jwtToken, config.oAuthTokenSecret);

    res.clearCookie('jwt');

    // Create self-signed JWT token and remove hidden manager and league official.
    const signedJwt = jwt.sign({
      id: tokenContent.id,
      name: tokenContent.name,
      avatar: tokenContent.avatar,
      roles: tokenContent.roles.filter(x => x !== config.role_HiddenManager && x !== config.role_LeagueOfficial),
      iat: tokenContent.iat,
      exp: tokenContent.exp
    }, config.oAuthTokenSecret);

    // Set cookies!
    const cookieOptions = {
      SameSite: "Strict", // Only on the same site
      httpOnly: true, // The cookie only accessible by the web server
      Secure: true
    }

    res.cookie('jwt', signedJwt, cookieOptions);

    return res.end(
      JSON.stringify(
        { res: true }
      )
    );
  } catch (error) {
    return res.end(bloonUtils.match_createJsonResError(error));
  }

});

/**
 * Deletes cookies and sends to home page.
 */
router.delete('/', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.clearCookie('jwt');
    res.clearCookie('externalUserData');

    return res.end(
      JSON.stringify(
        { res: true }
      )
    );
  } catch (error) {
    return res.end(bloonUtils.match_createJsonResError(error));
  }
})

module.exports = router;