const express = require('express')
const { Class } = require('../models/index')
const auth = require('../middleware/auth')

const router = express.Router()

// GET /api/classes  (public)
router.get('/', async (req, res) => {
  try {
    const { limit } = req.query
    const classes = await Class.find({ active: true })
      .sort({ day: 1, time: 1 })
      .limit(limit ? parseInt(limit) : 0)
    res.json({ classes })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/classes/:id  (public)
router.get('/:id', async (req, res) => {
  try {
    const yogaClass = await Class.findById(req.params.id)
    if (!yogaClass) return res.status(404).json({ message: 'Class not found' })
    res.json({ class: yogaClass })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/classes  (admin)
router.post('/', auth, async (req, res) => {
  try {
    const yogaClass = await Class.create(req.body)
    res.status(201).json({ class: yogaClass })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT /api/classes/:id  (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const yogaClass = await Class.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    )
    if (!yogaClass) return res.status(404).json({ message: 'Class not found' })
    res.json({ class: yogaClass })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/classes/:id  (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const yogaClass = await Class.findByIdAndDelete(req.params.id)
    if (!yogaClass) return res.status(404).json({ message: 'Class not found' })
    res.json({ message: 'Class deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
