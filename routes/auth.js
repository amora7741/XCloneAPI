const express = require('express');
const router = express.Router();
const auth_controller = require('../controllers/auth_controller');

router.post('/login', auth_controller.login);

router.get('/logout', auth_controller.logout);

router.get('/validate', auth_controller.validate);

module.exports = router;
