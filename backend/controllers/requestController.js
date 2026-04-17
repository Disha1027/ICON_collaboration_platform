const Request = require('../models/Request');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ receiverUser: req.user._id, status: 'Pending' })
      .populate('sender', 'username name profilePicture')
      .populate('receiverProject', 'name');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const sendJoinRequest = async (req, res) => {
  const { projectId } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Ensure not already a member
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
    if (isMember) return res.status(400).json({ message: 'Already a member' });

    const existingRequest = await Request.findOne({
      sender: req.user._id,
      receiverUser: project.creator,
      receiverProject: projectId,
      status: 'Pending'
    });
    if (existingRequest) return res.status(400).json({ message: 'Request already sent' });

    const request = await Request.create({
      sender: req.user._id,
      receiverUser: project.creator, // the admin handles it
      receiverProject: projectId,
      type: 'Join'
    });

    await Notification.create({
      user: project.creator,
      content: `${req.user.name} requested to join ${project.name}`,
      type: 'Invite',
      relatedId: request._id
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const sendInvite = async (req, res) => {
  const { projectId, targetUserId } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some(m => m.user.toString() === targetUserId);
    if (isMember) return res.status(400).json({ message: 'User is already a member' });

    const existingRequest = await Request.findOne({
      sender: req.user._id,
      receiverUser: targetUserId,
      receiverProject: projectId,
      status: 'Pending'
    });
    if (existingRequest) return res.status(400).json({ message: 'Invite already sent' });

    const request = await Request.create({
      sender: req.user._id,
      receiverUser: targetUserId,
      receiverProject: projectId,
      type: 'Invite'
    });

    await Notification.create({
      user: targetUserId,
      content: `${req.user.name} invited you to join ${project.name}`,
      type: 'Invite',
      relatedId: request._id
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const respondToRequest = async (req, res) => {
  const { requestId } = req.params;
  const { action } = req.body; // 'Accept' or 'Reject'

  try {
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.receiverUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (action === 'Accept') {
      const project = await Project.findById(request.receiverProject);
      if (!project) return res.status(404).json({ message: 'Project not found' });

      const newUserId = request.type === 'Invite' ? request.receiverUser : request.sender;
      
      const alreadyMember = project.members.some(m => m.user.toString() === newUserId.toString());
      if (!alreadyMember) {
        project.members.push({ user: newUserId, role: 'Member' });
        await project.save();
      }

      request.status = 'Accepted';
    } else {
      request.status = 'Rejected';
    }

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMyRequests, sendJoinRequest, sendInvite, respondToRequest };
