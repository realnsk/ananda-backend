require('dotenv').config()
const mongoose = require('mongoose')
const Admin = require('../models/Admin')
const Retreat = require('../models/Retreat')
const { Class, Blog, Gallery } = require('../models/index')

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB Atlas...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected')

    // ── Admin ──────────────────────────────────────────────────
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL })
    if (!existingAdmin) {
      await Admin.create({
        email: process.env.ADMIN_EMAIL || 'admin@anandayoga.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@1234!',
        name: 'Admin',
      })
      console.log('✅ Admin user created:', process.env.ADMIN_EMAIL)
    } else {
      console.log('ℹ️  Admin already exists, skipping.')
    }

    // ── Retreats ───────────────────────────────────────────────
    const retreatCount = await Retreat.countDocuments()
    if (retreatCount === 0) {
      await Retreat.insertMany([
        {
          title: 'Himalayan Silence Retreat',
          location: 'Rishikesh, Uttarakhand, India',
          date: new Date('2025-03-15'),
          duration: 7,
          price: 1800,
          shortDescription: 'Seven days of deep silence, meditation and pranayama in the foothills of the Himalayas.',
          description: 'Nestled in the sacred foothills of the Himalayas, our signature Silence Retreat offers seven transformative days of deep practice, inner reflection, and spiritual renewal.\n\nThis immersive experience combines classical yoga asana, pranayama, and extended meditation sits in environments of extraordinary natural beauty.',
          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80',
          accommodation: 'Private en-suite rooms in our riverside ashram with Ganges views.',
          schedule: [
            { time: '5:30 AM', activity: 'Silent wake up, herbal tea' },
            { time: '6:00 AM', activity: 'Pranayama & Meditation (90 min)' },
            { time: '8:00 AM', activity: 'Sattvic breakfast' },
            { time: '10:00 AM', activity: 'Yoga Asana practice (2 hrs)' },
            { time: '1:00 PM', activity: 'Lunch & rest period' },
            { time: '6:00 PM', activity: 'Yin Yoga & Nidra (90 min)' },
            { time: '7:30 PM', activity: 'Light dinner' },
          ],
          packages: [
            { name: 'Shared Room', price: 1800, includes: ['7 nights shared room', 'All meals', 'Yoga sessions', 'Meditation guidance'] },
            { name: 'Private Room', price: 2400, includes: ['7 nights private room', 'All meals', 'Yoga sessions', '1 Ayurvedic treatment'] },
          ],
          instructor: { name: 'Priya Sharma', bio: '500hr certified teacher with 15 years of practice.', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400' },
          whatsapp: '919876543210',
          active: true,
        },
        {
          title: 'Bali Sacred Journey',
          location: 'Ubud, Bali, Indonesia',
          date: new Date('2025-04-10'),
          duration: 10,
          price: 2600,
          shortDescription: 'A transformative journey through ancient temples and lush rice terraces.',
          description: 'Ten days of practice, ceremony, and deep exploration of Balinese spiritual culture. Morning yoga overlooking the jungle, afternoon temple visits, evening fire ceremonies.',
          image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80',
          accommodation: 'Private villa with pool in the heart of Ubud.',
          schedule: [
            { time: '6:00 AM', activity: 'Sunrise yoga & pranayama' },
            { time: '8:00 AM', activity: 'Breakfast' },
            { time: '10:00 AM', activity: 'Temple excursion or free time' },
            { time: '4:00 PM', activity: 'Afternoon asana practice' },
            { time: '7:30 PM', activity: 'Dinner & evening ceremony' },
          ],
          packages: [
            { name: 'Standard Villa', price: 2600, includes: ['10 nights villa', 'All meals', 'Yoga sessions', 'Temple tours'] },
            { name: 'Premium Suite', price: 3400, includes: ['10 nights premium suite', 'All meals', 'Yoga sessions', 'Temple tours', '2 spa treatments'] },
          ],
          instructor: { name: 'Priya Sharma', bio: 'Expert in traditional yoga lineages.', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400' },
          whatsapp: '919876543210',
          active: true,
        },
      ])
      console.log('✅ Sample retreats created')
    } else {
      console.log(`ℹ️  ${retreatCount} retreats already exist, skipping.`)
    }

    // ── Classes ────────────────────────────────────────────────
    const classCount = await Class.countDocuments()
    if (classCount === 0) {
      await Class.insertMany([
        { name: 'Morning Vinyasa Flow', day: 'Monday', time: '6:30 AM', instructor: 'Priya Sharma', difficulty: 'Intermediate', price: 20, duration: 75, description: 'A dynamic flow to awaken the body and mind.' },
        { name: 'Restorative Yin', day: 'Tuesday', time: '7:00 PM', instructor: 'Arjun Mehta', difficulty: 'Beginner', price: 18, duration: 75, description: 'Deep holds to release stored tension.' },
        { name: 'Ashtanga Mysore', day: 'Wednesday', time: '6:00 AM', instructor: 'Priya Sharma', difficulty: 'Advanced', price: 25, duration: 90, description: 'Traditional self-practice Mysore style.' },
        { name: 'Pranayama & Meditation', day: 'Thursday', time: '7:30 PM', instructor: 'Kavya Nair', difficulty: 'All Levels', price: 15, duration: 60, description: 'Breathwork and silent meditation.' },
        { name: 'Sunrise Sadhana', day: 'Saturday', time: '5:30 AM', instructor: 'Priya Sharma', difficulty: 'All Levels', price: 25, duration: 120, description: 'Full spiritual practice at sunrise.' },
      ])
      console.log('✅ Sample classes created')
    }

    // ── Blog ───────────────────────────────────────────────────
    const blogCount = await Blog.countDocuments()
    if (blogCount === 0) {
      await Blog.insertMany([
        {
          title: 'Five Pranayama Techniques for Daily Life',
          slug: 'five-pranayama-techniques',
          author: 'Priya Sharma',
          excerpt: 'Ancient breathwork practices can transform your energy, reduce anxiety, and reconnect you to the present moment.',
          content: '<p>Pranayama — the science of breath — is one of yoga\'s most potent tools. Practice Nadi Shodhana, Ujjayi, Bhramari, Kapalbhati, and Sitali to transform your daily life.</p>',
          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
          published: true,
          publishDate: new Date('2025-02-15'),
        },
        {
          title: 'The Sattvic Diet: Eating for Clarity and Peace',
          slug: 'sattvic-diet-guide',
          author: 'Kavya Nair',
          excerpt: 'Explore the yogic approach to nutrition — foods that nourish the mind as well as the body.',
          content: '<p>In yogic philosophy, food is classified as sattvic, rajasic, or tamasic. A sattvic diet promotes clarity, lightness, and spiritual awareness.</p>',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          published: true,
          publishDate: new Date('2025-02-08'),
        },
      ])
      console.log('✅ Sample blog posts created')
    }

    // ── Gallery ────────────────────────────────────────────────
    const galleryCount = await Gallery.countDocuments()
    if (galleryCount === 0) {
      await Gallery.insertMany([
        { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', caption: 'Morning practice' },
        { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Himalayan retreat' },
        { url: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800', caption: 'Asana session' },
        { url: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800', caption: 'Bali retreat' },
        { url: 'https://images.unsplash.com/photo-1510894347713-fc3dc6166ef5?w=800', caption: 'Ocean yoga' },
        { url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800', caption: 'Forest meditation' },
      ])
      console.log('✅ Sample gallery images created')
    }

    console.log('\n🎉 Seed complete!')
    console.log('───────────────────────────────────')
    console.log(`Admin Email:    ${process.env.ADMIN_EMAIL || 'admin@anandayoga.com'}`)
    console.log(`Admin Password: ${process.env.ADMIN_PASSWORD || 'Admin@1234!'}`)
    console.log('───────────────────────────────────')
    console.log('⚠️  Change the admin password after first login!\n')

  } catch (err) {
    console.error('❌ Seed error:', err)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

seed()
