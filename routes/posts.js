const express = require('express');
const router = express.Router();
const post_controller = require('../controllers/post_controller');
const { validate } = require('../middleware/validate_user');

router.post('/', validate, post_controller.createPost);
router.get('/', validate, post_controller.getAllPosts);

router.post('/:postId/like', validate, post_controller.likePost);

module.exports = router;
