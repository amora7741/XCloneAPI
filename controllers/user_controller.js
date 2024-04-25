const User = require('../models/User');

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
    { $project: { _id: 1, name: 1, username: 1 } },
  ]);

  return res.status(200).json(randomUsers);
});

const getUsers = asyncHandler(async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(String(req.user.id));

  const users = await User.find({ _id: { $ne: userId } }).select(
    '_id name username'
  );

  return res.status(200).json(users);
});

module.exports = { userSignup, getRandomUsers, getUsers };
