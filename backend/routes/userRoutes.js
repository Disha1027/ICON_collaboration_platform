const express = require('express');
const router = express.Router();
const { searchUsers, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, searchUsers);
router.route('/:id').get(protect, getUserById);

module.exports = router;
