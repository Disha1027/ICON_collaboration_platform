const Project = require('../models/Project');

const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      const project = await Project.findById(req.params.projectId || req.body.projectId);
      if (!project) return res.status(404).json({ message: 'Project not found' });

      // If user is creator, they have Admin access by default
      if (project.creator.toString() === req.user._id.toString()) {
        return next();
      }

      const member = project.members.find(m => m.user.toString() === req.user._id.toString());
      if (!member) {
        return res.status(403).json({ message: 'Not a member of this project' });
      }

      if (!roles.includes(member.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
};

module.exports = { checkRole };
