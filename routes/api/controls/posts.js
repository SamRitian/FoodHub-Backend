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
          title: post.title,
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
    let { username, title, descr, recipeIds } = req.body;
    let newPost = new models.Post({
      username,
      title,
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

// like a post (query param: postId, username)

// unlike a post (query param: postId, username)

module.exports = router;
