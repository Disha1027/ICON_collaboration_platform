const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId, // Could be Project ID or a direct Chat ID
    required: true,
    refPath: 'chatModel'
  },
  chatModel: {
    type: String,
    required: true,
    enum: ['Project', 'User']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
