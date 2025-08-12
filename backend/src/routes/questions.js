import { Router } from "express";
import { z } from "zod";
import Question from "../models/Question.js";

const router = Router();

// Define schema for validating query parameters using Zod.
const querySchema = z.object({
  language: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  seed: z.coerce.number().optional(),
});

// Simple deterministic PRNG for stable random ordering given a seed.
function seededRandom(seed) {
  let s = seed ?? 42;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

router.get("/", async (req, res, next) => {
  try {
    const q = querySchema.parse(req.query);
    const filter = {};
    if (q.language) filter.language = q.language;
    if (q.topic) filter.topic = q.topic;
    if (q.difficulty) filter.difficulty = q.difficulty;

    // Fetch all matching questions from the database.  In production we would
    // do this on the database side with aggregation and $sample, but for
    // simplicity we fetch and shuffle in memory.
    const docs = await Question.find(filter).lean().exec();
    const total = docs.length;

    // Stable shuffle
    const rand = seededRandom(q.seed);
    const shuffled = [...docs].sort(() => rand() - 0.5);
    const start = (q.page - 1) * q.limit;
    const items = shuffled.slice(start, start + q.limit);

    res.json({ page: q.page, limit: q.limit, total, items });
  } catch (err) {
    next(err);
  }
});

export default router;
