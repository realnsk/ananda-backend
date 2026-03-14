const express = require('express')
const auth = require('../middleware/auth')
const Retreat = require('../models/Retreat')
const { Class, Blog, Booking, Contact, Newsletter, Gallery } = require('../models/index')

const router = express.Router()

// GET /api/admin/stats  (admin - dashboard overview)
router.get('/stats', auth, async (req, res) => {
  try {
    const [
      totalBookings,
      pendingBookings,
      activeRetreats,
      totalClasses,
      totalBlogPosts,
      totalMessages,
      unreadMessages,
      totalSubscribers,
      totalGallery,
      recentBookings,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Retreat.countDocuments({ active: true }),
      Class.countDocuments({ active: true }),
      Blog.countDocuments({ published: true }),
      Contact.countDocuments(),
      Contact.countDocuments({ read: false }),
      Newsletter.countDocuments({ active: true }),
      Gallery.countDocuments(),
      Booking.find().sort({ createdAt: -1 }).limit(5),
    ])

    // Simple revenue estimate: confirmed bookings x avg price
    const confirmedBookings = await Booking.find({ status: 'confirmed' })
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)

    res.json({
      totalBookings,
      pendingBookings,
      activeRetreats,
      totalClasses,
      totalBlogPosts,
      totalMessages,
      unreadMessages,
      totalSubscribers,
      totalGallery,
      totalRevenue,
      recentBookings,
    })
  } catch (err) {
    console.error('Stats error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
