const jwt = require('jsonwebtoken');
const User = require('../models/User');

require('dotenv').config();

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

    req.user = {
      id: user.id,
      name: user.name,
      username: user.username,
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { validate };
