const express = require('express');
const { getHosts } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/hosts', protect, getHosts);

module.exports = router;
