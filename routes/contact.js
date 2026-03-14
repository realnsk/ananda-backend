// routes/contact.js
const express = require('express')
const { body, validationResult } = require('express-validator')
const { Contact } = require('../models/index')
const auth = require('../middleware/auth')

const router = express.Router()

// POST /api/contact  (public)
router.post('/', [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('message').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Please fill all required fields' })
  try {
    const msg = await Contact.create(req.body)
    res.status(201).json({ message: 'Message sent successfully', id: msg._id })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// GET /api/contact  (admin)
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 })
    res.json({ messages })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/contact/:id  (admin - mark read)
router.put('/:id', auth, async (req, res) => {
  try {
    const msg = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ message: msg })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/contact/:id  (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
