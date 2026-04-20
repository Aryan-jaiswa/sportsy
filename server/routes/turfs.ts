import { Router, Request, Response, NextFunction } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/turfs — all turfs
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM turfs ORDER BY created_at DESC',
    );
    res.json(rows.map(mapTurf));
  } catch (err) {
    next(err);
  }
});

// GET /api/turfs/featured — featured turfs (top rated, available)
router.get('/featured', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM turfs WHERE available = TRUE ORDER BY rating DESC LIMIT 6',
    );
    res.json(rows.map(mapTurf));
  } catch (err) {
    next(err);
  }
});

// GET /api/turfs/:id — single turf
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query('SELECT * FROM turfs WHERE id = $1', [
      req.params.id,
    ]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Turf not found' });
      return;
    }
    res.json(mapTurf(rows[0]));
  } catch (err) {
    next(err);
  }
});

/** Map DB snake_case row to camelCase frontend shape */
function mapTurf(row: any) {
  return {
    id: String(row.id),
    name: row.name,
    sport: row.sport,
    location: row.location,
    price: Number(row.price),
    rating: Number(row.rating),
    images: row.images ?? [],
    amenities: row.amenities ?? [],
    available: row.available,
  };
}

export default router;
