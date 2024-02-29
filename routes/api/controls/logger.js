var express = require('express');
var request = require("request");
var router = express.Router();

const CLIENTID = "207eb06461054eab94d100efbecf4de2"
const SECRET = "919e6ea8a6f1479984af86d853a4c7b3"
const BASEURL = "https://platform.fatsecret.com/rest/server.api"
let token = ""
let expires = 0

// get new access token every day
getAccessToken()

// get the food information
router.get('/:foodName', function (req, res, next) {
  let foodName = req.params.foodName
  let response;

  let options = {
    method : 'POST',
    url: BASEURL + `?method=foods.search&search_expression=${foodName}&format=json`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
 };

 request(options, function (error, response, body) {
    if (error) throw new Error(error);
    response = body;
    console.log(response);
 });

  res.json({ info: response })
});

// get access token
function getAccessToken() {
  let options = {
    method : 'POST',
    url: 'https://oauth.fatsecret.com/connect/token',
    method : 'POST',
    auth : {
       user : CLIENTID,
       password : SECRET
    },
    headers: { 'content-type': 'application/x-www-form-urlencoded'},
    form: {
       'grant_type': 'client_credentials',
       'scope' : 'basic'
    },
    json: true
 };

 request(options, function (error, response, body) {
    if (error) throw new Error(error);
    token = body['access_token'];
    expires = (body['expires_in'] * 1000) - 10000;
 });
}

module.exports = router;
