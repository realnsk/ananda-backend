const express = require('express')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const Admin = require('../models/Admin')
const auth = require('../middleware/auth')

const router = express.Router()

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
}

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid input', errors: errors.array() })

  try {
    const { email, password } = req.body
    const admin = await Admin.findOne({ email }).select('+password')
    if (!admin) return res.status(401).json({ message: 'Invalid email or password' })

    const isMatch = await admin.comparePassword(password)
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' })

    const token = signToken(admin._id)
    res.json({ token, admin: admin.toJSON() })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  res.json({ admin: req.admin })
})

// POST /api/auth/change-password (protected)
router.post('/change-password', auth, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Password must be at least 8 characters' })

  try {
    const admin = await Admin.findById(req.admin._id).select('+password')
    const isMatch = await admin.comparePassword(req.body.currentPassword)
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' })

    admin.password = req.body.newPassword
    await admin.save()
    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
