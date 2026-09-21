# RAG Driver Assistant

Next.js frontend for the RAG Driver Assistant. It talks to the existing FastAPI RAG backend over HTTP and attaches a backend-issued JWT to protected requests.

```
Next.js frontend
        |
        | HTTP + Authorization: Bearer <JWT>
        v
FastAPI RAG backend
        |
        +---- PostgreSQL + pgvector
        +---- RAG retrieval
        +---- Hugging Face LLM Space
```

This app does **not** mint JWTs, store fake users, or mock the RAG API. Authentication tokens must come from the backend.

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

## Local setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the FastAPI backend on that URL, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated visits go to `/login`; after a valid JWT is stored, `/chat` loads.

## Environment variables

Only frontend-safe, public values belong here. Prefix browser-visible variables with `NEXT_PUBLIC_`.

| Variable | Purpose | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | FastAPI origin (no trailing slash) | `http://localhost:8000` |

Production (set in the host, do not commit):

```bash
NEXT_PUBLIC_API_URL=https://<render-backend>.onrender.com
```

Do **not** put backend secrets in this repo:

- `DATABASE_URL`
- `JWT_SECRET`
- Hugging Face tokens
- Postgres passwords

Those stay on the FastAPI service (for example Render).

## Authentication architecture

The RAG API currently expects:

```
Authorization: Bearer <JWT>
```

and reads the user id from the JWT `sub` (or `id`) claim. It does **not** currently expose signup/login routes in `server.py`.

This frontend is wired to the contract:

- `POST /auth/register` `{ email, password, name }`
- `POST /auth/login` `{ email, password }`

Expected response (field names are normalized if the backend uses `token` instead of `access_token`):

```json
{
  "access_token": "...",
  "token_type": "bearer",
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

**Frontend auth UI is ready, but the backend currently needs registration/login endpoints that issue JWTs.** Until those exist, login/signup will show a clear API error instead of a fake client-side success.

### Token storage

The FastAPI service does not set HttpOnly auth cookies; it only accepts bearer tokens. The JWT is therefore kept in `localStorage`, isolated behind `lib/auth/storage.ts` (`authStorage.getToken()` / `setToken()` / `removeToken()`). UI code must not touch `localStorage` directly.

Security tradeoff: a token in `localStorage` is readable by JavaScript on this origin, so XSS is in scope. Do not put JWTs in URLs or logs. Prefer HttpOnly cookies later if the backend adds cookie sessions.

Logout is client-side: it clears the stored token and user, then sends the browser to `/login`. A backend logout route can be added later without changing the UI.

### Route protection

- `/login` and `/signup` are guest-only.
- `/chat` and `/chat/[sessionId]` require a restored session.
- The FastAPI backend still authorizes every protected endpoint. The UI check is not a security boundary.

On HTTP 401, the client clears the stored token and returns the user to `/login`.

## Backend API used by chat

These routes already exist on the RAG FastAPI app:

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/sessions` | Create a chat session |
| `GET` | `/sessions` | List the current user's sessions |
| `GET` | `/sessions/{session_id}` | Session metadata |
| `DELETE` | `/sessions/{session_id}` | Delete a session |
| `GET` | `/sessions/{session_id}/messages?limit=50` | Load messages |
| `POST` | `/sessions/{session_id}/messages` | Send a user message and receive the assistant reply |

Send-message body (matches the FastAPI model):

```json
{
  "message": "Why is my engine overheating?",
  "car_context": "",
  "use_user_manual": true
}
```

## Production configuration

1. Deploy FastAPI (for example Render) and set `JWT_SECRET` there.
2. Add `POST /auth/register` and `POST /auth/login` (or point this client at the real auth paths if they differ).
3. Deploy this Next.js app with `NEXT_PUBLIC_API_URL` set to the public FastAPI origin.
4. Confirm CORS on FastAPI allows the frontend origin.

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint
npx tsc --noEmit # TypeScript check
```
