const express = require('express')
const { body, validationResult } = require('express-validator')
const { Member } = require('../models/index')
const auth = require('../middleware/auth')

const router = express.Router()

function generateReferralCode(name) {
  const clean = name.replace(/\s+/g, '').toUpperCase().slice(0, 5)
  const num = Math.floor(Math.random() * 9000) + 1000
  return `${clean}${num}`
}

// POST /api/members  (public - register a new member)
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('whatsapp').trim().notEmpty().withMessage('WhatsApp number is required'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

  try {
    const { name, whatsapp, email, city, age, referralCode, ownerWhatsapp, groupLink } = req.body

    // Generate unique referral code for this new member
    let newReferralCode = generateReferralCode(name)
    // Make sure it's unique
    let exists = await Member.findOne({ referralCode: newReferralCode })
    while (exists) {
      newReferralCode = generateReferralCode(name)
      exists = await Member.findOne({ referralCode: newReferralCode })
    }

    // Find referrer if code provided
    let referredBy = null
    if (referralCode) {
      const referrer = await Member.findOne({ referralCode: referralCode.toUpperCase() })
      if (referrer) referredBy = referrer._id
    }

    // Save member
    const member = await Member.create({
      name, whatsapp, email, city, age,
      referralCode: newReferralCode,
      referredBy,
    })

    // Build owner notification message
    const ownerMsg = `🧘 New Member Registration!\n\n👤 Name: ${name}\n📱 WhatsApp: ${whatsapp}${email ? `\n📧 Email: ${email}` : ''}${city ? `\n📍 City: ${city}` : ''}${age ? `\n🎂 Age: ${age}` : ''}${referralCode ? `\n🔗 Referred by code: ${referralCode}` : ''}\n\n⏰ ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`

    const ownerNumber = (ownerWhatsapp || process.env.OWNER_WHATSAPP || '919876543210').replace(/\D/g, '')
    const ownerWhatsAppLink = `https://wa.me/${ownerNumber}?text=${encodeURIComponent(ownerMsg)}`
    const inviteLink = groupLink || process.env.WHATSAPP_GROUP_LINK || ''

    // Build this member's referral share link
    const siteUrl = process.env.FRONTEND_URL || 'https://loquacious-souffle-aee871.netlify.app'
    const memberReferralLink = `${siteUrl}/?ref=${newReferralCode}`
    const shareMsg = `🧘 Join ${name.split(' ')[0]}'s yoga community!\n\nI've been loving the classes at Arihant Yoga. Use my link to register and we both get rewards!\n\n👉 ${memberReferralLink}`
    const shareWhatsAppLink = `https://wa.me/?text=${encodeURIComponent(shareMsg)}`

    res.status(201).json({
      message: 'Registration successful!',
      member: { id: member._id, name: member.name, referralCode: newReferralCode },
      ownerWhatsAppLink,
      groupLink: inviteLink,
      referralLink: memberReferralLink,
      shareWhatsAppLink,
    })
  } catch (err) {
    console.error('Member registration error:', err)
    res.status(500).json({ message: 'Registration failed. Please try again.' })
  }
})

// GET /api/members  (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 })
    res.json({ members, total: members.length })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/members/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ member })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE /api/members/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id)
    res.json({ message: 'Member deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
