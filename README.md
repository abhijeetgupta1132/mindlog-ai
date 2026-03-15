# 🌿 MindLog AI — AI-Assisted Nature Journal

MindLog AI is a full-stack journaling platform that helps users reflect on their daily experiences while automatically analyzing emotional patterns using AI.

Users can write journal entries, select a nature ambience, and receive emotional insights generated using a large language model.

---

## 🔗 Live Demo

| | Link |
|---|---|
| 🌐 Frontend (Web App) | [https://mindlog-ai.vercel.app](https://mindlog-ai.vercel.app) |
| ⚙️ Backend API | [https://mindlog-ai-6s0s.onrender.com/api](https://mindlog-ai-6s0s.onrender.com/api) |
| 💻 Source Code | [GitHub Repository](https://github.com/abhijeetgupta1132/mindlog-ai) |

---

## 🚀 Features

- ✍️ Write daily journal entries
- 🌲 Choose ambience (Forest / Ocean / Mountain)
- 🤖 AI emotion analysis using Groq LLM
- 📊 Insights dashboard (top emotion, favourite ambience, keywords)
- ⚡ Real-time streaming AI analysis using Server-Sent Events (SSE)
- 🧠 AI response caching to reduce repeated LLM calls
- 🔒 Rate-limited API for stability
- 🐳 Docker + docker-compose setup

---

## 🏗 Tech Stack

| Layer           | Technology                        |
|-----------------|-----------------------------------|
| Frontend        | React                             |
| Backend         | Node.js + Express                 |
| Database        | SQLite (better-sqlite3)           |
| AI Model        | Groq API (llama-3.1-8b-instant)   |
| Caching         | node-cache (TTL 1 hour)           |
| Deployment      | Vercel + Render                   |
| Containerization| Docker                            |

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 20+
- npm
- Groq API Key (free at [https://console.groq.com](https://console.groq.com))

### Backend Setup
```bash
cd backend
cp .env.example .env
```

Add your API key inside `.env`:
```env
GROQ_API_KEY=your_api_key
```

Install dependencies and start server:
```bash
npm install
node server.js
```

Backend runs on: `http://localhost:3001`

---

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 🐳 Docker Setup

Run the full application with a single command:
```bash
GROQ_API_KEY=your_key docker-compose up --build
```

---

## 📡 API Reference

### Create Journal Entry
`POST /api/journal`

**Request body:**
```json
{
  "userId": "123",
  "ambience": "forest",
  "text": "I felt calm today."
}
```

---

### Get User Entries
`GET /api/journal/:userId`

Returns all journal entries for a specific user.

---

### Analyze Emotion
`POST /api/journal/analyze`

**Request body:**
```json
{
  "text": "I felt calm today.",
  "entryId": 5
}
```

**Response:**
```json
{
  "emotion": "calm",
  "keywords": ["rain", "nature", "peace"],
  "summary": "User experienced relaxation during the forest session"
}
```

---

### Streaming Emotion Analysis (SSE)
`POST /api/journal/analyze/stream`

Returns real-time emotion analysis using Server-Sent Events. The response streams token-by-token as the LLM generates output.

**Request body:**
```json
{
  "text": "I felt calm today.",
  "entryId": 5
}
```

**SSE Response stream:**
```
data: {"token": "The"}
data: {"token": " emotion"}
data: {"token": " detected"}
...
data: [DONE]
```

---

### Insights API
`GET /api/journal/insights/:userId`

**Example response:**
```json
{
  "totalEntries": 8,
  "topEmotion": "calm",
  "mostUsedAmbience": "forest",
  "recentKeywords": ["focus", "nature", "rain"]
}
```

---

## 📈 Future Improvements

- [ ] User authentication (JWT / OAuth)
- [ ] Emotion trend visualization dashboard
- [ ] AI reflection suggestions
- [ ] Mobile responsive design
- [ ] Persistent caching with Redis

---

## 👨‍💻 Author

**Abhijeet Gupta**  
Computer Engineering Graduate · Full-Stack Developer  
📧 abhijeetgupta1132@gmail.com  
🔗 [LinkedIn](https://linkedin.com/in/abhijeet-gupta-807876381) · [GitHub](https://github.com/abhijeetgupta1132)
