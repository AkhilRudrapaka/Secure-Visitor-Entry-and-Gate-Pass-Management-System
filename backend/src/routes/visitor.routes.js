const express = require('express');
const { createVisitRequest, getVisits, updateVisitStatus } = require('../controllers/visitor.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(authorize('visitor', 'student'), createVisitRequest)
    .get(getVisits);

router.route('/:id')
    .put(authorize('faculty', 'admin', 'visitor', 'student'), updateVisitStatus);

module.exports = router;
