# StudyMate AI — AI Study Companion

A full-stack study workspace that turns your own material into an interactive learning system. Upload PDFs, Markdown, or text files and get grounded AI chat, AI-generated flashcards with spaced repetition, auto-generated quizzes, research chat, progress analytics, and an installable PWA experience.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS 4**, **Prisma 7 + SQLite**, the **Vercel AI SDK**, and **Google Gemini**. It also runs fully offline from AI providers in a deterministic "local demo mode".

## Features

- **Document upload** — PDF, TXT, and Markdown up to 10 MB, parsed, chunked, and indexed in the background.
- **Chat with your documents** — RAG answers grounded only in the selected document, with segment citations and persisted chat history.
- **Global study chat** — ask questions across all of your processed documents.
- **Research chat** — general-purpose AI assistant with optional live Google Search grounding.
- **Smart flashcards** — AI-generated from each document and scheduled with the SM-2 spaced-repetition algorithm.
- **Quizzes** — multiple-choice quizzes generated from extracted key topics, with instant scoring.
- **Dashboard and analytics** — study streak, cards learned, average quiz score, reviews today, and a 7-day activity chart.
- **Accounts** — email/password auth with signed HTTP-only JWT sessions, password reset via OTP email, name and password changes.
- **Hardening** — bcrypt password hashing, session rotation, database-backed rate limiting, per-user authorization on every query.
- **PWA** — web manifest, icons, and a minimal service worker so the app is installable.
- **Local demo mode** — with no Gemini API key, the app still parses, indexes, chats, generates cards, and generates quizzes using local lexical/embedding fallbacks.

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Actions), React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | SQLite via Prisma 7 (`better-sqlite3` adapter) |
| AI | Vercel AI SDK 7, `@ai-sdk/google` (Gemini 3.5 Flash Lite, Gemini Embedding 001) |
| Retrieval | SQLite FTS5 keyword pre-filter + vector similarity re-ranking |
| Auth | `jose` HS256 JWT in an HTTP-only cookie, `bcryptjs` |
| Email | `nodemailer` (optional SMTP) |
| Parsing | `pdf-parse` |
| Validation | `zod` |

## Getting started

### Prerequisites

- Node.js 20.19+ (Node 22 LTS recommended)
- npm

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env
```

Generate a session secret and add it to `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

```env
DATABASE_URL="file:./prisma/dev.db"
SESSION_SECRET="<paste-the-generated-string>"
GOOGLE_GENERATIVE_AI_API_KEY=""   # optional — empty enables local demo mode
```

Then initialize the database and start the app:

```bash
# Generate the Prisma client (required before first run/build)
npm run db:generate

# Apply migrations (creates prisma/dev.db and the schema)
npm run db:migrate

# Start the development server
npm run dev
```

Open <http://localhost:3000>, create an account, and upload a PDF, TXT, or Markdown file.

> The generated Prisma client lives in `src/generated/prisma` and is gitignored, so `npm run db:generate` must be run after every fresh clone or dependency install.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | SQLite connection string, e.g. `file:./prisma/dev.db`. Relative `file:` paths are resolved from the project root. |
| `SESSION_SECRET` | Yes | Random string of 32+ characters used to sign session JWTs. The app throws on startup if missing. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey). Leave empty to run in local demo mode. |
| `RESEARCH_WEB_SEARCH` | No | Set to `true` to enable Google Search grounding in Research chat. Requires a billed Gemini plan. |
| `SMTP_HOST` | No | SMTP host for password-reset emails. |
| `SMTP_PORT` | No | SMTP port (commonly `587`). |
| `SMTP_SECURE` | No | `true` for implicit TLS (port 465), otherwise `false`. |
| `SMTP_USER` / `SMTP_PASS` | No | SMTP credentials. |
| `SMTP_FROM` | No | From address, e.g. `StudyMate AI <noreply@studymate.test>`. |

Without SMTP configured in development, the password-reset OTP is displayed on the forgot-password page so the flow still works.

## How it works

1. **Upload** — the file is parsed (`pdf-parse` for PDFs, plain text otherwise) and split into overlapping chunks (500-chunk limit per document). The document is marked `PROCESSING` and a background queue computes embeddings.
2. **Index** — chunks are embedded with Gemini Embedding 001 (or a deterministic hashed bag-of-words vector locally) and mirrored into a SQLite FTS5 table for fast keyword lookup.
3. **Retrieve** — a query first hits the FTS5 index for candidate chunks, then those candidates are re-ranked by cosine similarity, falling back to a full document scan when keyword search returns nothing.
4. **Generate** — Gemini streams grounded answers for Study chat; flashcards and quizzes are generated with schema-constrained structured output (`generateObject`). Document analysis extracts 3–8 key topics that drive card/question coverage.
5. **Review** — flashcard grades update ease factor, interval, and repetition count via SM-2; quizzes store per-question answers and are scored on submit.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Build for production. |
| `npm run start` | Run the production build. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run the TypeScript compiler with `--noEmit`. |
| `npm run db:generate` | Generate the Prisma client. |
| `npm run db:migrate` | Create/apply development migrations. |
| `npm run db:push` | Push the schema directly to the database. |
| `npm run db:studio` | Open Prisma Studio. |

## Project structure

```
prisma/
  schema.prisma          # User, Document, Chunk, Flashcard, Quiz, ChatMessage, ...
  migrations/            # SQLite migration history
public/
  sw.js                  # Minimal installability service worker
  icon-*.png, icon.svg   # PWA icons
src/
  app/
    (marketing)/         # Public landing, about, FAQ, contact
    (auth)/              # Login, signup, forgot/reset password
    (app)/               # Authenticated shell: dashboard, documents, study,
                         # flashcards, quizzes, research, account
    api/chat/            # Streaming document chat (RAG)
    api/global-chat/     # Streaming chat across all documents
    api/research/        # Streaming research assistant
  components/            # Shared UI (theme, pagination, service worker, ...)
  lib/
    ai.ts                # Gemini models and embedding helpers
    local-ai.ts          # Deterministic no-API fallbacks
    rag.ts, retrieval.ts # Chunk search, FTS and cosine ranking
    processing.ts        # Background embedding queue
    text.ts              # Chunking and text utilities
    flashcards.ts        # Generation + SM-2 review actions
    quizzes.ts           # Quiz generation and scoring actions
    analyze.ts           # Key-topic extraction
    auth.ts, session.ts, dal.ts # Auth, JWT sessions, data access guards
    email.ts             # Optional SMTP OTP delivery
    rate-limit*.ts       # Fixed-window DB rate limiting
    analytics.ts, streak.ts     # Dashboard metrics
    db.ts                # Prisma client + FTS5 bootstrap
```

The `ChunkFTS` virtual table is created idempotently at runtime, so existing databases upgrade without an extra migration.

## Deployment notes

This app expects a **persistent Node.js server with a writable filesystem**, because documents, embeddings, and sessions live in a local SQLite database (`better-sqlite3`, a native module). Typical serverless platforms with ephemeral or read-only storage are not a good fit without migrating to a hosted database and object storage.

Before deploying:

- Set `DATABASE_URL` to a persistent path and `SESSION_SECRET` to a strong secret.
- Run `npm run db:generate` as part of the build step, then `npm run db:migrate` (or `prisma migrate deploy`) against the target database.
- Set `GOOGLE_GENERATIVE_AI_API_KEY` for real AI responses and optionally configure SMTP.
- Run `npm run build && npm run start`.

## License

No license file is included; treat this project as private unless a license is added.
