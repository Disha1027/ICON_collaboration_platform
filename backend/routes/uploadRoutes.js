const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10000000 } // 10MB limit
});

router.post('/', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Construct the URL to access the file
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.json({
    name: req.file.originalname,
    url: fileUrl,
    type: req.file.mimetype
  });
});

module.exports = router;
