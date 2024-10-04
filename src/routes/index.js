// required
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Custom
const bloonUtils 	= require('../utils/utils.js');
const config 		= bloonUtils.getConfig();

/* GET home page. */
router.get('/', (req, res) => {

  // Check if user have token in cookies
  const jwtToken = req.cookies["jwt"];

  // Check if token is valid, if it is, it's logged, send him to scheduleList
  if (jwtToken != undefined && jwtToken != null){
    try{
      const tokenContent = jwt.verify(jwtToken, config.oAuthTokenSecret);
      if (tokenContent.isExternal){
        throw "External user in internal context.";
      }
      return res.redirect('/scheduleList');
    }catch(error){
      res.clearCookie('jwt');
    }
  }

  const oAutClientId = config.oAutClientId
  const oAuthReturnUrl = config.oAuthReturnUrl

  res.render('index', { title: 'When2Bloon', oAutClientId: oAutClientId, oAuthReturnUrl: oAuthReturnUrl });
});


module.exports = router;