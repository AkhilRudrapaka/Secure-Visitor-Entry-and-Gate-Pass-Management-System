const express = require('express');
const { getStats, getLogs, getUsers, getPendingUsers, approveUser, rejectUser, deleteUser } = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/logs', getLogs);
router.get('/users', getUsers);
router.get('/pending-users', getPendingUsers);
router.put('/approve-user/:id', approveUser);
router.delete('/reject-user/:id', rejectUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
