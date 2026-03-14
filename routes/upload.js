const express = require('express')
const auth = require('../middleware/auth')
const { upload } = require('../config/cloudinary')

const router = express.Router()

// POST /api/upload  (admin - single image upload to Cloudinary)
router.post('/', auth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }
  res.json({
    url: req.file.path,
    publicId: req.file.filename,
    originalName: req.file.originalname,
  })
})

module.exports = router
