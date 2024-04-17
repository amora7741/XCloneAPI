const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

require('dotenv').config();

const login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: info ? info.message : 'Login failed',
      });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      const cookieOptions = {
        httpOnly: true,
        maxAge: 3600000,
      };

      res.cookie('jwt', token, cookieOptions);
      res.cookie('cookieExists', 1, { maxAge: 3600000 });
      return res.json({
        success: true,
        token: token,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
        },
      });
    });
  })(req, res, next);
};

const logout = (req, res, next) => {
  res.clearCookie('jwt');
  res.clearCookie('cookieExists');
  return res.json({ success: true, message: 'You have been logged out.' });
};

const validate = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
      },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { login, logout, validate };
