const mongoose = require('mongoose')

const scheduleItemSchema = new mongoose.Schema({
  time: String,
  activity: String,
}, { _id: false })

const packageSchema = new mongoose.Schema({
  name: String,
  price: Number,
  includes: [String],
}, { _id: false })

const instructorSchema = new mongoose.Schema({
  name: String,
  bio: String,
  image: String,
}, { _id: false })

const retreatSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  location: { type: String, required: true },
  date: { type: Date },
  duration: { type: Number }, // days
  price: { type: Number },
  shortDescription: { type: String },
  description: { type: String },
  image: { type: String },
  schedule: [scheduleItemSchema],
  accommodation: { type: String },
  packages: [packageSchema],
  instructor: instructorSchema,
  mapUrl: { type: String },
  whatsapp: { type: String },
  active: { type: Boolean, default: true },
}, { timestamps: true })

retreatSchema.index({ title: 'text', location: 'text' })

module.exports = mongoose.model('Retreat', retreatSchema)
