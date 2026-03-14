const mongoose = require('mongoose')

// ─── Yoga Class ───────────────────────────────────────────────────────────────
const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  day: { type: String, required: true },
  time: { type: String, required: true },
  instructor: { type: String },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'], default: 'All Levels' },
  price: { type: Number },
  duration: { type: Number, default: 60 }, // minutes
  description: { type: String },
  active: { type: Boolean, default: true },
}, { timestamps: true })

// ─── Blog Post ────────────────────────────────────────────────────────────────
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  author: { type: String, default: 'Admin' },
  excerpt: { type: String },
  content: { type: String },
  image: { type: String },
  publishDate: { type: Date, default: Date.now },
  published: { type: Boolean, default: true },
  tags: [String],
}, { timestamps: true })

blogSchema.index({ slug: 1 })
blogSchema.index({ title: 'text', content: 'text' })

// ─── Gallery Image ────────────────────────────────────────────────────────────
const gallerySchema = new mongoose.Schema({
  url: { type: String, required: true },
  caption: { type: String },
  cloudinaryId: { type: String },
  order: { type: Number, default: 0 },
}, { timestamps: true })

// ─── Booking ──────────────────────────────────────────────────────────────────
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String },
  retreatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Retreat' },
  retreatTitle: { type: String },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  className: { type: String },
  type: { type: String, enum: ['retreat', 'class'], default: 'retreat' },
  guests: { type: Number, default: 1 },
  message: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
}, { timestamps: true })

// ─── Contact Message ──────────────────────────────────────────────────────────
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true })

// ─── Newsletter ───────────────────────────────────────────────────────────────
const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  active: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = {
  Class: mongoose.model('Class', classSchema),
  Blog: mongoose.model('Blog', blogSchema),
  Gallery: mongoose.model('Gallery', gallerySchema),
  Booking: mongoose.model('Booking', bookingSchema),
  Contact: mongoose.model('Contact', contactSchema),
  Newsletter: mongoose.model('Newsletter', newsletterSchema),
}
