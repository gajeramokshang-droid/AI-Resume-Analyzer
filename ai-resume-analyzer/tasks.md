# Implementation Plan: AI Resume Analyzer

## Overview

Build a three-layer full-stack app: React frontend, Node.js/Express API, and Python FastAPI analyzer. Tasks are ordered so every step produces runnable code that integrates with the previous step.

---

## Tasks

- [ ] 1. Phase 1 — Project Setup & Folder Structure
  - [ ] 1.1 Scaffold `client/` with Create React App and install dependencies
    - `npx create-react-app client`
    - Install: `axios react-router-dom react-dropzone recharts react-toastify`
    - Delete boilerplate files (`App.test.js`, `logo.svg`, `reportWebVitals.js`, `setupTests.js`)
    - _Requirements: 4.3_
  - [ ] 1.2 Scaffold `server/` with npm and install dependencies
    - `npm init -y` inside `server/`
    - Install: `express mongoose bcryptjs jsonwebtoken multer axios dotenv cors helmet express-validator`
    - Install dev: `nodemon`
    - Add `"start": "node index.js"` and `"dev": "nodemon index.js"` scripts
    - _Requirements: 1.3, 2.5, 3.1_
  - [ ] 1.3 Scaffold `analyzer/` Python environment
    - Create `analyzer/requirements.txt` listing: `fastapi uvicorn[standard] pymupdf python-docx pydantic scikit-learn python-multipart`
    - Create `analyzer/.env.example` with `PORT=8000`
    - _Requirements: 6.1, 6.2_
  - [ ] 1.4 Create `server/.env.example`
    - Fields: `PORT`, `MONGO_URI`, `JWT_SECRET`, `ANALYZER_URL`
    - _Requirements: 16.2_

---

- [ ] 2. Phase 2 — Authentication
  - [ ] 2.1 Create `server/config/db.js` — MongoDB connection via Mongoose
    - Export async `connectDB()` that calls `mongoose.connect(process.env.MONGO_URI)`
    - Log success or throw on failure
    - _Requirements: 1.4_
  - [ ] 2.2 Create `server/models/User.js` — Mongoose User schema
    - Fields: `name` (String, required, trim), `email` (String, required, unique, lowercase), `password` (String, required), timestamps option enabled
    - _Requirements: 1.4_
  - [ ] 2.3 Create `server/middleware/auth.js` — JWT verification middleware
    - Extract Bearer token from `Authorization` header
    - Verify with `jsonwebtoken.verify()`; attach `req.user = { id }` on success
    - Return 401 if missing or invalid
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ] 2.4 Create `server/routes/auth.js` — Register and Login routes
    - `POST /register`: validate fields (name, email ≥1 char, password ≥8), bcrypt hash (cost 10), save user, return 201 with JWT + `{ name, email }`
    - `POST /login`: find user by email, compare password, return 200 with JWT + `{ name, email }`, or 401 on mismatch
    - JWT expiry: `7d`
    - Return 409 if email already registered
    - Never include password hash in response
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - [ ] 2.5 Create `server/index.js` — Express app entry point
    - Mount `helmet()`, `cors()`, `express.json()`
    - Mount routes: `/api/auth`
    - Call `connectDB()` on startup
    - Global error handler returning `{ error, message }` with 500
    - _Requirements: 14.7, 16.6_
  - [ ] 2.6 Create `client/src/api/axios.js` — Axios instance
    - `baseURL`: `http://localhost:5000/api`
    - Request interceptor: attach `Authorization: Bearer <token>` from `localStorage` if present
    - _Requirements: 4.3_
  - [ ] 2.7 Create `client/src/context/AuthContext.js` — React auth context
    - State: `user`, `token`
    - `login(data)`: save token to `localStorage`, set user state
    - `logout()`: clear `localStorage`, reset state
    - On mount: read token from `localStorage`, decode to restore user
    - _Requirements: 4.3, 4.4_
  - [ ] 2.8 Create `client/src/components/PrivateRoute.js`
    - Render children if authenticated; redirect to `/login` otherwise
    - _Requirements: 4.1_
  - [ ] 2.9 Create `client/src/pages/Register.js` and `client/src/styles/auth.css`
    - Form fields: name, email, password
    - Inline validation: empty name, invalid email, password < 8 chars
    - On success: call `login()` from context, navigate to `/`
    - If already authenticated, redirect to `/`
    - _Requirements: 1.1, 4.2, 15.1_
  - [ ] 2.10 Create `client/src/pages/Login.js`
    - Form fields: email, password
    - Inline validation: empty email, empty password
    - On success: call `login()`, navigate to `/`
    - If already authenticated, redirect to `/`
    - _Requirements: 2.1, 4.2, 15.2_
  - [ ] 2.11 Create `client/src/App.js` with React Router setup
    - Routes: `/login`, `/register`, `/` (Dashboard), `/analyze`, `/results/:id`, `/history`, `/settings`
    - Wrap protected routes in `<PrivateRoute>`
    - Mount `<ToastContainer />` from react-toastify
    - _Requirements: 4.1_
  - [ ] 2.12 Create `client/src/index.js` and `client/public/index.html`
    - Standard React entry point; import `global.css` and `react-toastify/dist/ReactToastify.css`
    - _Requirements: 4.1_
  - [ ] 2.13 Create `client/src/styles/global.css`
    - CSS variables for dark theme (background `#0f1117`, surface `#1a1d27`, accent `#6c63ff`)
    - Base resets, font (Inter or system sans), body background
    - _Requirements: (UI baseline)_

