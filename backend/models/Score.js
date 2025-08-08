const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  xp: { type: Number, default: 0 },
  best: { type: Number, default: 0 },
});

module.exports = mongoose.model('Score', scoreSchema);
