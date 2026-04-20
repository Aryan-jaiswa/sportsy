/**
 * Seed script — populates the sportsy database with initial data.
 * Run with: npm run seed
 *
 * Idempotent: checks row counts before inserting.
 */
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { initDB } from './db.js';
import pool from './db.js';

dotenv.config();

async function seed() {
  // Ensure tables exist
  await initDB();

  const client = await pool.connect();

  try {
    // ── Users ────────────────────────────────────────────────
    const { rowCount: userCount } = await client.query('SELECT 1 FROM users LIMIT 1');
    if (!userCount || userCount === 0) {
      const hash = await bcrypt.hash('password123', 10);
      await client.query(
        `INSERT INTO users (name, email, password_hash, profile_picture, games_played, badges, points)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          'Aryan jaiswal',
          'aryanjaiswal2018@gmail.com',
          hash,
          '',
          42,
          ['Rookie', 'Team Player', 'Weekend Warrior'],
          1250,
        ],
      );
      console.log('✅ Seeded users');
    } else {
      console.log('⏭️  Users already seeded');
    }

    // ── Turfs ────────────────────────────────────────────────
    const { rowCount: turfCount } = await client.query('SELECT 1 FROM turfs LIMIT 1');
    if (!turfCount || turfCount === 0) {
      const turfs = [
        {
          name: 'National College Ground',
          sport: 'Basketball',
          location: 'VV.Puram, Bangalore',
          price: 50,
          rating: 4.8,
          images: [
            'https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/1040426/pexels-photo-1040426.jpeg?auto=compress&cs=tinysrgb&w=800',
          ],
          amenities: ['Air Conditioning', 'Changing Rooms', 'Parking', 'Refreshments'],
          available: true,
        },
        {
          name: 'Green Valley Football Field',
          sport: 'Football',
          location: 'Green Valley Sports Park Jayanagar,Bangalore',
          price: 75,
          rating: 4.6,
          images: [
            'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=800',
          ],
          amenities: ['Natural Grass', 'Floodlights', 'Equipment Storage'],
          available: true,
        },
        {
          name: 'City Tennis Courts',
          sport: 'Tennis',
          location: 'Central Park Tennis Center JP nagar,Bangalore',
          price: 40,
          rating: 4.7,
          images: [
            'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=800',
          ],
          amenities: ['Professional Courts', 'Equipment Rental', 'Coaching Available'],
          available: true,
        },
      ];

      for (const t of turfs) {
        await client.query(
          `INSERT INTO turfs (name, sport, location, price, rating, images, amenities, available)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [t.name, t.sport, t.location, t.price, t.rating, t.images, t.amenities, t.available],
        );
      }
      console.log('✅ Seeded turfs');
    } else {
      console.log('⏭️  Turfs already seeded');
    }

    // ── Matches ──────────────────────────────────────────────
    const { rowCount: matchCount } = await client.query('SELECT 1 FROM matches LIMIT 1');
    if (!matchCount || matchCount === 0) {
      const matches = [
        {
          sport: 'Basketball',
          date: '2025-01-15',
          time: '18:00',
          location: 'National College Ground',
          skill_level: 'Intermediate',
          players_needed: 8,
          current_players: 6,
          created_by: 'Aryan Jaiswal',
          participants: ['Saurav suman', 'Ayush Anand', 'om Tayal', 'Hitesh Nag', 'Tanmay Gupta', 'pushp Ranjan'],
        },
        {
          sport: 'Football',
          date: '2025-01-16',
          time: '19:30',
          location: 'Green Valley Football Field Jayanagar,Bangalore',
          skill_level: 'Pro',
          players_needed: 22,
          current_players: 18,
          created_by: 'Aditya Kaushik',
          participants: [],
        },
        {
          sport: 'Cricket',
          date: '2025-10-20',
          time: '15:30',
          location: 'Cricket Ground JP,Bangalore',
          skill_level: 'Pro',
          players_needed: 22,
          current_players: 18,
          created_by: 'Aaradhya Mehra',
          participants: [],
        },
        {
          sport: 'Badminton',
          date: '2025-10-25',
          time: '15:30',
          location: 'sports complex JP,Bangalore',
          skill_level: 'Intermediate',
          players_needed: 4,
          current_players: 2,
          created_by: 'Aman Raj',
          participants: [],
        },
      ];

      for (const m of matches) {
        await client.query(
          `INSERT INTO matches (sport, date, time, location, skill_level, players_needed, current_players, created_by, participants)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            m.sport, m.date, m.time, m.location, m.skill_level,
            m.players_needed, m.current_players, m.created_by, m.participants,
          ],
        );
      }
      console.log('✅ Seeded matches');
    } else {
      console.log('⏭️  Matches already seeded');
    }

    console.log('\n🎉 Seed complete!');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
