const express = require('express');
const { getStats, getLogs, getUsers } = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/logs', getLogs);
router.get('/users', getUsers);

module.exports = router;
