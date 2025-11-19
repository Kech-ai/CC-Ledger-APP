# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

CC-Ledger is an AI-assisted accounting ledger focused on Ethiopian-style chart-of-accounts and double-entry bookkeeping. The codebase is a MERN-style stack: a React + TypeScript single-page app under `client/` talking to an Express/MongoDB backend under `server/`, with Google Gemini providing OCR, account suggestions, duplicate detection, and report summarization.

There is also legacy, mostly-obsolete frontend-only code at the repository root (e.g. `index.tsx`, `App.tsx`, `index.html`) that originates from the original AI Studio export. Comments in those files indicate the app has been migrated to a full MERN stack; prefer working in `client/` + `server/` for new development.

## How to run the app

### Vite-based frontend (as described in README)

The root `README.md` describes running the app as a Vite-powered frontend:

1. From the repo root, install dependencies:
   - `npm install`
2. Create `.env.local` in the repo root and set:
   - `GEMINI_API_KEY=...` (used by `vite.config.ts` to inject `process.env.API_KEY` into the browser bundle.)
3. Start the dev server:
   - `npm run dev`

Additional root `package.json` scripts:
- `npm run build` – Vite production build for the frontend.
- `npm run preview` – Preview the Vite production build.

Note: the current root `index.html` and `index.tsx` explicitly state that the frontend-only setup is obsolete and that the app "must be run from the backend server". If you start `npm run dev` you may just see that informational page rather than the full MERN experience; see the backend section below for the stack that is wired to MongoDB and server-side Gemini.

### Backend server (Express + MongoDB + Gemini)

The primary runtime for the full MERN stack is the Express server under `server/`.

Environment configuration (server):
- Create `server/.env` with at least:
  - `MONGO_URI` – MongoDB connection string (used by `server/config/db.js`).
  - `JWT_SECRET` – secret used to sign JWTs in `authController` / `generateToken.js` and verify them in `authMiddleware`.
  - `API_KEY` – Google Gemini API key used by `server/services/geminiService.js`.
- If `MONGO_URI` or `API_KEY` are missing or left at their placeholder values, the server will still start but will log warnings and any DB/AI-dependent endpoints will fail.

Commands (from `server/`):
- Install backend dependencies:
  - `cd server`
  - `npm install`
- Start server (plain Node):
  - `npm start`
  - Default port is `5000` (see `server/index.js` and `process.env.PORT`).
- Start server with auto-reload (nodemon):
  - `npm run server`
- Seed or wipe sample data (check `server/seeder.js` before running):
  - `npm run data:import`
  - `npm run data:destroy`

Runtime behavior:
- `server/index.js` wires up the core Express app:
  - JSON body parsing and CORS.
  - Mongo connection via `connectDB()`.
  - API routes:
    - `/api/auth` → login (`authRoutes` / `authController`).
    - `/api/users` → user admin CRUD (`userRoutes` / `userController`), protected by `protect` + `superAdmin` middleware.
    - `/api/journal` → journal entry CRUD and chart-of-accounts (`journalRoutes` / `journalController`).
    - `/api/ai` → AI-powered endpoints for receipt OCR, account suggestion, and report summarization (`aiRoutes` / `aiController` → `services/geminiService.js`).
    - `/api/uploads` → image upload endpoint backed by `multer` and stored under `uploads/` (`uploadRoutes`).
  - Static assets:
    - `/uploads` is served from the `uploads/` directory so uploaded files are web-accessible.
    - The `client/` directory is served as static frontend assets; any non-API route falls back to `client/index.html` via a wildcard `app.get('*')` handler.

### Testing and linting

- There are currently **no** `test` or `lint` scripts defined in either the root `package.json` or `server/package.json`, and there are no obvious test files. Automated testing and linting are not configured out of the box.

## High-level architecture

### Frontend (client/) architecture

