const mongoose = require('mongoose');

let models = {};

main().catch(err => console.log(err));

async function main() {
  console.log('Connecting to database...');
  await mongoose.connect(`mongodb+srv://xyou:rbyt9jTc8dOP6ZH1@atlascluster.r2vxoaz.mongodb.net/foodhub`);
  console.log('Success!');

  const PostSchema = new mongoose.Schema({
    title: String,
    descr: String,
    date: new Date(),
    recipeId: String,
    likes: [String] // array of usernames
  })

  const CommentSchema = new mongoose.Schema({
    username: String,
    comment: String,
    date: new Date(),
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
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
    date: new Date(),
    foodId: [String] // array of foodIds
  })

  models.Post = mongoose.model('Post', PostSchema);
  models.Comment = mongoose.model('Comment', CommentSchema);
  models.User = mongoose.model('User', UserSchema);
  models.Logger = mongoose.model('Logger', LoggerSchema);

  console.log('Models created');
}

module.exports = models;