const express = require('express');
const router = express.Router();
const user_controller = require('../controllers/user_controller');

router.post('/', user_controller.userSignup);

module.exports = router;
