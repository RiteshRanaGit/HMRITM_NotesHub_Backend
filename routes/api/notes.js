const express = require('express');

const router = express.Router();

// @route   GET api/notes/test
// @decs    Test notes route
// @access  Public

router.get('/test', (req, res) => res.json({ msg: " notes is working"}));

module.exports = router;