const express = require('express');
const router = express.Router();
const user_controller = require('../controllers/user_controller');
const { validate } = require('../middleware/validate_user');

router.get('/', validate, user_controller.getUsers);
router.get('/random', validate, user_controller.getRandomUsers);
router.get('/:username/posts', validate, user_controller.getUserPosts);
router.get('/:username/replies', validate, user_controller.getUserReplies);
router.get('/:username/likes', validate, user_controller.getUserLikes);

router.post('/', user_controller.userSignup);
router.post('/:accountId/follow', validate, user_controller.followUser);

module.exports = router;
