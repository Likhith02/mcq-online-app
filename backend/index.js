const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const Question = require('./models/Question');
const Score = require('./models/Score');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'changeme';

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Fetch paginated questions with optional filters
app.get('/api/questions', async (req, res) => {
  try {
    const { page = 1, limit = 20, lang, topic, diff } = req.query;
    const query = {};
    if (lang) query.lang = lang;
    if (topic) query.topic = topic;
    if (diff) query.diff = diff;

    const questions = await Question.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk insert or replace questions (admin only)
app.post('/api/questions/bulk', async (req, res) => {
  if (req.headers['x-admin-token'] !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Body must be an array' });
    }
    // replace existing questions
    await Question.deleteMany({});
    await Question.insertMany(items);
    res.json({ inserted: items.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit or update score
app.post('/api/score', async (req, res) => {
  try {
    const { name, xp, best } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name required' });
    }
    let score = await Score.findOne({ name });
    if (!score) {
      score = new Score({ name, xp: xp || 0, best: best || 0 });
    } else {
      // update xp and best if greater
      score.xp = Math.max(score.xp, xp || 0);
      score.best = Math.max(score.best, best || 0);
    }
    await score.save();
    res.json(score);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { sort = 'xp', limit = 10 } = req.query;
    const sortField = sort === 'best' ? 'best' : 'xp';
    const scores = await Score.find().sort({ [sortField]: -1 }).limit(parseInt(limit));
    res.json(scores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('MCQ Reels API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
