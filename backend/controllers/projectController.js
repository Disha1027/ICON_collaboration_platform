const Project = require('../models/Project');
const Workspace = require('../models/Workspace');

const createProject = async (req, res) => {
  const { name, description, motto, domain, tags, isPublic } = req.body;

  try {
    const project = await Project.create({
      name,
      description,
      motto,
      domain,
      tags,
      isPublic,
      creator: req.user._id,
      members: [{ user: req.user._id, role: 'Admin' }]
    });

    // Auto-create workspace
    const workspace = await Workspace.create({
      project: project._id,
      notes: [],
      resources: []
    });

    project.workspace = workspace._id;
    await project.save();

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { isPublic: true },
        { creator: req.user._id },
        { 'members.user': req.user._id }
      ]
    }).populate('creator', 'username name').sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('creator', 'username name profilePicture')
      .populate('members.user', 'username name profilePicture')
      .populate('workspace');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check visibility
    const isMember = project.creator.toString() === req.user._id.toString() || project.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!project.isPublic && !isMember) {
      return res.status(403).json({ message: 'Private project' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;
    project.motto = req.body.motto || project.motto;
    project.domain = req.body.domain || project.domain;
    project.tags = req.body.tags || project.tags;
    project.isPublic = req.body.isPublic !== undefined ? req.body.isPublic : project.isPublic;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addMember = async (req, res) => {
  const { userId, role } = req.body;
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const alreadyMember = project.members.find(m => m.user.toString() === userId);
    if (alreadyMember) {
      return res.status(400).json({ message: 'User already a member' });
    }

    project.members.push({ user: userId, role: role || 'Member' });
    await project.save();

    res.json(project.members);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createProject, getProjects, getProjectById, updateProject, addMember };