The active frontend lives under `client/` and is a React + TypeScript single-page app rendered into `client/index.html` / `client/index.tsx`:
- `client/index.html` – HTML shell that pulls in Tailwind from CDN, sets up typography/colors, and loads `/index.tsx` into the `#root` div.
- `client/index.tsx` – React entrypoint that creates the root and wraps `<App />` with `AppProvider` from `client/context/AppContext.tsx`.
- `client/App.tsx` – top-level component implementing manual hash-based routing:
  - Reads `window.location.hash` and switches between `Dashboard`, `NewJournalEntry`, `Journal`, `Reports`, and `Settings`.
  - Uses `useAppContext()` to gate the UI on authentication: unauthenticated users see `Login`; settings are only available to `Super Admin`.

#### Application state and API integration

- `client/context/AppContext.tsx` is the central state container for the SPA:
  - Holds `currentUser`, `users`, `journalEntries`, `chartOfAccounts`, `currency`, `locale`, and `loading`.
  - Persists `token` and serialized `userInfo` to `localStorage` on login; initializes state from `localStorage` on load.
  - On startup (if a token exists) it calls `fetchData()`, which parallel-fetches initial data from the backend (`journal`, `users`, `accounts`) via the API client.
  - Exposes imperative methods used across components:
    - `login(credentials)` – POSTs to `/api/auth/login`, stores JWT and user, then refreshes initial data.
    - `logout()` – clears `localStorage` and all in-memory state.
    - `addJournalEntry(entry)` – POSTs to `/api/journal` and prepends the returned entry to local state.
    - `updateJournalEntryStatus(id, status)` – PUTs to `/api/journal/:id` and replaces the matching entry.
    - `addUser`, `updateUser`, `deleteUser` – CRUD around `/api/users`, with role-guarding on the server side; `updateUser` also keeps `currentUser` + `userInfo` in sync when editing your own profile.

- `client/services/api.ts` is the thin, typed API client for the frontend:
  - Encapsulates `fetch` calls against `/api/*` with a shared `getAuthHeaders()` that reads the JWT from `localStorage` and sets the `Authorization: Bearer ...` header.
  - Flows covered:
    - Auth: `login()` → `/api/auth/login`.
    - Users: `getUsers`, `createUser`, `updateUser`, `deleteUser` → `/api/users` and `/api/users/:id`.
    - Journal: `getJournalEntries`, `createJournalEntry`, `updateJournalEntry` → `/api/journal`.
    - Accounts: `getAccounts` → `/api/journal/accounts`.
    - Uploads: `uploadReceipt(formData)` → `/api/uploads` (expects `image` field, returns a server-relative `path`).
    - AI: `scanReceipt(imagePath)`, `suggestAccount(description)`, `summarizeReport(reportName, reportData)` → `/api/ai/*` endpoints.
  - `handleResponse()` centralizes JSON parsing and error throwing; on non-2xx it throws `Error` with `data.message` from the backend.

- `client/services/geminiService.ts` contains a **browser-side** integration with `@google/genai` (mirroring the server-side version) for OCR, account suggestion, duplicate detection, and report summarization. In the current MERN wiring, the UI goes through the REST API (`client/services/api.ts` + `server/services/geminiService.js`) instead; this client-side Gemini wrapper appears to be a leftover from the original AI Studio-only frontend.

#### Key UI layers

All main screens live under `client/components/` and consume `AppContext` and the API client:
- `Login.tsx` – handles credential input, calls `login`, stores token via context, and routes into the main app on success.
- `Layout.tsx`, `Header.tsx`, `Sidebar.tsx` – overall chrome (navigation, user info, language/currency controls, etc.).
- `Dashboard.tsx` – high-level financial overview/dashboard built from `journalEntries` and `chartOfAccounts`.
- `NewJournalEntry.tsx` – primary data-entry workflow:
  - Manages local form state (date, description, amount, debit/credit account, and optional receipt upload).
  - Uses `api.uploadReceipt` to send an image to `/api/uploads` and stores the returned `path`.
  - Uses `api.scanReceipt(path)` to call `/api/ai/scan-receipt`, populating date, description, and amount from Gemini OCR.
  - Debounces the description and calls `api.suggestAccount(description)` to fetch the AI-suggested account from `/api/ai/suggest-account`, showing the suggestion inline and letting the user apply it.
  - On submit, calls `addJournalEntry` from `AppContext`, which ultimately POSTs to `/api/journal`; the backend runs duplicate detection via Gemini and flags potential duplicates.
