const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { pool } = require('../config/db');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('\n🌱 Starting database seed...\n');

    // Read and execute schema.sql
    console.log('📋 Creating tables...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('✓ Tables created successfully');

    // Hash passwords
    console.log('\n🔐 Hashing passwords...');
    const hashedPassword123 = await bcrypt.hash('pass123', 10);
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);

    // Insert users
    console.log('👥 Inserting users...');
    const users = [
      { name: 'Dr. Adaeze Okafor', email: 'admin@esms.edu', password: hashedAdminPassword, role: 'super Admin', avatar: 'AO', department: 'Administration' },
      { name: 'Prof. Emmanuel Nwachukwu', email: 'e.nwachukwu@esms.edu', password: hashedPassword123, role: 'admin', avatar: 'EN', department: 'Academic Affairs' },
      { name: 'Chisom Eze', email: 'c.eze@esms.edu', password: hashedPassword123, role: 'organizer', avatar: 'CE', department: 'Student Affairs' },
      { name: 'Tobenna Obi', email: 't.obi@esms.edu', password: hashedPassword123, role: 'organizer', avatar: 'TO', department: 'Sports & Recreation' },
      { name: 'Ngozi Amadi', email: 'n.amadi@esms.edu', password: hashedPassword123, role: 'user', avatar: 'NA', department: 'Engineering' },
      { name: 'Ikenna Chukwu', email: 'i.chukwu@esms.edu', password: hashedPassword123, role: 'user', avatar: 'IC', department: 'Sciences' },
    ];

    for (const user of users) {
      await pool.query(
        `INSERT INTO users (name, email, password, role, avatar, department) VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.name, user.email, user.password, user.role, user.avatar, user.department]
      );
    }
    console.log(`✓ ${users.length} users inserted`);

    // Insert venues
    console.log('🏛  Inserting venues...');
    const venues = [
      { name: 'Main Auditorium', location: 'Main Block', capacity: 800, facilities: ['Projector', 'AC', 'Sound System', 'Stage'] },
      { name: 'Conference Hall A', location: 'Admin Block', capacity: 150, facilities: ['Projector', 'AC', 'Whiteboard'] },
      { name: 'Lecture Hall 101', location: 'Academic Block 1', capacity: 200, facilities: ['Projector', 'AC'] },
      { name: 'Sports Complex', location: 'Sports Ground', capacity: 1200, facilities: ['Floodlights', 'Sound System', 'Bleachers'] },
      { name: 'ICT Lab', location: 'Science Block', capacity: 60, facilities: ['Computers', 'Projector', 'AC'] },
      { name: 'Seminar Room B2', location: 'Admin Block', capacity: 80, facilities: ['Projector', 'Whiteboard'] },
    ];

    for (const venue of venues) {
      await pool.query(
        `INSERT INTO venues (name, location, capacity, facilities) VALUES ($1, $2, $3, $4)`,
        [venue.name, venue.location, venue.capacity, venue.facilities]
      );
    }
    console.log(`✓ ${venues.length} venues inserted`);

    // Insert events
    console.log('📅 Inserting events...');
    const events = [
      {
        title: 'Annual Science Exhibition',
        description: 'Showcase of student research and innovation projects from various departments.',
        category: 'Academic',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '17:00',
        venue_id: 1,
        organizer_id: 3,
        status: 'approved',
        approved_by: 2,
        approval_note: 'Approved. Ensure safety protocols.',
        attendees: 342,
        tags: ['research', 'innovation'],
      },
      {
        title: 'Inter-Department Football Championship',
        description: 'Annual football competition featuring teams from all departments.',
        category: 'Sports',
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '18:00',
        venue_id: 4,
        organizer_id: 4,
        status: 'approved',
        approved_by: 2,
        approval_note: '',
        attendees: 520,
        tags: ['sports', 'competition'],
      },
      {
        title: 'Leadership & Governance Workshop',
        description: 'Interactive workshop on leadership skills and institutional governance.',
        category: 'Workshop',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: '13:00',
        end_time: '17:00',
        venue_id: 2,
        organizer_id: 3,
        status: 'pending',
        approved_by: null,
        approval_note: '',
        attendees: 0,
        tags: ['leadership'],
      },
      {
        title: 'Alumni Homecoming Gala',
        description: 'Annual reunion event bringing together alumni and current community members.',
        category: 'Social',
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: '18:00',
        end_time: '22:00',
        venue_id: 1,
        organizer_id: 3,
        status: 'pending',
        approved_by: null,
        approval_note: '',
        attendees: 0,
        tags: ['alumni', 'networking'],
      },
      {
        title: 'Python Programming Bootcamp',
        description: '3-day intensive bootcamp covering Python fundamentals to advanced concepts.',
        category: 'Workshop',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: '08:00',
        end_time: '16:00',
        venue_id: 5,
        organizer_id: 4,
        status: 'completed',
        approved_by: 2,
        approval_note: 'Approved.',
        attendees: 58,
        tags: ['programming', 'python'],
      },
      {
        title: 'Cultural Heritage Day',
        description: 'Celebration of diverse cultures with performances, exhibitions, and workshops.',
        category: 'Cultural',
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '20:00',
        venue_id: 1,
        organizer_id: 3,
        status: 'completed',
        approved_by: 1,
        approval_note: 'Approved — great initiative.',
        attendees: 650,
        tags: ['culture', 'diversity'],
      },
      {
        title: 'Research Methodology Seminar',
        description: 'Seminar for postgraduate students on research methodologies and best practices.',
        category: 'Seminar',
        date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '13:00',
        venue_id: 3,
        organizer_id: 3,
        status: 'rejected',
        approved_by: 2,
        approval_note: 'Venue unavailable. Please reschedule.',
        attendees: 0,
        tags: ['research', 'postgrad'],
      },
      {
        title: 'International Conference on AI',
        description: 'Two-day international conference featuring keynotes on artificial intelligence and machine learning.',
        category: 'Conference',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: '08:00',
        end_time: '18:00',
        venue_id: 1,
        organizer_id: 4,
        status: 'pending',
        approved_by: null,
        approval_note: '',
        attendees: 0,
        tags: ['AI', 'technology', 'international'],
      },
    ];

    for (const event of events) {
      await pool.query(
        `INSERT INTO events (title, description, category, date, start_time, end_time, venue_id, organizer_id, status, approved_by, approval_note, attendees, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          event.title,
          event.description,
          event.category,
          event.date,
          event.start_time,
          event.end_time,
          event.venue_id,
          event.organizer_id,
          event.status,
          event.approved_by,
          event.approval_note,
          event.attendees,
          event.tags,
        ]
      );
    }
    console.log(`✓ ${events.length} events inserted`);

    console.log('\n✅ Database seeded successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message, '\n');
    process.exit(1);
  }
};

seedDatabase();
