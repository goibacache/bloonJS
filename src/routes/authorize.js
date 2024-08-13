const express = require('express');
const router = express.Router();

// Custom
const bloonUtils 	= require('../utils/utils.js');
const config 		= bloonUtils.getConfig();
const jwt = require('jsonwebtoken');

const ICLDiscordServerId = config.ICLServerId;

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

/* GET authorize */
router.get('/', (req, res) => {
  res.render('authorize', { title: 'Bloon JS - Authorize' });
});


/* POST authorize */
router.post('/', async (req, res) => {
  try{
    res.setHeader('Content-Type', 'application/json');

    // Check for user info

    const {accessToken, tokenType, expiresIn } = req.body;

    const userData = await discordApiRequest('users/@me', tokenType, accessToken);
    if (userData === null){
        return { res: false, msg: `Couldn't get your discord profile information.` }
    }

    const userServers = await discordApiRequest('users/@me/guilds', tokenType, accessToken);
    if (userServers === null){
        return { res: false, msg: `There was a problem getting your server list from Discord.` }
    }

    // Check if user in superboss'
    if (!userServers.some(x => x.id === ICLDiscordServerId)){
        return { res: false, msg: `Sorry ${userData.global_name}, you don't appear to be in the Superboss' Discord server. To ask for an exclusion contact @Xixo.` }
    }

    // Check for servers and see if superboss' is one of them
    const superbossProfile = await discordApiRequest(`users/@me/guilds/${ICLDiscordServerId}/member`, tokenType, accessToken);
    if (superbossProfile === null){
        return { res: false, msg: `There was a problem getting your profile from the Superboss' server.` }
    }

    // Create self-signed JWT token to save in localStorage
    const signedJwt = jwt.sign({
      id: userData.id,
      avatar: userData.avatar,
      name: superbossProfile.nick || userData.global_name,
      roles: superbossProfile.roles,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (expiresIn * 60),
    }, config.oAuthTokenSecret );

    // Set cookies!
    const cookieOptions = {
      SameSite: "none", // Only on the same site
      httpOnly: true, // The cookie only accessible by the web server
      Secure: true
    }

    res.cookie('jwt', signedJwt, cookieOptions);
    res.cookie('name', userData.global_name, cookieOptions);
    res.cookie('avatar', userData.avatar, cookieOptions);

    // Check for the specific server and get roles
    return res.end(
        JSON.stringify(
        { 
          name: userData.global_name,
          res: true
         }
      )
    );
  }catch(error){
    return res.end(
      JSON.stringify(
        { res: false, msg: error }
      )
    );
  }
});

module.exports = router;

