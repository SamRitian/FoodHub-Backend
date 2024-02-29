var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

// import routes
var apiRouter = require('./routes/api/api.js');

// import models
var models = require('./models.js');


// create express app
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// mongodb middleware
app.use((req, res, next) => {
  req.models = models;
  next();
});

app.use('/api', apiRouter);

module.exports = app;
