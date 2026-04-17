const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, updateProject, addMember } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProjectById);

router.route('/:projectId')
  .put(protect, checkRole(['Admin', 'Lead']), updateProject);

router.route('/:projectId/members')
  .post(protect, checkRole(['Admin', 'Lead']), addMember);

module.exports = router;
