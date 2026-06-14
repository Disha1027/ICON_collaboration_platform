const express = require('express');
const router = express.Router();
const { getMyRequests, sendJoinRequest, sendInvite, respondToRequest } = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.get('/', protect, getMyRequests);
router.post('/join', protect, sendJoinRequest);
router.post('/invite', protect, checkRole(['Admin', 'Lead']), sendInvite);
router.put('/:requestId', protect, respondToRequest);

module.exports = router;