- `Journal.tsx` – listing and status management for journal entries, showing duplicate flags and allowing authorized roles to approve/reject entries.
- `Reports.tsx` – builds higher-level financial reports from `journalEntries` and can call `api.summarizeReport` to get a Gemini-generated natural-language summary for display.
- `Settings.tsx` – user/role management and potentially other configuration; guarded in `App.tsx` so only `Super Admin` can access it.

Support code:
- `client/types.ts` – shared TypeScript interfaces for `User`, `JournalEntry`, `Account`, `OcrResult`, etc., used both by `AppContext` and the API client.
- `client/constants.ts` – includes the Ethiopian chart-of-accounts definition (`CHART_OF_ACCOUNTS`) mirrored by the backend `Account` model.
- `client/utils/currency.ts` – utility for formatting amounts given a currency code.
- `client/i18n/` – simple translation system (`translations.ts` and `useTranslation.ts`), used across components for language-aware labels and account names.

### Backend (server/) architecture

The backend is a conventional Express + Mongoose stack organized into config, models, routes, controllers, middleware, and services.

#### Core server setup

- `server/index.js`:
  - Loads environment with `dotenv.config()` and connects to Mongo via `connectDB()`.
  - Sets up `express.json()` and `cors()`.
  - Mounts routers for auth, users, journal, AI, and uploads under `/api/*`.
  - Serves `/uploads` as static files.
  - Serves the SPA from the `client/` directory and uses a catch-all `app.get('*')` to send `client/index.html` for any non-API route.
  - Applies `notFound` and `errorHandler` middleware for consistent JSON error responses.

- `server/config/db.js`:
  - Reads `process.env.MONGO_URI` and attempts to connect with Mongoose.
  - If `MONGO_URI` is unset or still equal to a placeholder, it logs a prominent warning and **does not** connect, but allows the server to start so the static frontend can still be served.
  - On connection errors, it logs the error and continues running without hard-crashing the process.

#### Data models

- `server/models/User.js`:
  - Mongoose model with `name`, `email`, `password`, and `role` fields.
  - Roles are constrained to `'Accountant' | 'Finance Manager' | 'Super Admin' | 'Auditor'`.
  - Passwords are hashed with bcrypt on save; a `matchPassword` instance method is used during login.

- `server/models/Account.js`:
  - Represents a chart-of-accounts entry with `code`, `name`, and `type` (`Asset`, `Liability`, `Equity`, `Income`, or `Expense`).

- `server/models/JournalEntry.js`:
  - Represents a double-entry journal transaction with `date`, `description`, `debitAccount`, `creditAccount`, `amount`, optional `receiptUrl`, and `status` (`Pending`, `Approved`, `Rejected`).
  - Links to `User` via `createdBy` (ref) and stores AI-related fields `isPotentialDuplicate` and `duplicateReason`.

#### Auth, authorization, and error handling

- `server/middleware/authMiddleware.js`:
  - `protect` – extracts the `Bearer` token from the `Authorization` header, verifies it with `JWT_SECRET`, attaches the corresponding `User` (without password) to `req.user`, and rejects unauthorized/invalid tokens.
  - `superAdmin` – ensures `req.user.role === 'Super Admin'`.
  - `financeManager` – ensures `req.user.role` is either `Finance Manager` or `Super Admin`.

- `server/middleware/errorMiddleware.js`:
  - `notFound` – standard 404 handler that forwards an error.
  - `errorHandler` – standardizes error responses as JSON with `{ message, stack }`, hiding the stack trace in production.

