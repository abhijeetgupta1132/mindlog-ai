# MindLog AI — AI-Assisted Journal System

A full-stack journaling app that uses AI to analyze emotions from nature-immersion session entries.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Node.js + Express                   |
| Frontend  | React                               |
| Database  | SQLite (via better-sqlite3)         |
| LLM       | Groq API (llama-3.1-8b-instant)     |
| Caching   | node-cache (in-memory, TTL 1hr)     |

## Features

- ✅ Create journal entries with ambience (forest / ocean / mountain)
- ✅ View all entries per user with emotion tags
- ✅ Real-time streaming LLM emotion analysis (SSE)
- ✅ Insights API (top emotion, favourite ambience, recent keywords)
- ✅ Analysis caching (avoids repeat LLM calls)
- ✅ Rate limiting
- ✅ Docker + docker-compose setup

## Getting Started

### Prerequisites
- Node.js 20+
- npm
- Groq API key (free at console.groq.com)

### Backend

```bash
cd backend
cp .env.example .env
# Add your GROQ_API_KEY in .env
npm install
node server.js
# Runs on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

### Docker

```bash
GROQ_API_KEY=your_key docker-compose up --build
```

## API Reference

### POST /api/journal
Create a journal entry.
```json
{ "userId": "123", "ambience": "forest", "text": "I felt calm today." }
```

### GET /api/journal/:userId
Returns all entries for a user.

### POST /api/journal/analyze
Analyze emotion from text.
```json
{ "text": "I felt calm today.", "entryId": 5 }
```
Response:
```json
{
  "emotion": "calm",
  "keywords": ["rain", "nature", "peace"],
  "summary": "User experienced relaxation during the forest session"
}
```

### POST /api/journal/analyze/stream
Streaming version — returns SSE chunks.

### GET /api/journal/insights/:userId
Returns aggregated mental wellness insights.
```json
{
  "totalEntries": 8,
  "topEmotion": "calm",
  "mostUsedAmbience": "forest",
  "recentKeywords": ["focus", "nature", "rain"]
}
```
