const express = require('express');

const router = express.Router();


// @route   GET api/profile/test
// @decs    Test profile route
// @access  Public

router.get('/test', (req, res) => res.json({ msg: " profile is working"}));

module.exports = router;