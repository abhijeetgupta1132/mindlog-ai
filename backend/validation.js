const VALID_AMBIENCES = ["forest", "ocean", "mountain"];

function validateJournalInput({ userId, ambience, text }) {
  if (!userId || !ambience || !text) {
    return "userId, ambience, and text are required.";
  }

  if (!VALID_AMBIENCES.includes(ambience.toLowerCase())) {
    return `ambience must be one of: ${VALID_AMBIENCES.join(", ")}`;
  }

  if (text.trim().length < 5) {
    return "text is too short.";
  }

  return null;
}

module.exports = { VALID_AMBIENCES, validateJournalInput };
