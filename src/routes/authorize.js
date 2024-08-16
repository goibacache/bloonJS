const express = require('express');
const router = express.Router();

// Custom
const bloonUtils = require('../utils/utils.js');
const config = bloonUtils.getConfig();
const jwt = require('jsonwebtoken');

const ICLDiscordServerId = config.ICLServerId;

/* GET authorize */
router.get('/', (req, res) => {
  res.render('authorize', { title: 'Bloon JS - Authorize' });
});


/* POST authorize */
router.post('/', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');

    // Check for user info

    const { accessToken, tokenType, expiresIn } = req.body;

    const userData = await bloonUtils.discordApiRequest('users/@me', tokenType, accessToken);
    if (userData === null) {
      return { res: false, msg: `Couldn't get your discord profile information.` }
    }

    const userServers = await bloonUtils.discordApiRequest('users/@me/guilds', tokenType, accessToken);
    if (userServers === null) {
      return { res: false, msg: `There was a problem getting your server list from Discord.` }
    }

    // Check if user in superboss'
    if (!userServers.some(x => x.id === ICLDiscordServerId)) {
      return { res: false, msg: `Sorry ${userData.global_name}, you don't appear to be in the Superboss' Discord server. To ask for an exclusion contact @Xixo.` }
    }

    // Check for servers and see if superboss' is one of them
    const discordServerProfile = await bloonUtils.discordApiRequest(`users/@me/guilds/${ICLDiscordServerId}/member`, tokenType, accessToken);
    if (discordServerProfile === null) {
      return { res: false, msg: `There was a problem getting your profile from the Superboss' server.` }
    }

    // Create self-signed JWT token to save in localStorage
    const signedJwt = jwt.sign({
      id: userData.id,
      name: discordServerProfile.nick || userData.global_name,
      avatar: userData.avatar,
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
          name: userData.global_name,
          leagueOfficial: leagueOfficial,
          res: true
        }
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
      return { res: false, msg: `Couldn't find token.` };
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
    return res.end(
      JSON.stringify(
        { res: false, msg: error }
      )
    );
  }

});

/**
 * Deletes cookies and sends to home page.
 */
router.delete('/', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.clearCookie('jwt');

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
})

module.exports = router;