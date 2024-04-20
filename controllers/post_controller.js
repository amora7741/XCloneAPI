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

    const populatedPost = await Post.findById(post._id).populate(
      'user',
      'username name _id'
    );

    return res.status(201).json(populatedPost);
  }),
];

const getAllPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find()
    .populate('user', 'username name _id')
    .sort({ timeStamp: -1 });

  return res.status(200).json(posts);
});

const likePost = asyncHandler(async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user.id;

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const isLiked = post.likes.includes(userId);

  if (isLiked) {
    await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    );
  } else {
    await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } },
      { new: true }
    );
  }

  return res.status(200).json({
    liked: !isLiked,
  });
});

module.exports = { createPost, getAllPosts, likePost };
