var express = require('express');
var request = require("request");
var router = express.Router();
var models = require('../../../models.js')

const CLIENTID = "207eb06461054eab94d100efbecf4de2"
const SECRET = "919e6ea8a6f1479984af86d853a4c7b3"
const BASEURL = "https://platform.fatsecret.com/rest/server.api"
let token = ""
let expires = 0

// get new access token
getAccessToken()

// get the food info from the db
router.get('/', async (req, res, next) => {
  let username = req.body.username

  if(username){
    try {
      let data = await models.Logger.findOne({ username });

      if(data){
        let food = data.foodIds

        for(let i = 0; i < food.length; i++) {
          let options = {
            method : 'POST',
            url: BASEURL + `?method=food.get.v3&food_id=${food[i]}&format=json`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }

          request(options, function (error, response, body) {
            if (error) throw new Error(error);
            console.log(body)
            res.json({ foodInfo: body })
          });
        }
      } else {
        res.status(401).json({ message: "No food item yet" });
      }
    }catch(err){
      console.error(err);
    }
  } else {
    res.status(401).json({ message: "Missing required username" });
  }
})

// add food to the db
router.post('/', async (req, res, next) => {
  let {username, foodId} = req.body

  if(username && foodId) {
    try {
      let data = await models.Logger.findOne({ username });

      if(data) {
        let foodList = data.foodIds
        let newFoodItem = new models.Logger({
          username: username,
          foodIds: [...foodList, foodId]
        });

        await newFoodItem.save();
      } else {
        let newItem = new models.Logger({
          username: username,
          foodIds: [foodId]
        });

        await newItem.save();
      }

      res.json({status: 'success'});
    }catch(err){
      console.error(err);
    }
  } else {
    if(!username) {
      res.status(401).json({ message: "Missing required username" });
    }

    if(!foodId) {
      res.status(401).json({ message: "Please choose a food item to be added" });
    }
  }
})

// get the food information (for searching) from fatSecret
router.get('/search/:foodName', function (req, res, next) {
  let foodName = req.params.foodName

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
    console.log(body)
    res.json({ info: response })
  });
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
