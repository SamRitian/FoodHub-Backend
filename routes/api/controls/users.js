var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.json({ message: 'Welcome to the users page' })
});

module.exports = router;
