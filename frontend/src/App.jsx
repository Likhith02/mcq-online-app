import { useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider, useInfiniteQuery } from "@tanstack/react-query";
import { fetchQuestions } from "./lib/api.js";
import { useFilters } from "./store/useFilters.js";

// Create a QueryClient instance outside of the component so it's stable
const qc = new QueryClient();

function Feed() {
  const { language, topic, difficulty, seed } = useFilters();
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["questions", { language, topic, difficulty, seed }],
    queryFn: ({ pageParam = 1 }) =>
      fetchQuestions({
        page: pageParam,
        limit: 20,
        language,
        topic,
        difficulty,
        seed,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const fetched = allPages.reduce((n, p) => n + p.items.length, 0);
      return fetched < lastPage.total ? allPages.length + 1 : undefined;
    },
  });

  // Set up infinite scroll with IntersectionObserver
  const sentinel = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "600px" }
    );
    if (sentinel.current) observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError) return <div className="p-6">Failed to load.</div>;

  return (
    <div className="min-h-screen max-w-md mx-auto p-4 space-y-4">
      {data?.pages
        ?.flatMap((p) => p.items)
        .map((q, i) => (
          <Card key={q._id ?? i} q={q} />
        ))}
      <div ref={sentinel} />
      {!hasNextPage && (
        <div className="text-center text-sm py-8 opacity-70">
          You’ve reached the end 🎉
        </div>
      )}
    </div>
  );
}

function Card({ q }) {
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState(null);

  return (
    <div className="rounded-2xl shadow p-4 bg-white">
      <div className="text-xs opacity-70 mb-2">
        {q.language} • {q.topic} • {q.difficulty}
      </div>
      <button
        className="w-full text-left text-lg mb-3"
        onClick={() => setRevealed((v) => !v)}
      >
        {revealed ? q.question : "Tap to reveal the question"}
      </button>
      {revealed && (
        <div className="space-y-2">
          {q.options.map((opt, idx) => {
            const isCorrect = idx === q.correctIndex;
            const isWrongPick = picked === idx && !isCorrect;
            return (
              <button
                key={idx}
                onClick={() => setPicked(idx)}
                className={`w-full text-left border rounded-xl px-3 py-2 ${
                  picked !== null && isCorrect
                    ? "bg-green-100 border-green-400"
                    : ""
                } ${isWrongPick ? "bg-red-100 border-red-400" : ""}`}
              >
                {opt}
              </button>
            );
          })}
          {picked !== null && q.explanation && (
            <div className="text-sm mt-2 p-3 bg-gray-50 rounded-xl">
              {q.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Filters() {
  const { setFilter } = useFilters();
  return (
    <div className="max-w-md mx-auto p-4 grid grid-cols-3 gap-2">
      <input
        placeholder="Language"
        onChange={(e) => setFilter("language", e.target.value)}
        className="border rounded-xl px-3 py-2"
      />
      <input
        placeholder="Topic"
        onChange={(e) => setFilter("topic", e.target.value)}
        className="border rounded-xl px-3 py-2"
      />
      <select
        onChange={(e) => setFilter("difficulty", e.target.value)}
        className="border rounded-xl px-3 py-2"
      >
        <option value="">Any</option>
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
      </select>
    </div>
  );
}

function Root() {
  return (
    <QueryClientProvider client={qc}>
      <div className="bg-gradient-to-b from-white to-slate-100 min-h-screen">
        <h1 className="text-2xl font-semibold text-center py-4">MCQ Online</h1>
        <Filters />
        <Feed />
      </div>
    </QueryClientProvider>
  );
}

export default Root;
