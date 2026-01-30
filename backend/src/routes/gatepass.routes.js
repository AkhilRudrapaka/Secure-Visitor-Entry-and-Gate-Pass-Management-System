const express = require('express');
const { generatePass, verifyPass, markEntry } = require('../controllers/gatepass.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/generate', authorize('visitor', 'student'), generatePass);
router.post('/verify', authorize('security', 'admin'), verifyPass);
router.post('/entry', authorize('security', 'admin'), markEntry);

module.exports = router;
