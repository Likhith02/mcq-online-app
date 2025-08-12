const BASE = import.meta.env.VITE_API_BASE;

export async function fetchQuestions({ page = 1, limit = 20, language, topic, difficulty, seed }) {
  const params = new URLSearchParams({ page, limit });
  if (language) params.set("language", language);
  if (topic) params.set("topic", topic);
  if (difficulty) params.set("difficulty", difficulty);
  if (seed) params.set("seed", seed);
  const response = await fetch(`${BASE}/api/questions?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch questions");
  return response.json();
}
