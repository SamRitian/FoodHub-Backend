const mongoose = require('mongoose');

let models = {};

main().catch(err => console.log(err));

async function main() {
  console.log('Connecting to database...');
  await mongoose.connect(`mongodb+srv://xyou:${process.env.MONGO_PW}@atlascluster.r2vxoaz.mongodb.net/foodhub`);
  console.log('Success!');

  const PostSchema = new mongoose.Schema({
    username: String,
    title: String,
    calories: Number,
    descr: String,
    date: { type: Date, default: Date.now },
    recipeIds: [String],
    likes: [String] // array of usernames
  })

  const CommentSchema = new mongoose.Schema({
    username: String,
    comment: String,
    date: { type: Date, default: Date.now },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
  })

  const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    dob: Date,
    height: Number,
    weight: Number,
    healthGoal: String, // could be from: [Weight Loss, Muscle Gain, Maintaining Weight]
    activityLevel: String // could be from: [Sedentary, Lightly Active, Moderately Active, Very Active]
  });

  const LoggerSchema = new mongoose.Schema({
    username: String,
    date: { type: Date, default: Date.now },
    foodIds: [String], // array of foodIds
    totalCal: Number,
    calPerMeal: { type: Object, default: { "breakfast": 0, "lunch": 0, "snack": 0, "dinner": 0 } }
  })

  models.Post = mongoose.model('Post', PostSchema);
  models.Comment = mongoose.model('Comment', CommentSchema);
  models.User = mongoose.model('User', UserSchema);
  models.Logger = mongoose.model('Logger', LoggerSchema);

  console.log('Models created');
}

module.exports = models;