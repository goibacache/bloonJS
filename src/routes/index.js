// required
const express = require('express');
const router = express.Router();

// Custom
const bloonUtils 	= require('../utils/utils.js');
const config 		= bloonUtils.getConfig();

/* GET home page. */
router.get('/', (req, res) => {
  const oAutClientId = config.oAutClientId
  const oAuthReturnUrl = config.oAuthReturnUrl

  res.render('index', { title: 'Bloon JS', oAutClientId: oAutClientId, oAuthReturnUrl: oAuthReturnUrl });
});


module.exports = router;