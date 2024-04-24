const express = require('express');
const router = express.Router();
const post_controller = require('../controllers/post_controller');
const { validate } = require('../middleware/validate_user');

router.get('/', validate, post_controller.getAllPosts);
router.get('/:username/status/:postId', validate, post_controller.getPost);

router.post('/', validate, post_controller.createPost);
router.post('/:postId/like', validate, post_controller.likePost);
router.post(
  '/:username/status/:postId/comments',
  validate,
  post_controller.getComments
);
router.post('/:username/status/:postId/comments/create', validate);

module.exports = router;
