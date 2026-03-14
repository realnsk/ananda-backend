const express = require('express')
const { Blog } = require('../models/index')
const auth = require('../middleware/auth')

const router = express.Router()

// GET /api/blog  (public - published only)
router.get('/', async (req, res) => {
  try {
    const { limit, all } = req.query
    const query = all && req.headers.authorization ? {} : { published: true }
    const posts = await Blog.find(query)
      .sort({ publishDate: -1 })
      .limit(limit ? parseInt(limit) : 0)
      .select('-content')
    res.json({ posts })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/blog/:slugOrId  (public)
router.get('/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params
    let post = await Blog.findOne({ slug: slugOrId, published: true })
    if (!post) {
      // Try by ID
      post = await Blog.findById(slugOrId).catch(() => null)
    }
    if (!post) return res.status(404).json({ message: 'Post not found' })
    res.json({ post })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/blog  (admin)
router.post('/', auth, async (req, res) => {
  try {
    // Auto-generate slug if not provided
    if (!req.body.slug && req.body.title) {
      req.body.slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')
    }
    const post = await Blog.create(req.body)
    res.status(201).json({ post })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A post with this slug already exists.' })
    }
    res.status(400).json({ message: err.message })
  }
})

// PUT /api/blog/:id  (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Blog.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    )
    if (!post) return res.status(404).json({ message: 'Post not found' })
    res.json({ post })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/blog/:id  (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Blog.findByIdAndDelete(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    res.json({ message: 'Post deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
