const express = require('express');
const router = express.Router();

// Custom
const bloonUtils 	= require('../utils/utils.js');
const config 		= bloonUtils.getConfig();
const jwt = require('jsonwebtoken');

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

/* GET schedule */
router.get('/:scheduleId', (req, res) => {

  // Verify JWT token in cookies
  const jwtToken = req.cookies["jwt"];

  if (jwtToken == undefined || jwtToken == null){
    res.render('schedule', { title: 'Bloon JS - Schedule', timeSlots: null, clearCookies: true });
    return;
  }

  // Verify token & get contents
  let tokenContent;
  try{
    tokenContent = jwt.verify(jwtToken, config.oAuthTokenSecret);
  }catch(error){
    res.render('schedule', { title: 'Bloon JS - Schedule', error: 'Wrong token, please log-in again' });
    return;
  }

  // Verify JWT token is not expired

  const scheduleId = req.params["scheduleId"];
  res.render('schedule', { 
    title: 'Bloon JS - Authorize', 
    teams: [
      { 
        id: "598636664432099331",
        name: "RS",
        fullName: "RavenShield"
      },
      { 
        id: "1177079316077621258",
        name: "OWL",
        fullName: "Owl"
      }
    ],
    days: ["05/08/2024", "06/08/2024", "07/08/2024", "08/08/2024"], 
    schedules: [
      {
        team: '598636664432099331', // RS
        name: 'Xixo',
        discordId: "171450453068873729",
        times: [
          "2024/08/05 15:30:00",
          "2024/08/05 15:45:00",
          "2024/08/05 16:00:00",
        ]
      },
      {
        team: '598636664432099331', // RS
        name: 'Spooky',
        discordId: "202620317577904128",
        times: [
          "2024/08/06 08:00:00",
          "2024/08/06 09:45:00",
          "2024/08/06 19:00:00",
        ]
      }
    ] 
  });
});


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

