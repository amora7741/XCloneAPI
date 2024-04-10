const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  birthMonth: { type: String, required: true },
  birthDay: { type: Number, required: true },
  birthYear: { type: Number, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
