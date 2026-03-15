const express = require('express')
const { Member } = require('../models/index')
const auth = require('../middleware/auth')

const router = express.Router()

// ── Milestone config ────────────────────────────────────────────────────────
const MILESTONES = [
  { count: 1,  stars: 10, reward: null,           message: '🌟 Amazing! You earned 10 stars for your first referral!' },
  { count: 3,  stars: 30, reward: 'FREE_CLASS',    message: '🎁 Congratulations! You earned a FREE Yoga Class! Use code: {CODE}' },
  { count: 5,  stars: 50, reward: 'RETREAT_10',    message: '💫 WOW! 5 referrals! You earned 10% OFF your next retreat! Use code: {CODE}' },
  { count: 10, stars: 100,reward: 'FREE_RETREAT',  message: '🏆 INCREDIBLE! 10 referrals! You earned a FREE RETREAT! We will contact you shortly!' },
]

function generateCode(name, type) {
  const clean = name.replace(/\s+/g, '').toUpperCase().slice(0, 6)
  const num = Math.floor(Math.random() * 900) + 100
  return `${clean}${type}${num}`
}

function buildWhatsAppLink(phone, message) {
  const num = phone.replace(/\D/g, '')
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`
}

// GET /api/referrals/leaderboard  (public)
router.get('/leaderboard', async (req, res) => {
  try {
    const members = await Member.find({ referralCount: { $gt: 0 } })
      .select('name city referralCount stars totalRewards createdAt')
      .sort({ referralCount: -1, stars: -1 })
      .limit(20)
    res.json({ leaderboard: members })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/referrals/code/:code  (public - look up referrer by code)
router.get('/code/:code', async (req, res) => {
  try {
    const member = await Member.findOne({ referralCode: req.params.code.toUpperCase() })
      .select('name referralCode referralCount stars')
    if (!member) return res.status(404).json({ message: 'Referral code not found' })
    res.json({ referrer: member })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/referrals/track  (called after registration with a ref code)
router.post('/track', async (req, res) => {
  try {
    const { referralCode, newMemberId } = req.body
    if (!referralCode) return res.json({ message: 'No referral code' })

    const referrer = await Member.findOne({ referralCode: referralCode.toUpperCase() })
    if (!referrer) return res.status(404).json({ message: 'Referrer not found' })

    // Increment referral count and stars
    referrer.referralCount = (referrer.referralCount || 0) + 1
    referrer.stars = (referrer.stars || 0) + 10
    referrer.referredMembers = referrer.referredMembers || []
    if (newMemberId) referrer.referredMembers.push(newMemberId)

    // Check if milestone reached
    const milestone = MILESTONES.find(m => m.count === referrer.referralCount)
    let rewardMessage = null
    let couponCode = null
    let whatsappLink = null

    if (milestone) {
      // Generate coupon code if reward exists
      if (milestone.reward && milestone.reward !== 'FREE_RETREAT') {
        couponCode = generateCode(referrer.name, milestone.count)
        rewardMessage = milestone.message.replace('{CODE}', couponCode)
      } else if (milestone.reward === 'FREE_RETREAT') {
        rewardMessage = milestone.message
      }

      // Add reward to history
      referrer.rewards = referrer.rewards || []
      referrer.rewards.push({
        type: milestone.reward || 'STARS',
        couponCode: couponCode || null,
        message: rewardMessage || milestone.message,
        referralCount: referrer.referralCount,
        earnedAt: new Date(),
        redeemed: false,
      })

      referrer.totalRewards = (referrer.totalRewards || 0) + 1
      referrer.stars += milestone.stars - 10 // already added 10 above

      // Build WhatsApp notification link for referrer
      if (referrer.whatsapp && rewardMessage) {
        const fullMsg = `🧘 ${referrer.name}, great news!\n\n${rewardMessage}\n\nKeep sharing and earn more rewards!\n\n— Arihant Yoga 🙏`
        whatsappLink = buildWhatsAppLink(referrer.whatsapp, fullMsg)
      }
    }

    await referrer.save()

    res.json({
      success: true,
      referrerName: referrer.name,
      newStars: referrer.stars,
      newCount: referrer.referralCount,
      milestoneReached: !!milestone,
      milestone: milestone || null,
      couponCode,
      rewardMessage,
      whatsappLink, // open this to notify referrer
    })
  } catch (err) {
    console.error('Referral track error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/referrals/stats/:memberId  (get referral stats for a member)
router.get('/stats/:memberId', async (req, res) => {
  try {
    const member = await Member.findById(req.params.memberId)
      .select('name referralCode referralCount stars rewards totalRewards referredMembers')
    if (!member) return res.status(404).json({ message: 'Member not found' })
    res.json({ stats: member })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/referrals  (admin - all referral data)
router.get('/', auth, async (req, res) => {
  try {
    const members = await Member.find({ referralCount: { $gt: 0 } })
      .sort({ referralCount: -1 })
    res.json({ members, total: members.length })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/referrals/manual-reward  (admin - manually reward a member)
router.post('/manual-reward', auth, async (req, res) => {
  try {
    const { memberId, rewardType, customMessage, couponCode } = req.body
    const member = await Member.findById(memberId)
    if (!member) return res.status(404).json({ message: 'Member not found' })

    member.rewards = member.rewards || []
    member.rewards.push({
      type: rewardType || 'MANUAL',
      couponCode: couponCode || null,
      message: customMessage || 'Manual reward from admin',
      earnedAt: new Date(),
      redeemed: false,
      manual: true,
    })
    member.totalRewards = (member.totalRewards || 0) + 1
    member.stars = (member.stars || 0) + 20 // bonus stars for manual reward

    await member.save()

    // Build WhatsApp link to notify member
    let whatsappLink = null
    if (member.whatsapp && customMessage) {
      const msg = `🎁 ${member.name}, you have a special reward from Arihant Yoga!\n\n${customMessage}\n\n— Arihant Yoga 🙏`
      whatsappLink = buildWhatsAppLink(member.whatsapp, msg)
    }

    res.json({ success: true, member, whatsappLink })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/referrals/redeem/:memberId/:rewardIndex  (admin - mark reward redeemed)
router.put('/redeem/:memberId/:rewardIndex', auth, async (req, res) => {
  try {
    const member = await Member.findById(req.params.memberId)
    if (!member || !member.rewards[req.params.rewardIndex]) {
      return res.status(404).json({ message: 'Not found' })
    }
    member.rewards[req.params.rewardIndex].redeemed = true
    await member.save()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
