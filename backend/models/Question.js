const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
  q: { type: String, required: true },
  opts: { type: [String], required: true },
  c: { type: Number, required: true },
  lang: String, topic: String, diff: String, exp: String,
});
module.exports = mongoose.model('Question', questionSchema);
