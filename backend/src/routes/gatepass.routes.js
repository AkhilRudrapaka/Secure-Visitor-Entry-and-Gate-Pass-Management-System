const express = require('express');
const { generatePass, verifyPass } = require('../controllers/gatepass.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/generate', authorize('visitor', 'student'), generatePass);
router.post('/verify', authorize('security', 'admin'), verifyPass);

module.exports = router;
