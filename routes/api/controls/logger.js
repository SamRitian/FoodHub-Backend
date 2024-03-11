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
  let username = req.query.username

  if(username){
    let data = await models.Logger.findOne({ username });

    if(data){
      res.json(data);
    } else {
      res.status(401).json({ message: "No food item yet" });
    }
  } else {
    res.status(401).json({ message: "Missing required username" });
  }
})

// add food to the db
router.post('/', async (req, res, next) => {
  let {username, foodId, meal, calories, servingSize, nutrition} = req.body

  if(username && foodId && meal && calories && servingSize && nutrition) {
    try {
      let data = await models.Logger.findOne({ username });
      let result = {}

      let newFood = {}
        newFood[foodId] = {
          "serving": [servingSize, calories],
          "protein": nutrition[0],
          "carbs": nutrition[1],
          "fat": nutrition[2]
        };

      if(data) {
        let foods = data.foodItems;
        foods.push(newFood);

        let chosenMeal = data.calPerMeal[meal].foods;
        console.log(data.calPerMeal)
        chosenMeal.push(foodId);

        let update = {
          foodItems: foods,
          totalCal: data.totalCal + calories,
          calPerMeal: {
            ...data.calPerMeal,
            [meal]: {
              total: data.calPerMeal[meal].total + calories,
              foods: chosenMeal
            }
          }
        };

        let updateItem = await models.Logger.findOneAndUpdate({username: username}, update, { new: true })

        result = updateItem

      } else {
        let perMeal = {
          breakfast: { total: 0, foods: [] },
          lunch: { total: 0, foods: [] },
          snack: { total: 0, foods: [] },
          dinner: { total: 0, foods: [] }
        };

        perMeal[meal].total += calories;
        perMeal[meal].foods = [foodId];

        let newItem = new models.Logger({
          username: username,
          foodItems: newFood,
          totalCal: calories,
          calPerMeal: perMeal
        });

        let added = await newItem.save();
        result = added
      }

      res.json(result);
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

//remove a food from the db
router.post('/delete', async (req, res, next) => {
  let {username, foodName} = req.body

  if(username && foodName) {
    try {
      let data = await models.Logger.findOne({ username });

      if(data){
        let foods = data.foodItems;
        let updatedList = foods.filter(item => {
          return !(foodName in item)
        });

        let update = {
          foodItems: updatedList,
          totalCal: data.totalCal - data.foodItems[foodName].serving[1]
        }

        let updateItem = await models.Logger.findOneAndUpdate({username: username}, update, { new: true })
        res.json(updateItem)
      }else{
        res.status(401).json({ message: "There is no food added" });
      }
    } catch(err){
      console.error(err);
    }
  } else {
    if(!username) {
      res.status(401).json({ message: "Missing required username" });
    }

    if(!foodId) {
      res.status(401).json({ message: "Please choose a food item to be deleted" });
    }
  }
})

// get the food name + basic info (for searching) from fatSecret
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
    res.json({ info: body.foods.food })
  });
});

// return detailed info when clicked on a food name
router.get('/foodInfo/:id', (req, res, next) => {
  let info = getFoodInfo(req.params.id);
  res.json(info);
})

// get food info from fatSecret
function getFoodInfo(id) {
  let items = []

  let options = {
    method : 'POST',
    url: BASEURL + `?method=food.get.v3&food_id=${id}&format=json`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  let promise = new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        body = JSON.parse(body);
        let foodInfo = {
          "foodId": body.food["food_id"],
          "name": body.food["food_name"],
          "type": body.food["food_type"],
          "attributes": body.food["food_attributes"],
          "servings": body.food["servings"]
        };
        resolve({
          "username": username,
          "totalCal": data.totalCal,
          "calPerMeal": data.calPerMeal,
          "foodInfo": foodInfo
        });
      }
    });
    items.push(promise);
  });

  Promise.all(items)
    .then(result => {
      let responseData = {};
      result.forEach((item, index) => {
        responseData[food[index]] = item;
      });
      res.json(responseData);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    });

  return items;
}

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

    setTimeout(getAccessToken, 24 * 60 * 60 * 1000);
 });
}

module.exports = router;