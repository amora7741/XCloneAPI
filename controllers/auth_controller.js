const passport = require('passport');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1h';

const login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: info ? info.message : 'Login failed',
        user: user,
      });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      const cookieOptions = {
        httpOnly: true,
        secure: true,
      };

      res.cookie('jwt', token, cookieOptions);
      return res.json({ success: true, token: token });
    });
  })(req, res, next);
};

const logout = (req, res, next) => {
  // Clear the JWT cookie
  res.clearCookie('jwt');
  return res.json({ success: true, message: 'You have been logged out.' });
};

module.exports = { login, logout };
