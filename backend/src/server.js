import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { connectDB } from "./db.js";
import questionsRoute from "./routes/questions.js";

const app = express();

// Apply basic middlewares for security and JSON parsing.
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 120,
  })
);

// Health check endpoint.
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Register routes.
app.use("/api/questions", questionsRoute);

// Generic error handler.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// Start the server once the DB is connected.
const PORT = process.env.PORT || 8080;
const uri = process.env.MONGODB_URI;
connectDB(uri)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
