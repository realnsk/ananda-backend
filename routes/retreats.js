const express = require('express')
const Retreat = require('../models/Retreat')
const auth = require('../middleware/auth')

const router = express.Router()

// GET /api/retreats  (public)
router.get('/', async (req, res) => {
  try {
    const { limit, active } = req.query
    const query = {}
    if (active !== 'false') query.active = true
    const retreats = await Retreat.find(query)
      .sort({ date: 1 })
      .limit(limit ? parseInt(limit) : 0)
    res.json({ retreats })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/retreats/:id  (public)
router.get('/:id', async (req, res) => {
  try {
    const retreat = await Retreat.findById(req.params.id)
    if (!retreat) return res.status(404).json({ message: 'Retreat not found' })
    res.json({ retreat })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/retreats  (admin)
router.post('/', auth, async (req, res) => {
  try {
    const retreat = await Retreat.create(req.body)
    res.status(201).json({ retreat })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT /api/retreats/:id  (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const retreat = await Retreat.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!retreat) return res.status(404).json({ message: 'Retreat not found' })
    res.json({ retreat })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/retreats/:id  (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const retreat = await Retreat.findByIdAndDelete(req.params.id)
    if (!retreat) return res.status(404).json({ message: 'Retreat not found' })
    res.json({ message: 'Retreat deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
