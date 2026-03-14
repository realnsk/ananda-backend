const express = require('express')
const { body, validationResult } = require('express-validator')
const { Booking } = require('../models/index')
const auth = require('../middleware/auth')

const router = express.Router()

// POST /api/bookings  (public - create booking)
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

  try {
    const booking = await Booking.create(req.body)
    res.status(201).json({ message: 'Booking submitted successfully', booking })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// GET /api/bookings  (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { status, type } = req.query
    const query = {}
    if (status) query.status = status
    if (type) query.type = type
    const bookings = await Booking.find(query).sort({ createdAt: -1 })
    res.json({ bookings })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/bookings/:id  (admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    res.json({ booking })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/bookings/:id  (admin - update status)
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    res.json({ booking })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/bookings/:id  (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id)
    res.json({ message: 'Booking deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
