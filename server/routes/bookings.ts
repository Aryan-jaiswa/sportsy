import { Router, Request, Response, NextFunction } from 'express';
import pool from '../db.js';

const router = Router();

// POST /api/bookings — create a booking
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { turfId, userId, date, time } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO bookings (turf_id, user_id, date, time)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [turfId, userId ?? 1, date, time],
    );

    res.status(201).json({
      id: String(rows[0].id),
      turfId: String(rows[0].turf_id),
      userId: String(rows[0].user_id),
      date: rows[0].date,
      time: rows[0].time,
      status: rows[0].status,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
