import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Log connection events in development
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Initialise database tables. Called once on server startup.
 * All statements are IF NOT EXISTS so re-running is safe.
 */
export async function initDB(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id              SERIAL PRIMARY KEY,
        name            VARCHAR(100) NOT NULL,
        email           VARCHAR(255) UNIQUE NOT NULL,
        password_hash   VARCHAR(255) NOT NULL,
        profile_picture TEXT DEFAULT '',
        games_played    INT DEFAULT 0,
        badges          TEXT[] DEFAULT '{}',
        points          INT DEFAULT 0,
        created_at      TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS turfs (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(200) NOT NULL,
        sport       VARCHAR(50) NOT NULL,
        location    VARCHAR(300) NOT NULL,
        price       NUMERIC(10,2) NOT NULL,
        rating      NUMERIC(3,2) DEFAULT 0,
        images      TEXT[] DEFAULT '{}',
        amenities   TEXT[] DEFAULT '{}',
        available   BOOLEAN DEFAULT TRUE,
        created_at  TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS matches (
        id              SERIAL PRIMARY KEY,
        sport           VARCHAR(50) NOT NULL,
        date            DATE NOT NULL,
        time            VARCHAR(10) NOT NULL,
        location        VARCHAR(300) NOT NULL,
        skill_level     VARCHAR(20) CHECK (skill_level IN ('Beginner','Intermediate','Pro')),
        players_needed  INT NOT NULL,
        current_players INT DEFAULT 1,
        created_by      VARCHAR(100) NOT NULL,
        participants    TEXT[] DEFAULT '{}',
        created_at      TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id         SERIAL PRIMARY KEY,
        turf_id    INT REFERENCES turfs(id) ON DELETE CASCADE,
        user_id    INT REFERENCES users(id) ON DELETE CASCADE,
        date       DATE NOT NULL,
        time       VARCHAR(10) NOT NULL,
        status     VARCHAR(20) DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS messages (
        id         SERIAL PRIMARY KEY,
        match_id   VARCHAR(50) NOT NULL,
        user_id    VARCHAR(50) NOT NULL,
        user_name  VARCHAR(100) NOT NULL,
        message    TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Database tables initialised');
  } finally {
    client.release();
  }
}

export default pool;
