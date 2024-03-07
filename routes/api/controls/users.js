var express = require('express');
var router = express.Router();

var models = require('../../../models.js')

router.get('/', function (req, res, next) {
  res.json({ message: 'Users API' })
});

const mongoose = require('mongoose');

    const uri = 'mongodb+srv://xyou:rbyt9jTc8dOP6ZH1@atlascluster.r2vxoaz.mongodb.net/'; // Replace with your MongoDB connection string

    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => console.log('Connected to MongoDB database'))
    .catch(error => console.error('Error connecting to MongoDB:', error));


const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: Date },
  height: { type: Number },
  weight: { type: Number },
  healthGoal: { type: String },
  activityLevel: { type: String }
});

const User = mongoose.model('User', UserSchema);

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
