import mongoose from "mongoose";

// Define the schema for MCQ questions.
const QuestionSchema = new mongoose.Schema(
  {
    language: { type: String, index: true, required: true },
    topic: { type: String, index: true, required: true },
    difficulty: {
      type: String,
      index: true,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true },
    explanation: { type: String, default: "" },
    tags: [{ type: String, index: true }],
  },
  { timestamps: true }
);

// Export the model. Mongoose caches models, so calling model() multiple
// times with the same name will return the existing model.
export default mongoose.model("Question", QuestionSchema);
