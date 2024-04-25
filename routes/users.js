const express = require('express');
const router = express.Router();
const user_controller = require('../controllers/user_controller');
const { validate } = require('../middleware/validate_user');

router.get('/', validate, user_controller.getUsers);
router.get('/random', validate, user_controller.getRandomUsers);

router.post('/', user_controller.userSignup);

module.exports = router;
