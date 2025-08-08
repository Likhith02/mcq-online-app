const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  q: { type: String, required: true },
  opts: { type: [String], required: true },
  c: { type: Number, required: true },
  lang: { type: String },
  topic: { type: String },
  diff: { type: String },
  exp: { type: String },
});

module.exports = mongoose.model('Question', questionSchema);
