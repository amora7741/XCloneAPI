const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');

const createPost = [
  body('post_text')
    .isLength({ min: 1, max: 100 })
    .withMessage('Post must be between 1 and 100 characters.')
    .escape(),

  asyncHandler(async (req, res, next) => {
    console.log(req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = new Post({
      text: req.body.post_text,
      user: req.user.id,
      timeStamp: Date.now(),
    });

    await post.save();

    return res.status(201).json(post);
  }),
];

const getAllPosts = asyncHandler(async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username name _id')
      .sort({ timeStamp: -1 });
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = { createPost, getAllPosts };
