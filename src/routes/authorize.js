const express = require('express');
const router = express.Router();

// Custom
const bloonUtils 	= require('../utils/utils.js');
const config 		= bloonUtils.getConfig();
const jwt = require('jsonwebtoken');

// const path = require('path');

const superbossDiscordServerId = "103933666417217536";

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
    // await changeStatus('Checking discord user info...');

    // Check for user info

    const {accessToken, tokenType, expiresIn } = req.body;

    const userData = await discordApiRequest('users/@me', tokenType, accessToken);
    if (userData === null){
        return { res: false, msg: `Couldn't get your discord profile information.` }
    }

    // await changeStatus(`Welcome ${userData.global_name}, checking your servers...`);
    const userServers = await discordApiRequest('users/@me/guilds', tokenType, accessToken);
    if (userServers === null){
        return { res: false, msg: `There was a problem getting your server list from Discord.` }
    }

    // Check if user in superboss'
    if (!userServers.some(x => x.id === superbossDiscordServerId)){
        return { res: false, msg: `Sorry ${userData.global_name}, you don't appear to be in the Superboss' Discord server. To ask for an exclusion contact @Xixo.` }
    }

    // Check for servers and see if superboss' is one of them
    const superbossProfile = await discordApiRequest(`users/@me/guilds/${superbossDiscordServerId}/member`, tokenType, accessToken);
    if (superbossProfile === null){
        return { res: false, msg: `There was a problem getting your profile from the Superboss' server.` }
    }

    // Create TOKEN in JWT
    //userData.avatar;
    //userData.global_name;
    //superbossProfile.roles;
    // const date = new Date();
    // const expirationDate = date.setSeconds(date.getSeconds() + expiresIn);

    // Create self-signed JWT token to save in localStorage
    const signedJwt = jwt.sign({
      avatar: userData.avatar,
      name: userData.global_name,
      roles: superbossProfile.roles,
    }, config.oAuthTokenSecret, { expiresIn: expiresIn });

    // Check for the specific server and get roles
    return res.end(
        JSON.stringify(
        { 
          res: true,
          name: userData.global_name,
          avatar: userData.avatar,
          roles: superbossProfile.roles,
          jwt: signedJwt
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

