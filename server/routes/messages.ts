import { Router, Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '../db.js';

const router = Router();

// GET /api/messages/:matchId — get messages for a match
router.get('/:matchId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM messages WHERE match_id = $1 ORDER BY created_at ASC',
      [req.params.matchId],
    );
    res.json(rows.map(mapMessage));
  } catch (err) {
    next(err);
  }
});

// POST /api/messages — send a message
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { matchId, userId, userName, message } = req.body;

    const { rows: userRows } = await pool.query(
      `INSERT INTO messages (match_id, user_id, user_name, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [matchId, userId, userName, message],
    );

    const userMessage = mapMessage(userRows[0]);

    if (matchId === 'ai_assistant') {
      try {
        const apiKey = process.env.GEMINI_API_KEY || '';
        if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
          throw new Error('Valid GEMINI_API_KEY is not set in environment variables');
        }
        
        const genAI = new GoogleGenerativeAI(apiKey);
        // Using gemini-2.5-flash as it is the currently available model for the new API key
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        // Fetch last 5 messages for context
        const { rows: historyRows } = await pool.query(
          'SELECT * FROM (SELECT * FROM messages WHERE match_id = $1 ORDER BY created_at DESC LIMIT 5) sub ORDER BY created_at ASC',
          [matchId]
        );
        
        let promptContext = 'Recent chat history:\\n';
        historyRows.forEach(row => {
          promptContext += `${row.user_name}: ${row.message}\\n`;
        });

        const systemPrompt = `You are Sportsy AI. You help users with:
- Finding nearby sports turfs
- Suggesting matches and teams
- Giving fitness and sports advice

Keep answers:
- Short (2-4 lines)
- Friendly
- Actionable

If user asks unrelated things, gently redirect to sports.`;

        const prompt = `${systemPrompt}\\n\\n${promptContext}\\nUser says: ${message}`;
        
        let result;
        let retries = 5;
        while (retries > 0) {
          try {
            result = await model.generateContent(prompt);
            break; // Success!
          } catch (apiErr: any) {
            console.error(`Gemini API Error (retries left: ${retries - 1}):`, apiErr.message);
            retries--;
            if (retries === 0) throw apiErr; // Give up
            // Wait 2 seconds before retrying to let Google servers recover
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        
        const aiResponseText = result.response.text();

        const { rows: aiRows } = await pool.query(
          `INSERT INTO messages (match_id, user_id, user_name, message)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [matchId, 'gemini-bot', 'Sportsy AI', aiResponseText],
        );
        
        const aiMessage = mapMessage(aiRows[0]);
        res.status(201).json([userMessage, aiMessage]);
        return;
      } catch (err) {
        console.error('Gemini API Error:', err);
        
        // Fallback message requested by user
        const fallbackText = "Sorry, I'm having trouble responding right now.";
        
        const { rows: fallbackRows } = await pool.query(
          `INSERT INTO messages (match_id, user_id, user_name, message)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [matchId, 'gemini-bot', 'Sportsy AI', fallbackText],
        );
        
        const fallbackMessage = mapMessage(fallbackRows[0]);
        res.status(201).json([userMessage, fallbackMessage]);
        return;
      }
    }

    res.status(201).json(userMessage);
  } catch (err) {
    next(err);
  }
});

/** Map DB row to frontend shape */
function mapMessage(row: any) {
  return {
    id: String(row.id),
    matchId: row.match_id,
    userId: row.user_id,
    userName: row.user_name,
    message: row.message,
    timestamp: row.created_at?.toISOString?.() ?? row.created_at,
  };
}

export default router;
