const User = require('../models/User');
const Follow = require('../models/Follow');
const Post = require('../models/Post');

const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');

const userSignup = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      birthMonth: req.body.birthMonth,
      birthDay: req.body.birthDay,
      birthYear: req.body.birthYear,
      username: req.body.username,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json(user);
  } catch (err) {
    return next(err);
  }
};

const isUserFollowing = async (userId, accountId) => {
  const followExists = await Follow.findOne({
    user: userId,
    follows: accountId,
  });
  return !!followExists;
};

const getRandomUsers = asyncHandler(async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(String(req.user.id));

  const randomUsers = await User.aggregate([
    { $match: { _id: { $ne: userId } } },
    { $sample: { size: 3 } },
    { $project: { _id: 1, name: 1, username: 1 } },
  ]);

  for (const user of randomUsers) {
    user.isFollowing = await isUserFollowing(userId, user._id);
  }

  return res.status(200).json(randomUsers);
});

const getUsers = asyncHandler(async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(String(req.user.id));

  const users = await User.find({
    _id: { $ne: userId },
  })
    .select('_id name username')
    .lean();

  for (const user of users) {
    user.isFollowing = await isUserFollowing(userId, user._id);
  }

  return res.status(200).json(users);
});

const followUser = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const accountId = req.params.accountId;

  const user = await User.findById(accountId);
  if (!user) {
    return res.status(404).json({
      message: 'The account you are trying to follow does not exist.',
    });
  }

  const follow = await Follow.findOne({ user: userId, follows: accountId });

  if (follow) {
    await follow.deleteOne({ _id: follow._id });
    return res.status(200).json({ isFollowing: false });
  } else {
    const newFollow = new Follow({
      user: userId,
      follows: accountId,
    });
    await newFollow.save();
    return res.status(201).json({ isFollowing: true });
  }
});

const getUserPosts = asyncHandler(async (req, res, next) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const posts = await Post.find({ user: user._id, parentPost: null })
    .populate('user', 'username name _id')
    .sort({ timeStamp: -1 });

  const postsWithCounts = posts.map((post) => ({
    ...post.toObject(),
    likesCount: post.likes.length,
    repostsCount: post.reposts.length,
    commentsCount: post.comments.length,
    isLiked: post.likes.includes(req.user.id),
    likes: undefined,
    reposts: undefined,
    comments: undefined,
  }));

  return res.status(200).json(postsWithCounts);
});

const getUserReplies = asyncHandler(async (req, res, next) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const replies = await Post.find({ user: user._id, parentPost: { $ne: null } })
    .populate('user', 'username name _id')
    .sort({ timeStamp: -1 });

  const repliesWithCounts = replies.map((post) => ({
    ...post.toObject(),
    likesCount: post.likes.length,
    repostsCount: post.reposts.length,
    commentsCount: post.comments.length,
    isLiked: post.likes.includes(req.user.id),
    likes: undefined,
    reposts: undefined,
    comments: undefined,
  }));

  return res.status(200).json(repliesWithCounts);
});

const getUserLikes = asyncHandler(async (req, res, next) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const likes = await Post.find({ likes: user._id })
    .populate('user', 'username name _id')
    .sort({ timeStamp: -1 });

  const likesWithCounts = likes.map((post) => ({
    ...post.toObject(),
    likesCount: post.likes.length,
    repostsCount: post.reposts.length,
    commentsCount: post.comments.length,
    isLiked: post.likes.includes(req.user.id),
    likes: undefined,
    reposts: undefined,
    comments: undefined,
  }));

  return res.status(200).json(likesWithCounts);
});

module.exports = {
  userSignup,
  getRandomUsers,
  getUsers,
  followUser,
  getUserLikes,
  getUserPosts,
  getUserReplies,
};
