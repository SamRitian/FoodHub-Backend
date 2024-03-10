var express = require('express');
var router = express.Router();

var models = require('../../../models.js');

// get all posts
router.get('/', async (req, res) => {
  try {
    // get posts from the database
    let posts = await models.Post.find();
    let postData = await Promise.all(
      posts.map(async post => {
        return {
          id: post._id,
          username: post.username,
          title: post.title,
          calories: post.calories,
          descr: post.descr,
          date: post.date,
          recipeIds: post.recipeIds,
          likes: post.likes
        };
      })
    );
    res.json(postData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*
  create a new post
  expects:
  {
    username: String,
    title: String,
    descr: String,
    recipeIds: [String]
    date: (auto-generated)
    likes: (empty array, auto-generated)
  }
*/
router.post('/', async (req, res) => {
  try {
    let { username, title, calories, descr, recipeIds } = req.body;
    let newPost = new models.Post({
      username,
      title,
      calories,
      descr,
      recipeIds
    })
    await newPost.save();
    res.send({ status: 'success', message: 'Post created' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get all comments for a post (query param: postId)
router.get('/comments', async (req, res) => {
  try {
    let { postId } = req.query;
    let comments = await models.Comment.find({ postId: postId });
    let commentData = await Promise.all(
      comments.map(async comment => {
        return {
          id: comment._id,
          username: comment.username,
          comment: comment.comment,
          date: comment.date,
          post: comment.post
        }
      })
    )
    res.json(commentData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*
  create a new comment
  expects:
  {
    username: String,
    comment: String,
    postId: ObjectId
    date: (auto-generated)
  }
*/
router.post('/comment', async (req, res) => {
  try {
    let { username, comment, postId } = req.body;
    let newComment = new models.Comment({
      username,
      comment,
      postId
    });
    await newComment.save();
    res.send({ status: 'success', message: 'Comment created' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*
  like a post
  expects: {
    username: String,
    postId: ObjectId
  }
*/
router.post('/like', async (req, res) => {
  try {
    let { username, postId } = req.body;
    let post = await models.Post.findById(postId);

    // add username to the likes array if it is not there yet
    if (!post.likes.includes(username)) {
      post.likes.push(username);
      await post.save();
    }
    res.send({ status: 'success', message: 'Liked the post' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*
  unlike a post
  expects: {
    username: String,
    postId: ObjectId
  }
*/
router.post('/unlike', async (req, res) => {
  try {
    let { username, postId } = req.body;
    let post = await models.Post.findById(postId);

    // delete username from the likes array if it is there
    if (post.likes.includes(username)) {
      post.likes = post.likes.filter(username => username !== username);
      await post.save();
    }
    res.send({ status: 'success', message: 'Unliked the post' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
