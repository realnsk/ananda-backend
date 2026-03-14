const express = require('express')
const { Gallery } = require('../models/index')
const auth = require('../middleware/auth')

const router = express.Router()

// GET /api/gallery  (public)
router.get('/', async (req, res) => {
  try {
    const images = await Gallery.find().sort({ order: 1, createdAt: -1 })
    res.json({ images })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/gallery  (admin)
router.post('/', auth, async (req, res) => {
  try {
    const image = await Gallery.create(req.body)
    res.status(201).json({ image })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT /api/gallery/:id  (admin - update caption/order)
router.put('/:id', auth, async (req, res) => {
  try {
    const image = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!image) return res.status(404).json({ message: 'Image not found' })
    res.json({ image })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/gallery/:id  (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id)
    if (!image) return res.status(404).json({ message: 'Image not found' })
    // Optionally delete from Cloudinary
    if (image.cloudinaryId) {
      const { cloudinary } = require('../config/cloudinary')
      await cloudinary.uploader.destroy(image.cloudinaryId).catch(() => {})
    }
    res.json({ message: 'Image deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
