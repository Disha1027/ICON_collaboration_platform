const express = require('express');
const router = express.Router({ mergeParams: true });
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.get(
  '/',
  protect,
  checkRole(['Admin', 'Lead', 'Editor', 'Member', 'Viewer']),
  async (req, res) => {
    try {
      const messages = await Message.find({
        chatId: req.params.projectId,
        chatModel: 'Project'
      })
        .populate('sender', 'username name profilePicture')
        .sort({ createdAt: 1 })
        .limit(100);

      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

module.exports = router;
