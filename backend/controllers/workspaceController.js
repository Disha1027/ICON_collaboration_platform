const Workspace = require('../models/Workspace');
const Project = require('../models/Project');

const getWorkspaceByProjectId = async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ project: req.params.projectId })
      .populate('notes.createdBy', 'username name')
      .populate('resources.uploadedBy', 'username name');

    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addNote = async (req, res) => {
  const { title, content } = req.body;
  try {
    const workspace = await Workspace.findOne({ project: req.params.projectId });
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    workspace.notes.push({
      title,
      content,
      createdBy: req.user._id
    });

    await workspace.save();
    res.json(workspace.notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateNote = async (req, res) => {
  const { noteId, title, content } = req.body;
  try {
    const workspace = await Workspace.findOne({ project: req.params.projectId });
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const note = workspace.notes.id(noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.title = title || note.title;
    note.content = content || note.content;
    note.updatedAt = Date.now();

    await workspace.save();
    res.json(workspace.notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addResource = async (req, res) => {
  // Assuming a file upload middleware handled the upload and placed the URL in req.body.url
  const { name, url, type } = req.body;
  try {
    const workspace = await Workspace.findOne({ project: req.params.projectId });
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    workspace.resources.push({
      name,
      url,
      type,
      uploadedBy: req.user._id
    });

    await workspace.save();
    res.json(workspace.resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getWorkspaceByProjectId, addNote, updateNote, addResource };
