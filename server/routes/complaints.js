const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/complaintController');
router.get('/', ctrl.getComplaints);
router.get('/:id', ctrl.getComplaintById);
router.post('/', ctrl.createComplaint);
router.patch('/:id/status', ctrl.updateStatus);
router.post('/:id/verify', ctrl.verifyComplaint);
module.exports = router;
