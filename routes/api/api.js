var express = require('express');
var router = express.Router();

var loggerRouter = require('./controls/logger.js');
var postsRouter = require('./controls/posts.js');
var usersRouter = require('./controls/users.js');

router.use('/logger', loggerRouter);
router.use('/posts', postsRouter);
router.use('/users', usersRouter);

module.exports = router;
