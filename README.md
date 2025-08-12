# MCQ Online App

This is a modern rewrite of the original MCQ Online application. It features a clean REST API powered by Express and MongoDB and a mobile‑first React front‑end built with Vite. Users can practice multiple choice questions (MCQs) filtered by language, topic and difficulty, with infinite scrolling and instant feedback.

## Quick start

1. Clone or download this repository.
2. Copy `.env.example` to `.env` and fill in your database URI.
3. Install dependencies for backend and frontend:
```
cd backend
npm install

cd ../frontend
npm install
```
4. Run the backend with `npm run dev` in `backend` (API at http://localhost:8080).
5. Run the frontend with `npm run dev` in `frontend`.

## API

The backend exposes `GET /api/questions` with optional parameters `page`, `limit`, `language`, `topic`, `difficulty`, and `seed` for deterministic random order. It returns a paginated list of questions and the total count.

## Architecture

- **backend/** – Express server, MongoDB connection and models.
- **frontend/** – Vite + React app using TanStack Query and Zustand.

## License

MIT
