import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_sportsy_app';

// GET /api/users/:id — get user profile
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, profile_picture, games_played, badges, points FROM users WHERE id = $1',
      [req.params.id],
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(mapUser(rows[0]));
  } catch (err) {
    next(err);
  }
});

// POST /api/users/signup — create new user and return token
router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    // Check if user exists
    const existing = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (existing.rowCount && existing.rowCount > 0) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    const hash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, email, hash],
    );

    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user: mapUser(user), token });
  } catch (err) {
    next(err);
  }
});

// POST /api/users/login — login and return token
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );

    if (rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: mapUser(user), token });
  } catch (err) {
    next(err);
  }
});

/** Map DB row to frontend shape (never expose password_hash) */
function mapUser(row: any) {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    profilePicture: row.profile_picture ?? '',
    gamesPlayed: row.games_played ?? 0,
    badges: row.badges ?? [],
    points: row.points ?? 0,
  };
}

export default router;
