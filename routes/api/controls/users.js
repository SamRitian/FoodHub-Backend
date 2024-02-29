var express = require('express');
var router = express.Router();

var models = require('../../../models.js')

router.get('/', function (req, res, next) {
  res.json({ message: 'Users API' })
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user exists
    const user = await models.User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Check if password is correct
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Login successful, return user data
    const userData = {
      username: user.username,
      dob: user.dob,
      height: user.height,
      weight: user.weight,
      healthGoal: user.healthGoal,
      activityLevel: user.activityLevel
    };
    return res.json({ message: "Login successful", user: userData });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
