const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const User = require('../models/User');
const Follow = require('../models/Follow');

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
  const posts = await Post.find({ parentPost: null })
    .populate('user', 'username name _id')
    .sort({ timeStamp: -1 });

  const userFollows = await Follow.find({ user: req.user.id }).lean();

  const userFollowsSet = new Set(
    userFollows.map((follow) => follow.follows.toString())
  );

  const postsWithCounts = posts.map((post) => {
    const isFromFollowing = userFollowsSet.has(post.user._id.toString());

    return {
      ...post.toObject(),
      likesCount: post.likes.length,
      repostsCount: post.reposts.length,
      commentsCount: post.comments.length,
      isLiked: post.likes.includes(req.user.id),
      isFromFollowing,
      likes: undefined,
      reposts: undefined,
      comments: undefined,
    };
  });

  return res.status(200).json(postsWithCounts);
});

const getPost = asyncHandler(async (req, res, next) => {
  const { postId, username } = req.params;

  const user = await User.findOne({ username: username });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const post = await Post.findOne({
    _id: postId,
    user: user._id,
  }).populate('user', 'username name _id');

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const postWithLikeInfo = {
    ...post.toObject(),
    likesCount: post.likes.length,
    repostsCount: post.reposts.length,
    isLiked: post.likes.includes(req.user.id),
    likes: undefined,
    reposts: undefined,
  };

  return res.status(200).json(postWithLikeInfo);
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

const getComments = asyncHandler(async (req, res, next) => {
  const { commentIds } = req.body;

  if (!Array.isArray(commentIds) || commentIds.length === 0) {
    return res
      .status(400)
      .json({ message: 'Invalid or empty comment IDs array' });
  }

  const comments = await Post.find({
    _id: { $in: commentIds },
  })
    .populate('user', 'username name _id')
    .sort({ timeStamp: -1 });

  if (!comments || comments.length === 0) {
    return res.status(404).json({ message: 'No comments found' });
  }

  const formattedComments = comments.map((comment) => ({
    ...comment.toObject(),
    likesCount: comment.likes.length,
    repostsCount: comment.reposts.length,
    commentsCount: comment.comments.length,
    isLiked: comment.likes.includes(req.user.id),
    likes: undefined,
    reposts: undefined,
    comments: undefined,
  }));

  return res.status(200).json(formattedComments);
});

const createComment = [
  body('comment_text')
    .isLength({ min: 1, max: 100 })
    .withMessage('Post must be between 1 and 100 characters.')
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { postId, username } = req.params;

    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const parentPost = await Post.findOne({
      _id: postId,
      user: user._id,
    });

    if (!parentPost) {
      return res.status(404).json({ message: 'Parent post not found' });
    }

    const post = new Post({
      text: req.body.comment_text,
      user: req.user.id,
      parentPost: parentPost ? parentPost._id : null,
      timeStamp: Date.now(),
    });

    await post.save();

    if (parentPost) {
      parentPost.comments.push(post._id);
      await parentPost.save();
    }

    const populatedPost = await Post.findOne({
      _id: post._id,
      user: req.user.id,
    }).populate('user', 'username name _id');

    if (!populatedPost) {
      return res.status(404).json({ message: 'Created comment not found' });
    }

    const formattedReply = {
      ...populatedPost.toObject(),
      likesCount: populatedPost.likes.length,
      repostsCount: populatedPost.reposts.length,
      commentsCount: populatedPost.comments.length,
      isLiked: populatedPost.likes.includes(req.user.id),
      likes: undefined,
      reposts: undefined,
      comments: undefined,
    };

    return res.status(201).json(formattedReply);
  }),
];

module.exports = {
  createPost,
  getAllPosts,
  getPost,
  likePost,
  getComments,
  createComment,
};
