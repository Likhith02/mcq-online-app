require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Question = require('./models/Question');
const Score = require('./models/Score');

const app = express();
app.use(express.json());
app.use(cors()); // allow all; tighten with origin later

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev_token';
const DB_NAME = 'mcq';

mongoose.connect(MONGODB_URI, { dbName: DB_NAME })
  .then(()=> console.log('Mongo connected'))
  .catch(e=> { console.error('Mongo error', e); process.exit(1); });

// GET /api/questions?page=1&limit=20&lang=&topic=&diff=
app.get('/api/questions', async (req, res) => {
  const { page=1, limit=20, lang, topic, diff } = req.query;
  const q = {};
  if (lang) q.lang = lang;
  if (topic) q.topic = topic;
  if (diff) q.diff = diff;
  const skip = (Math.max(1, +page)-1) * Math.min(100, +limit);
  const items = await Question.find(q).skip(skip).limit(Math.min(100, +limit));
  const total = await Question.countDocuments(q);
  res.json({ items, total, page:+page, limit:+limit });
});

// POST /api/questions/bulk  (admin)
app.post('/api/questions/bulk', async (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) return res.status(401).send('Unauthorized');
  const arr = req.body;
  if (!Array.isArray(arr)) return res.status(400).send('Array required');
  await Question.deleteMany({});
  await Question.insertMany(arr);
  res.json({ inserted: arr.length });
});

// POST /api/score  { name, xp, best }
app.post('/api/score', async (req, res) => {
  const { name, xp=0, best=0 } = req.body || {};
  if (!name) return res.status(400).send('name required');
  const doc = await Score.findOneAndUpdate(
    { name },
    { $max: { best }, $set: { name }, $inc: { xp } },
    { upsert: true, new: true }
  );
  res.json(doc);
});

// GET /api/leaderboard?by=best|xp&limit=25
app.get('/api/leaderboard', async (req, res) => {
  const by = req.query.by === 'xp' ? 'xp' : 'best';
  const limit = Math.min(50, +(req.query.limit || 25));
  const rows = await Score.find().sort({ [by]: -1 }).limit(limit);
  res.json(rows.map(r => ({ name: r.name, xp: r.xp, best: r.best })));
});

app.listen(PORT, () => console.log('API on :' + PORT));

