const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Message', 'Invite', 'Collab', 'Update', 'System'],
    default: 'System'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId // Can reference a project, request, etc.
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
