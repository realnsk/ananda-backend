const express = require('express')
const { body, validationResult } = require('express-validator')
const { Newsletter } = require('../models/index')
const auth = require('../middleware/auth')

const router = express.Router()

// POST /api/newsletter  (public)
router.post('/', [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Valid email required' })
  try {
    await Newsletter.create({ email: req.body.email })
    res.status(201).json({ message: 'Subscribed successfully' })
  } catch (err) {
    if (err.code === 11000) {
      return res.json({ message: 'Already subscribed' })
    }
    res.status(400).json({ message: err.message })
  }
})

// GET /api/newsletter  (admin)
router.get('/', auth, async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ active: true }).sort({ createdAt: -1 })
    res.json({ subscribers, total: subscribers.length })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
