# HR Platform — AI-powered HR & Recruitment Platform

AI-powered full-stack HR & recruitment platform.

## Project Overview

This repository contains a full-stack HR management application with features to manage users, candidates, interviews, job openings, leave requests, reports, and CV uploads and scoring. It includes an AI-powered RAG pipeline for CV scoring and an interview chatbot (Ollama + Chroma) used to extract, embed, retrieve, and evaluate CVs.

- Backend: Node.js + Express, MongoDB (Mongoose), JWT authentication, optional Chroma client for embeddings.
- Frontend: React (Create React App) + Tailwind CSS.
- File uploads stored in `uploads/`, CV text extraction in `utils/cvTextExtractor.js`, Chroma client in `utils/chromaClient.js`.

## Quick Links

- Backend entry: [backend/server.js](backend/server.js#L1)
- Backend routes: [backend/routes](backend/routes)
- Models: [backend/models](backend/models)
- Frontend entry: [frontend/src/App.js](frontend/src/App.js#L1)
- Frontend config: [frontend/src/config/api.js](frontend/src/config/api.js#L1)
- Local Chroma DB: `chroma/`
- Credentials file to remove before publishing: [HRmanager password.txt](HRmanager%20password.txt#L1)
- Existing frontend README: [frontend/README.md](frontend/README.md#L1)

## Features

- Authentication (register / login) with JWT
- Candidate CRUD and CV upload
- Interview scheduling and chat support
- Job openings management
- Leave requests management
- Reporting (admin dashboards)
- CV parsing and optional embedding/indexing with Chroma

## Tech Stack

- Node.js, Express
- MongoDB (Mongoose)
- React (Create React App)
- Tailwind CSS
- Chroma (optional) for vector embeddings

## AI Features

This project includes an optional AI stack used for CV scoring and an interview chatbot. It implements a Retrieval-Augmented Generation (RAG) pattern: CVs are converted to text, chunked, embedded, stored in a Chroma vector collection, and retrieved to provide context for a local LLM which returns structured evaluations.

- Core components:
  - Embeddings & generation: local Ollama server (or other embeddings/LLM provider).
  - Vector DB: Chroma (vector store) with a collection named `candidates_cv`.
  - Ingestion & retrieval: `backend/utils/chromaClient.js` handles chunking, embedding, storage, and queries.
  - Frontend UI: `frontend/src/components/CVScorer.jsx` (CV scoring) and `frontend/src/components/InterviewChatbot.jsx` (chatbot/assistant).

- Typical AI flow:
  1. `CV file -> text extraction -> chunking`
  2. `chunk -> get embedding (Ollama) -> store in Chroma (candidates_cv)`
  3. On score request: embed job/query, retrieve nearest candidate chunks, send fragments + job description to the LLM for a strict JSON score
  4. Backend parses JSON, saves results and returns a human-friendly breakdown to the frontend

- Important environment variables (backend `.env`):
  - `OLLAMA_URL` — base URL for local Ollama (default: `http://127.0.0.1:11434`)
  - `OLLAMA_EMBED_MODEL` — embedding model name used by Ollama
  - `CHROMA_URL` — Chroma server address (default: `http://127.0.0.1:8000`)
  - `CHROMA_COLLECTION` — (optional) collection name, default `candidates_cv`

- Helpful endpoints:
  - `POST /api/embeddings` — embeddings endpoint (proxy to Ollama or embedding service)
  - `POST /api/candidates/:id/score` — run full CV scoring for a candidate
  - `GET /api/health/ai` — checks Ollama + Chroma availability

- Running the local AI stack (developer):
  1. Start Chroma (example): `chroma run --host 127.0.0.1 --port 8000`
  2. Start Ollama locally and ensure `/api/embeddings` and `/api/generate` are available
  3. Set `OLLAMA_URL`, `OLLAMA_EMBED_MODEL`, and `CHROMA_URL` in backend `.env`
  4. Use the CV Scorer UI or call `/api/candidates/:id/score` to ingest and score CVs

See `backend/AI_COMPLETE_GUIDE_PFE.md` and `backend/AI_RAG_explained.md` for implementation details and troubleshooting tips.

## Environment Variables

Create a `.env` file for the backend with at least:

```
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
CHROMA_HOST=127.0.0.1
CHROMA_PORT=8000
```

Do not commit `.env` to source control.

## Run Locally

Backend

```bash
cd backend
npm install
# create .env with required variables
node server.js
```

Frontend

```bash
cd frontend
npm install
npm start
```

Open the frontend at `http://localhost:3000` and backend at the configured `PORT` (default 5000).

## Example API Request

Login example:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hr.com","password":"admin123"}'
```

## Build & Deploy

- Frontend: `npm run build` inside `frontend` then deploy the `build/` folder to Vercel/Netlify/GitHub Pages.
- Backend: deploy to Render / Railway / Heroku. Use `node server.js` (or define `start` script) and set environment variables in the platform.
- If using MongoDB Atlas, set `MONGO_URI` accordingly and secure network access.

## Security & Publishing Checklist (READ THIS BEFORE PUSH)

- Remove any secret files from the repository. The file [HRmanager password.txt](HRmanager%20password.txt#L1) currently contains credentials — delete it and add it to `.gitignore`.
- Move secrets into `.env` and never commit `.env`.
- Rotate/update any exposed passwords immediately.
- If secrets were already pushed, purge them from git history with `git filter-repo` or BFG and force-push the cleaned history.

## API Endpoints (summary)

- `POST /api/auth/login` — authenticate user
- `POST /api/auth/register` — create user
- `/api/candidates` — candidate CRUD and CV upload
- `/api/interviews` — interview endpoints
- `/api/jobs` — job openings
- `/api/leaverequests` — leave requests
- `/api/reports` — reports
- `/api/contact` — contact form

(See `backend/routes/` for full endpoints.)

## Contributing

- Fork the repo, create a feature branch, open a pull request with a clear description.
- Run linters/tests before submitting.

## Screenshots & Demo

Add screenshots or a short demo video in `frontend/public/images/` and link them here. Consider adding a `docs/` folder for screenshots and deployment notes.

## License

Add a `LICENSE` file to this repo (MIT suggested for permissive reuse).

---

If you want, I can also:

- Remove `HRmanager password.txt` from the repo and add `.env.example` with required variables.
- Create a short `frontend` demo GIF and add it to `frontend/public/images/`.

Tell me which follow-up action you want next.
