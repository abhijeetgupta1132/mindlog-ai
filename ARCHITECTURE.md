# Architecture Document — MindLog AI Journal System

## System Overview

```
[React Frontend] ──HTTP──▶ [Express API] ──▶ [SQLite DB]
                                │
                                ▼
                         [node-cache]
                                │ (miss)
                                ▼
                       [Groq LLM API]
                    (llama-3.1-8b-instant)
```

---

## 1. How would you scale this to 100,000 users?

### Database
- Replace SQLite with **PostgreSQL** (handles concurrent writes, connection pooling).
- Add indexes on `userId` and `createdAt` — already in place in this schema.
- Partition the `journal_entries` table by `userId` range or hash for horizontal scaling.

### Backend
- Containerize with Docker and deploy to **Kubernetes** (auto-scale pods under load).
- Move the Express server to a **stateless horizontally scalable** setup behind a load balancer (e.g. AWS ALB or Nginx).
- Use a **job queue** (BullMQ + Redis) to decouple emotion analysis from the write API — the POST /journal returns immediately, and analysis runs async.

### LLM calls
- Offload heavy analysis to background workers (separate Node.js processes consuming from the queue).
- This prevents the API from being blocked during Groq API latency.

### Caching
- Promote in-memory node-cache to a shared **Redis cluster** so all backend instances share the same cache.

### Frontend
- Deploy React build to a **CDN** (Cloudflare, AWS CloudFront). Static assets, zero server load.

---

## 2. How would you reduce LLM cost?

| Strategy | Saving |
|----------|--------|
| **Cache repeated inputs** | Avoid calling the API for the same text twice |
| **Batch analysis** | Analyze multiple short entries in one API call |
| **Prompt compression** | Use the shortest prompt that gets valid structured output |
| **Smaller model** | Use a lighter Groq model for simple emotion detection |
| **Skip re-analysis** | Never call LLM if `analyzed = 1` already on the entry |
| **User-triggered only** | Analysis only fires on explicit user action, not on every write |

---

## 3. How would you cache repeated analysis?

### Current implementation
`node-cache` with a 1-hour TTL. The cache key is a base64 hash of the lowercased, trimmed input text. This means identical or near-identical entries (e.g. same text, different user) hit the cache and return instantly.

### Production upgrade
- Move to **Redis** with a consistent hash of the text as key.
- Store: `analysis:{sha256(text)} → {emotion, keywords, summary}` with TTL = 24h.
- On write, store the result in the DB too — so even after cache eviction, re-reads are free.
- For very popular inputs (shared nature sounds), pre-warm the cache on deploy.

```
POST /analyze
  │
  ├─▶ Check Redis cache (hash of text)
  │       └─ HIT  ──▶ return immediately (fromCache: true)
  │       └─ MISS ──▶ Call Groq LLM ──▶ Store in Redis + DB
  └─▶ Return result
```

---

## 4. How would you protect sensitive journal data?

### Encryption at rest
- Encrypt the `text` column in the database using **AES-256** before insert; decrypt on read.
- Use a KMS (AWS KMS / HashiCorp Vault) to manage the encryption key — never hardcode it.

### Encryption in transit
- Enforce **HTTPS/TLS** everywhere. No plaintext over the wire.

### Authentication & Authorization
- Replace the current plain `userId` parameter with **JWT-based auth**.
- Middleware checks that `req.user.id === userId` on every journal endpoint — users can only see their own entries.

### Access control
- Role-based: only the owner can read/update/delete their entries.
- Admin role (if needed) has separate audited access.

### Data minimization
- Never log journal `text` content to application logs.
- Apply **PII scrubbing** before sending to third-party services if analytics are added.

### Compliance
- Implement **GDPR right-to-erasure**: DELETE all entries by userId on request.
- Maintain an audit log of who accessed what and when.
