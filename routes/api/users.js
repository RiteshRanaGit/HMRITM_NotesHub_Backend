const express = require('express');
const router = express.Router();


// @route   GET api/user/test
// @decs    Test user route
// @access  Public


router.get('/test', (req, res) => res.json({ msg: " user is working"}));

module.exports = router;