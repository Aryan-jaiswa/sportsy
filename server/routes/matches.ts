import { Router, Request, Response, NextFunction } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/matches — all upcoming matches
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM matches ORDER BY date ASC, time ASC',
    );
    res.json(rows.map(mapMatch));
  } catch (err) {
    next(err);
  }
});

// POST /api/matches — create a new match
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      sport,
      date,
      time,
      location,
      skillLevel,
      playersNeeded,
      currentPlayers,
      createdBy,
      participants,
    } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO matches
        (sport, date, time, location, skill_level, players_needed, current_players, created_by, participants)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        sport,
        date,
        time,
        location,
        skillLevel,
        playersNeeded,
        currentPlayers ?? 1,
        createdBy,
        participants ?? [],
      ],
    );

    res.status(201).json(mapMatch(rows[0]));
  } catch (err) {
    next(err);
  }
});

// POST /api/matches/:id/join — join an existing match
router.post('/:id/join', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matchId = req.params.id;
    const { userId } = req.body;

    // Add participant and increment current_players
    const { rows } = await pool.query(
      `UPDATE matches
       SET participants    = array_append(participants, $1),
           current_players = current_players + 1
       WHERE id = $2 AND current_players < players_needed
       RETURNING *`,
      [userId, matchId],
    );

    if (rows.length === 0) {
      res.status(400).json({ error: 'Match is full or not found' });
      return;
    }

    res.json(mapMatch(rows[0]));
  } catch (err) {
    next(err);
  }
});

/** Map DB snake_case row to camelCase frontend shape */
function mapMatch(row: any) {
  return {
    id: String(row.id),
    sport: row.sport,
    date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date,
    time: row.time,
    location: row.location,
    skillLevel: row.skill_level,
    playersNeeded: row.players_needed,
    currentPlayers: row.current_players,
    createdBy: row.created_by,
    participants: row.participants ?? [],
  };
}

export default router;