- `server/controllers/authController.js`:
  - `authUser` – handles `/api/auth/login`: finds a user by email, checks the password via `matchPassword`, and returns a JWT plus basic user info on success.

- `server/utils/generateToken.js` (not shown above but imported by `authController`) signs JWTs with `JWT_SECRET` and embeds the user id; any changes to auth flows should keep this contract in sync with `protect`.

#### Users, journal, and accounts

- `server/controllers/userController.js` + `server/routes/userRoutes.js`:
  - CRUD endpoints under `/api/users`.
  - All routes are guarded by `protect` and `superAdmin`, so only a Super Admin can manage users.

- `server/controllers/journalController.js` + `server/routes/journalRoutes.js`:
  - `GET /api/journal` – returns all journal entries, sorted by date desc, populated with the `createdBy` user's name.
  - `POST /api/journal` – creates a new entry using request body fields, associates it with `req.user._id`, and calls `checkForDuplicateEntry` from `services/geminiService.js` to flag potential duplicates.
  - `PUT /api/journal/:id` – updates the `status` of an entry; guarded by `financeManager`.
  - `GET /api/journal/accounts` – returns all `Account` documents for populating dropdowns and AI suggestions on the frontend.

#### AI and uploads

- `server/services/geminiService.js` centralizes server-side Google Gemini usage:
  - Lazily constructs a `GoogleGenAI` client from `process.env.API_KEY`. If the key is missing or set to a placeholder, it logs warnings and either throws (for OCR/summary) or returns safe defaults (for duplicate checks) so the app can still operate without AI.
  - `extractReceiptData(imagePath)` – reads a local image from disk, base64-encodes it, and calls Gemini with an image + text prompt, expecting JSON with `vendorName`, `transactionDate`, and `totalAmount`.
  - `suggestAccount(description, chartOfAccounts)` – prompts Gemini with the human-readable chart of accounts and the transaction description, expecting a JSON `{ suggestedCode }` response that is then resolved back to a concrete `Account`.
  - `checkForDuplicateEntry(newEntry, existingEntries)` – asks Gemini to assess whether the new entry is a potential duplicate relative to recent entries, returning `isDuplicate` and `reason`.
  - `summarizeReport(reportName, reportData)` – asks Gemini to produce a short Markdown summary (2–3 bullet points) describing key trends/risks in a report object.

- `server/controllers/aiController.js` + `server/routes/aiRoutes.js`:
  - `POST /api/ai/scan-receipt` – expects `{ imagePath }` from the frontend (as returned by the upload endpoint), resolves it to a server filesystem path, and calls `extractReceiptData`.
  - `POST /api/ai/suggest-account` – expects `{ description }`, retrieves all `Account` documents, and calls `suggestAccount`.
  - `POST /api/ai/summarize-report` – expects `{ reportName, reportData }`, calls `summarizeReport`, and returns the plain-text Markdown summary.

- `server/routes/uploadRoutes.js`:
  - Uses `multer` to store uploaded images under `uploads/` and enforces a simple JPEG/PNG-only file filter.
  - `POST /api/uploads` (protected by `protect`) accepts a single `image` field and responds with `{ message, path }`, where `path` is a URL path like `/uploads/<filename>` that the frontend later passes to `/api/ai/scan-receipt`.

### Legacy root-level frontend

- The repo root contains a parallel set of React components, context, and services (`App.tsx`, `context/AppContext.tsx`, `components/*`, `services/geminiService.ts`, etc.) that mirror the `client/` code but operate entirely in-memory (mock users and journal entries, no backend API).
- `index.tsx` and the root `index.html` explicitly mark this setup as obsolete and direct you to run the app via the backend server instead.
- When modifying or extending the app, prefer the `client/` + `server/` versions of files; treat non-`client/` frontend code as legacy unless you are deliberately cleaning it up or removing it.
