import "dotenv/config";
import { connectDB } from "../src/db.js";
import Question from "../src/models/Question.js";

// Sample seed data.  You can replace this with your own questions or
// write a CSV/JSON importer to load a larger dataset.
const sample = [
  {
    language: "Python",
    topic: "Basics",
    difficulty: "Easy",
    question: "What is the output of 2 ** 3?",
    options: ["4", "6", "8", "9"],
    correctIndex: 2,
    explanation: "The ** operator performs exponentiation in Python.",
  },
  {
    language: "JavaScript",
    topic: "Arrays",
    difficulty: "Medium",
    question: "Which method adds one or more elements to the end of an array and returns the new length?",
    options: ["push()", "pop()", "shift()", "unshift()"],
    correctIndex: 0,
    explanation: "Array.prototype.push() adds elements to the end of an array.",
  },
  {
    language: "Java",
    topic: "OOP",
    difficulty: "Hard",
    question: "Which keyword is used to inherit a class in Java?",
    options: ["implements", "inherits", "extends", "super"],
    correctIndex: 2,
    explanation: "In Java, a class inherits another class using the extends keyword.",
  },
];

(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    await Question.deleteMany({});
    await Question.insertMany(sample);
    console.log(`Seeded ${sample.length} questions.`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