---

- [ ] 3. Phase 3 — Resume Upload
  - [ ] 3.1 Create `analyzer/extractor.py` — text extraction logic
    - `extract_text(file_bytes: bytes, filename: str) -> str`
    - PDF branch: `fitz.open(stream=file_bytes, filetype="pdf")`, join all page text
    - DOCX branch: `python-docx Document(io.BytesIO(file_bytes))`, join all paragraphs
    - Clean step: collapse whitespace, strip non-printable chars
    - Raise `ValueError` if extracted text is empty
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ] 3.2 Create `analyzer/main.py` — FastAPI app with `/extract` and `/health`
    - `GET /health` returns `{ "status": "ok" }`
    - `POST /extract` accepts `multipart/form-data` with field `file`, calls `extract_text()`, returns `{ "extracted_text": "..." }`
    - Return HTTP 422 with detail message if `ValueError` raised
    - _Requirements: 6.1, 6.2, 6.4, 5.5_
  - [ ] 3.3 Create `server/middleware/upload.js` — Multer config
    - Memory storage (no disk writes)
    - MIME filter: allow only `application/pdf` and `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
    - `limits.fileSize`: 5 MB
    - Return 400 with correct messages on MIME or size violation
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 16.4, 16.5_
  - [ ] 3.4 Create `server/models/Resume.js` — Mongoose Resume schema
    - Fields: `userId` (ObjectId, ref User, required, indexed), `fileName` (String), `extractedText` (String), `uploadedAt` (Date, default now)
    - _Requirements: 5.5_
  - [ ] 3.5 Create `server/routes/resumes.js` — Upload and list routes
    - `POST /upload` (auth + multer): forward file bytes to `ANALYZER_URL/extract`, save Resume doc, return 201 `{ resumeId, message }`
    - `GET /` (auth): return array of `{ _id, fileName, uploadedAt }` for current user
    - Timeout: 30 s on analyzer call; return 422 on extraction error
    - _Requirements: 5.5, 5.6, 5.7, 14.2, 14.3_
  - [ ] 3.6 Mount `/api/resumes` in `server/index.js`
    - _Requirements: 5.5_
  - [ ] 3.7 Create `client/src/components/FileUpload.js` — drag-and-drop zone
    - Use `react-dropzone`; accept `.pdf` and `.docx` only
    - Show file name and size on selection
    - Show progress indicator (disabled submit button + spinner) during upload
    - _Requirements: 5.8_
  - [ ] 3.8 Create `client/src/pages/AnalyzeResume.js` and `client/src/styles/analyze.css`
    - `<FileUpload>` component for file selection
    - Input: Job Title (required), Job Description textarea (required, ≥50 chars) with live character counter
    - On submit: `POST /api/resumes/upload`, then `POST /api/analyses`, navigate to `/results/:id`
    - Inline form validation before any API call
    - Show toast on error
    - _Requirements: 5.8, 7.1, 15.3, 15.4_

---

- [ ] 4. Phase 4 — Python Analysis Service
  - [ ] 4.1 Create `analyzer/skills.py` — skill taxonomy list
    - A Python list `SKILLS` of at least 200 lowercase technical and professional skill strings
    - Examples: `"python"`, `"javascript"`, `"project management"`, `"sql"`, `"machine learning"`, etc.
    - _Requirements: 9.3_
  - [ ] 4.2 Create `analyzer/scorer.py` — scoring functions
    - `extract_keywords(job_description: str, top_n: int = 20) -> list[dict]`
      - TF-IDF via scikit-learn `TfidfVectorizer` with English stop words
      - Return list of `{ "term": str, "frequency": int }` sorted by TF-IDF weight descending
    - `match_skills(text: str, job_desc: str) -> tuple[list[str], list[str]]`
      - Lowercased intersection/difference of SKILLS against both strings
      - Case-insensitive match
      - Return `(matching_skills, missing_skills)`
    - `compute_scores(text: str, job_desc: str, keywords: list[dict]) -> dict`
      - `jobMatchScore`: % of keyword terms present in resume text (0–100, int)
      - `atsScore`: section presence (education, experience, skills) + keyword density heuristic (0–100, int)
      - `overallScore`: `jobMatchScore*0.5 + atsScore*0.3 + formatting_score*0.2` clamped to 0–100
    - All scores clamped: `max(0, min(100, value))`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 9.1, 9.2, 9.3, 9.4, 9.5_
  - [ ] 4.3 Create `analyzer/recommender.py` — strengths, weaknesses, recommendations, roles
    - `generate_strengths(matching_skills, ats_score) -> list[str]` — 2–6 items
    - `generate_weaknesses(missing_skills, job_match_score) -> list[str]` — 1–6 items
    - `generate_recommendations(missing_skills, keywords, job_match_score) -> list[str]` — 3–8 items; if jobMatchScore < 40 include tip about top-3 missing keywords
    - `generate_roles(matching_skills, job_title) -> list[dict]` — 3–8 `{ role, matchPercentage }` items
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  - [ ] 4.4 Add `POST /analyze` endpoint to `analyzer/main.py`
    - Pydantic request schema: `extracted_text`, `job_title`, `job_description`
    - Call scorer and recommender functions, assemble full response JSON
    - Return response matching the Analysis schema (all 10 fields)
    - _Requirements: 7.6, 8.1–8.9_

---

- [ ] 5. Phase 5 — Analysis API + MongoDB Storage (Node side)
  - [ ] 5.1 Create `server/models/Analysis.js` — Mongoose Analysis schema
    - Fields from the data model: all score fields (Number), array fields (String or object), `userId`/`resumeId` refs, timestamps
    - _Requirements: 7.2, 11.2_
  - [ ] 5.2 Create `server/routes/analyses.js` — Analysis CRUD routes
    - `POST /` (auth): validate `resumeId` ownership (403 if not owner), validate `jobDescription` ≥50 chars (400), call `ANALYZER_URL/analyze` with 30 s timeout, save Analysis, return 201 with full doc
    - `GET /` (auth): return all analyses for user, sorted by `createdAt` desc, fields: `_id, jobTitle, overallScore, atsScore, jobMatchScore, createdAt`
    - `GET /:id` (auth): return full Analysis if owned by user, else 403
    - Return 502 if analyzer call fails
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 11.1, 11.2, 11.3, 11.4, 11.5, 14.2, 14.3_
  - [ ] 5.3 Mount `/api/analyses` in `server/index.js`
    - _Requirements: 7.2_

---

- [ ] 6. Phase 6 — Dashboard Page
  - [ ] 6.1 Create `server/routes/dashboard.js` — stats endpoint
    - `GET /stats` (auth): aggregate query returning `totalResumes`, `totalAnalyses`, `avgScore`, `highestScore`, `recentAnalyses` (last 5), `scoreHistory` (all scores + dates)
    - Return zeros/empty arrays when user has no data
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  - [ ] 6.2 Mount `/api/dashboard` in `server/index.js`
    - _Requirements: 12.1_
  - [ ] 6.3 Create `client/src/components/Sidebar.js` and `client/src/styles/sidebar.css`
    - Navigation links: Dashboard, Analyze Resume, History, Settings
    - Show user name at bottom; Logout button clears auth context
    - _Requirements: 4.4_
  - [ ] 6.4 Create `client/src/components/Navbar.js`
    - Top bar showing page title and user avatar/initial
    - _Requirements: (UI)_
  - [ ] 6.5 Create `client/src/components/LoadingSkeleton.js`
    - Animated CSS skeleton block component; accepts `height` and `width` props
    - _Requirements: 14.5_
  - [ ] 6.6 Create `client/src/components/ScoreCircle.js`
    - SVG circle showing a numeric score (0–100) with colour coding (green/yellow/red)
    - _Requirements: (UI)_
  - [ ] 6.7 Create `client/src/pages/Dashboard.js` and `client/src/styles/dashboard.css`
    - On mount: `GET /api/dashboard/stats`
    - Show skeleton while loading; show empty-state prompt if no analyses
    - Stat cards: total resumes, total analyses, avg score, best score
    - Recent analyses table (last 5)
    - Score trend line chart using Recharts `<LineChart>`
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 14.5, 14.6_

---

- [ ] 7. Phase 7 — Analysis Results Page
  - [ ] 7.1 Create `client/src/pages/AnalysisResults.js` and `client/src/styles/results.css`
    - On mount: `GET /api/analyses/:id` (id from `useParams`)
    - Show skeleton while loading
    - Score section: three `<ScoreCircle>` components for overall, ATS, job match
    - Skills section: two columns — matching skills (green chips) and missing skills (red chips)
    - Keywords table: term + frequency columns
    - Strengths and Weaknesses lists
    - Recommendations list
    - Recommended Roles list with match percentage bars
    - Back button to `/history`
    - _Requirements: 7.2, 9.1, 9.2, 10.1, 10.2, 10.3, 10.4, 14.5_

---

- [ ] 8. Phase 8 — Analysis History Page
  - [ ] 8.1 Create `client/src/pages/AnalysisHistory.js` and `client/src/styles/history.css`
    - On mount: `GET /api/analyses`
    - Show skeleton while loading; show empty-state if no history
    - Table/card list: job title, overall score, ATS score, job match score, date
    - Each row is clickable — navigate to `/results/:id`
    - _Requirements: 11.1, 11.2, 11.3, 14.5, 14.6_

---

- [ ] 9. Phase 9 — Settings / Profile Page
  - [ ] 9.1 Create `server/routes/profile.js` — profile routes
    - `GET /` (auth): return `{ name, email, createdAt }` (no password)
    - `PUT /` (auth): update name; return updated user (no password)
    - `PUT /password` (auth): verify current password, validate new password ≥8 chars, bcrypt hash new password, save
    - Return 401 if current password wrong; 400 if new password < 8 chars
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  - [ ] 9.2 Mount `/api/profile` in `server/index.js`
    - _Requirements: 13.1_
  - [ ] 9.3 Create `client/src/pages/Settings.js` and `client/src/styles/settings.css`
    - On mount: `GET /api/profile`
    - Update Name form: pre-filled; on submit `PUT /api/profile`
    - Change Password form: current password, new password, confirm new password; client validates ≥8 chars before submit; on submit `PUT /api/profile/password`
    - Show success/error toasts for each action
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 14.4_

---

- [ ] 10. Phase 10 — README
  - [ ] 10.1 Write `README.md` at the project root
    - Sections: Project Overview, Features, Tech Stack, Architecture (data flow diagram in ASCII), Prerequisites, Installation steps for each service, Environment Variables table, API Endpoints reference, How the Analyzer Works, Screenshots (placeholder labels), Future Improvements (≥5 items)
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8_

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The Python analyzer runs on port 8000; set `ANALYZER_URL=http://localhost:8000` in `server/.env`
- Start services: `analyzer/` with `uvicorn main:app --reload`, `server/` with `npm run dev`, `client/` with `npm start`
- No property-based tests are included because the design does not define Correctness Properties
- Each task references specific requirements for traceability

