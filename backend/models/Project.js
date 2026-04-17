const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  motto: {
    type: String,
    default: ''
  },
  domain: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['Admin', 'Lead', 'Editor', 'Member', 'Viewer'],
      default: 'Member'
    }
  }],
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace'
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
