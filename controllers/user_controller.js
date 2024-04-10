const User = require('../models/User');

const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const passport = require('passport');

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

module.exports = { userSignup };
