require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');
const data = require('./data/questions.json');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await Question.deleteMany({});
    await Question.insertMany(data);
    console.log('Seeded questions');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
