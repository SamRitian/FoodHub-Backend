var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.json({ message: 'Welcome to the logger page' })
});

module.exports = router;
