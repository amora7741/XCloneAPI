const User = require('../models/User');
const Follow = require('../models/Follow');

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

const getRandomUsers = asyncHandler(async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(String(req.user.id));

  const randomUsers = await User.aggregate([
    { $match: { _id: { $ne: userId } } },
    { $sample: { size: 3 } },
    {
      $lookup: {
        from: 'follows',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$user', userId] },
                  { $eq: ['$follows', '$$userId'] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              isFollowing: {
                $cond: {
                  if: { $gt: ['$follows', null] },
                  then: true,
                  else: false,
                },
              },
            },
          },
        ],
        as: 'followingInfo',
      },
    },
    {
      $addFields: {
        isFollowing: { $arrayElemAt: ['$followingInfo.isFollowing', 0] },
      },
    },
    {
      $project: { _id: 1, name: 1, username: 1, isFollowing: 1 },
    },
  ]);

  return res.status(200).json(randomUsers);
});

const getUsers = asyncHandler(async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(String(req.user.id));

  const users = await User.aggregate([
    { $match: { _id: { $ne: userId } } },
    {
      $lookup: {
        from: 'follows',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$user', userId] },
                  { $eq: ['$follows', '$$userId'] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              isFollowing: {
                $cond: {
                  if: { $gt: ['$follows', null] },
                  then: true,
                  else: false,
                },
              },
            },
          },
        ],
        as: 'followingInfo',
      },
    },
    {
      $addFields: {
        isFollowing: { $arrayElemAt: ['$followingInfo.isFollowing', 0] },
      },
    },
    {
      $project: { _id: 1, name: 1, username: 1, isFollowing: 1 },
    },
  ]);

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

module.exports = { userSignup, getRandomUsers, getUsers, followUser };
