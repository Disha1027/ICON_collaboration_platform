const express = require('express');
const router = express.Router({ mergeParams: true }); // Access params from parent route
const { getWorkspaceByProjectId, addNote, updateNote, addResource } = require('../controllers/workspaceController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

// Route path relative to /api/projects/:projectId/workspace
router.route('/')
  .get(protect, checkRole(['Admin', 'Lead', 'Editor', 'Member', 'Viewer']), getWorkspaceByProjectId);

router.route('/notes')
  .post(protect, checkRole(['Admin', 'Lead', 'Editor', 'Member']), addNote)
  .put(protect, checkRole(['Admin', 'Lead', 'Editor', 'Member']), updateNote);

router.route('/resources')
  .post(protect, checkRole(['Admin', 'Lead', 'Editor', 'Member']), addResource);

module.exports = router;
