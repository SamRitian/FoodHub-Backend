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
  //meal = meal name
  //foodItem = object of that food
  let { username, meal, foodItem } = req.body;

  if (username && meal && foodItem) {
    try {
      let data = await models.Logger.findOne({ username });

      if (data) {
        // update the existing row in Logger
        let mealIndex = data.meals.findIndex(m => m.name === meal);

        let updatingMeal = data.meals[mealIndex];

        if(updatingMeal) {
          updatingMeal.foods.push(foodItem);
          updatingMeal.totalCal += foodItem.calories;
        } else {
          data.meals.push({name: meal,
            foods: [foodItem],
            totalCal: foodItem.calories});
        }

        // Update total calories for the day
        data.totalCal += foodItem.calories;

        // Save the updated data document
        await data.save();

        res.json(data);
      } else {
        // If this is the first time the user add a food
        let newData = new models.Logger({
          username: username,
          meals: [{
            name: meal,
            foods: [foodItem],
            totalCal: foodItem.calories
          }],
          totalCal: foodItem.calories
        });

        // Save the new logger document
        await newData.save();

        res.json(newData);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(400).json({ message: "Missing required fields" });
  }
})

//remove a food from the db
router.post('/delete', async (req, res, next) => {
  let { username, meal, foodId } = req.body;

  if(username && meal && foodId) {
    try {
      let data = await models.Logger.findOne({ username });

      if(data){
        let mealIndex = data.meals.findIndex(m => m.name === meal);
        let mealToUpdate = data.meals[mealIndex];
        let foodIndex = mealToUpdate.foods.findIndex(f => f.foodId === foodId);

        if(foodIndex !== -1) {
          const removedFood = mealToUpdate.foods.splice(foodIndex, 1)[0];

          // Update total calories for the meal and the day
          mealToUpdate.totalCal -= removedFood.calories;
          data.totalCal -= removedFood.calories;

          await data.save();
          res.json(data);
        } else {
          res.json({message: "Food item doesn't exist"})
        }
      }else {
        res.status(400).json({ message: "No food to be deleted" });
      }
    }catch(err){
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  } else{
    res.status(400).json({ message: "Missing required fields" });
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
    let foodInfo = JSON.parse(body)
    console.log(foodInfo.foods.food)
    res.json({ info: foodInfo.foods.food })
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