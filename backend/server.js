require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const { analyzeEmotion } = require('./llm');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// ── Rate Limiting (bonus feature) ──
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});

const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10,
  message: { error: 'Analysis rate limit reached. Wait a minute.' }
});

app.use('/api/', generalLimiter);
app.use('/api/journal/analyze', analyzeLimiter);

// ── Health Check ──
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── POST /api/journal ── Create entry
app.post('/api/journal', (req, res) => {
  const { userId, ambience, text } = req.body;

  if (!userId || !ambience || !text) {
    return res.status(400).json({ error: 'userId, ambience, and text are required.' });
  }

  const validAmbiences = ['forest', 'ocean', 'mountain'];
  if (!validAmbiences.includes(ambience.toLowerCase())) {
    return res.status(400).json({ error: `ambience must be one of: ${validAmbiences.join(', ')}` });
  }

  if (text.trim().length < 5) {
    return res.status(400).json({ error: 'text is too short.' });
  }

  const stmt = db.prepare(
    'INSERT INTO journal_entries (userId, ambience, text) VALUES (?, ?, ?)'
  );
  const result = stmt.run(userId.toString(), ambience.toLowerCase(), text.trim());

  const entry = db.prepare('SELECT * FROM journal_entries WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(entry);
});

// ── GET /api/journal/:userId ── Get all entries
app.get('/api/journal/:userId', (req, res) => {
  const { userId } = req.params;
  const entries = db.prepare(
    'SELECT * FROM journal_entries WHERE userId = ? ORDER BY createdAt DESC'
  ).all(userId);

  res.json(entries.map(e => ({
    ...e,
    keywords: e.keywords ? JSON.parse(e.keywords) : null,
    analyzed: Boolean(e.analyzed)
  })));
});

// ── POST /api/journal/analyze ── Analyze emotion (standalone)
app.post('/api/journal/analyze', async (req, res) => {
  const { text, entryId } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'text is required.' });
  }

  try {
    const result = await analyzeEmotion(text);

    // If an entryId is provided, persist the analysis
    if (entryId) {
      db.prepare(`
        UPDATE journal_entries
        SET emotion = ?, keywords = ?, summary = ?, analyzed = 1
        WHERE id = ?
      `).run(result.emotion, JSON.stringify(result.keywords), result.summary, entryId);
    }

    res.json(result);
  } catch (err) {
    console.error('Analyze error:', err.message);
    res.status(500).json({ error: 'LLM analysis failed.', detail: err.message });
  }
});

// ── POST /api/journal/analyze/stream ── Streaming emotion analysis (bonus)
app.post('/api/journal/analyze/stream', async (req, res) => {
  const { text, entryId } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required.' });

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const { analyzeEmotionStream } = require('./llm');
    let fullText = '';

    await analyzeEmotionStream(text, (chunk) => {
      fullText += chunk;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

    // Parse final JSON from accumulated text
    let result;
    try {
      const match = fullText.match(/\{[\s\S]*\}/);
      result = JSON.parse(match ? match[0] : fullText);
    } catch {
      result = { emotion: 'unknown', keywords: [], summary: fullText };
    }

    // Persist to DB if entryId provided
    if (entryId && result.emotion) {
      db.prepare(`UPDATE journal_entries SET emotion=?, keywords=?, summary=?, analyzed=1 WHERE id=?`)
        .run(result.emotion, JSON.stringify(result.keywords || []), result.summary || '', entryId);
    }

    res.write(`data: ${JSON.stringify({ done: true, result })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Stream error:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// ── GET /api/journal/insights/:userId ── Aggregated insights
app.get('/api/journal/insights/:userId', (req, res) => {
  const { userId } = req.params;

  const totalEntries = db.prepare(
    'SELECT COUNT(*) as count FROM journal_entries WHERE userId = ?'
  ).get(userId).count;

  if (totalEntries === 0) {
    return res.json({ totalEntries: 0, topEmotion: null, mostUsedAmbience: null, recentKeywords: [] });
  }

  const topEmotionRow = db.prepare(`
    SELECT emotion, COUNT(*) as cnt FROM journal_entries
    WHERE userId = ? AND emotion IS NOT NULL
    GROUP BY emotion ORDER BY cnt DESC LIMIT 1
  `).get(userId);

  const mostUsedAmbienceRow = db.prepare(`
    SELECT ambience, COUNT(*) as cnt FROM journal_entries
    WHERE userId = ?
    GROUP BY ambience ORDER BY cnt DESC LIMIT 1
  `).get(userId);

  // Collect keywords from the 10 most recent analyzed entries
  const recentEntries = db.prepare(`
    SELECT keywords FROM journal_entries
    WHERE userId = ? AND keywords IS NOT NULL
    ORDER BY createdAt DESC LIMIT 10
  `).all(userId);

  const keywordFreq = {};
  recentEntries.forEach(entry => {
    const kws = JSON.parse(entry.keywords);
    kws.forEach(kw => {
      keywordFreq[kw] = (keywordFreq[kw] || 0) + 1;
    });
  });

  const recentKeywords = Object.entries(keywordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([kw]) => kw);

  res.json({
    totalEntries,
    topEmotion: topEmotionRow?.emotion || null,
    mostUsedAmbience: mostUsedAmbienceRow?.ambience || null,
    recentKeywords
  });
});

app.listen(PORT, () => console.log(`MindLog AI backend running on http://localhost:${PORT}`));
