const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'journal.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    ambience TEXT NOT NULL,
    text TEXT NOT NULL,
    emotion TEXT,
    keywords TEXT,
    summary TEXT,
    analyzed INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_userId ON journal_entries(userId);
`);

module.exports = db;
