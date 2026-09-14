# Design Document: AI Resume Analyzer

## Overview

The AI Resume Analyzer is a full-stack web application with three distinct service layers:

1. **Client** (`client/`) — React 18 single-page application with React Router v6, Axios, Recharts, react-toastify, and react-dropzone. Serves a dark-themed, dashboard-style UI for authentication, resume upload, analysis submission, results viewing, history browsing, and account settings.
2. **API Server** (`server/`) — Node.js 18+ / Express 4 REST API backed by MongoDB via Mongoose. Handles user authentication (JWT), file upload (Multer), and orchestrates calls to the Analysis Service. All protected routes require a valid Bearer JWT.
3. **Analysis Service** (`analyzer/`) — Python 3.11+ FastAPI microservice. Receives raw file bytes or extracted text, performs PDF/DOCX text extraction, NLP-based scoring, keyword analysis, skill matching, and generates recommendations. Runs on `http://localhost:8000` by default.

### High-Level Architecture

```
Browser (React SPA)
        │  HTTPS / HTTP
        ▼
Node.js / Express  ──── MongoDB (Mongoose ODM)
    (port 5000)
        │  HTTP (internal)
        ▼
Python FastAPI Service
    (port 8000)
```

No direct communication exists between the browser and the Python service. All traffic routes through the Express API server.

---

## Architecture

### Service Responsibilities

| Layer | Technology | Port | Responsibility |
|---|---|---|---|
| Client | React 18 | 3000 | UI, routing, state, API calls |
| API Server | Node.js / Express | 5000 | Auth, file upload, DB, proxy to analyzer |
| Analysis Service | Python / FastAPI | 8000 | Text extraction, scoring, NLP |
| Database | MongoDB | 27017 | Persistent storage |

### Request Lifecycle — Resume Analysis

```
1.  User selects file + enters job title/description in React UI
2.  React POSTs file to  POST /api/resumes/upload  (JWT in header)
3.  Express validates JWT, MIME type, file size
4.  Express POSTs file bytes to  POST http://analyzer:8000/extract
5.  FastAPI extracts text, returns { extracted_text }
6.  Express stores Resume doc in MongoDB, returns { resumeId }
7.  React POSTs { resumeId, jobTitle, jobDescription } to POST /api/analyses
8.  Express looks up Resume (ownership check), calls POST http://analyzer:8000/analyze
9.  FastAPI scores resume, returns full analysis JSON
10. Express stores Analysis doc in MongoDB, returns full Analysis object
11. React navigates to /results/:analysisId to display results
```

### Folder Structure

```
ai-resume-analyzer/
├── client/                          # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.js
│   │   ├── App.js
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── components/
│   │   │   ├── Sidebar.js
│   │   │   ├── Navbar.js
│   │   │   ├── PrivateRoute.js
│   │   │   ├── ScoreCircle.js
│   │   │   ├── LoadingSkeleton.js
│   │   │   ├── Toast.js
│   │   │   └── FileUpload.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── AnalyzeResume.js
│   │   │   ├── AnalysisResults.js
│   │   │   ├── AnalysisHistory.js
│   │   │   └── Settings.js
│   │   └── styles/
│   │       ├── global.css
│   │       ├── sidebar.css
│   │       ├── dashboard.css
│   │       ├── analyze.css
│   │       ├── results.css
│   │       ├── history.css
│   │       ├── auth.css
│   │       └── settings.css
│   └── package.json
│
├── server/                          # Node.js / Express API
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Resume.js
│   │   └── Analysis.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── resumes.js
│   │   ├── analyses.js
│   │   ├── dashboard.js
│   │   └── profile.js
│   ├── index.js
│   ├── .env.example
│   └── package.json
│
├── analyzer/                        # Python FastAPI microservice
│   ├── main.py
│   ├── extractor.py
│   ├── skills.py
│   ├── scorer.py
│   ├── recommender.py
│   ├── .env.example
│   └── requirements.txt
│
└── README.md
```

---

## Components and Interfaces

### API Server — Express Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Create new user account |
| POST | /api/auth/login | No | Authenticate, receive JWT |
| POST | /api/resumes/upload | Yes | Upload PDF/DOCX, extract text |
| GET | /api/resumes | Yes | List user's uploaded resumes |
| POST | /api/analyses | Yes | Submit analysis for a resume |
| GET | /api/analyses | Yes | Get user's analysis history |
| GET | /api/analyses/:id | Yes | Get single analysis by ID |
| GET | /api/dashboard/stats | Yes | Dashboard aggregate stats |
| GET | /api/profile | Yes | Get current user profile |
| PUT | /api/profile | Yes | Update user name |
| PUT | /api/profile/password | Yes | Change user password |

### Analysis Service — FastAPI Routes

| Method | Path | Description |
|---|---|---|
| POST | /extract | Extract text from uploaded file bytes |
| POST | /analyze | Score extracted text against job description |
| GET | /health | Health check endpoint |

### React Pages and Routes

| Path | Component | Auth Required |
|---|---|---|
| /login | Login | No |
| /register | Register | No |
| / | Dashboard | Yes |
| /analyze | AnalyzeResume | Yes |
| /results/:id | AnalysisResults | Yes |
| /history | AnalysisHistory | Yes |
| /settings | Settings | Yes |

---

## Data Models

### MongoDB — User

```
users collection
{
  _id:          ObjectId
  name:         String   (required, trimmed)
  email:        String   (required, unique, lowercase)
  password:     String   (required, bcrypt hash)
  createdAt:    Date     (default: Date.now)
  updatedAt:    Date     (auto-managed by timestamps option)
}
```

### MongoDB — Resume

```
resumes collection
{
  _id:           ObjectId
  userId:        ObjectId (ref: 'User', required, indexed)
  fileName:      String   (required)
  extractedText: String   (required)
  uploadedAt:    Date     (default: Date.now)
}
```

### MongoDB — Analysis

```
analyses collection
{
  _id:              ObjectId
  userId:           ObjectId  (ref: 'User', required, indexed)
  resumeId:         ObjectId  (ref: 'Resume', required)
  jobTitle:         String    (required)
  jobDescription:   String    (required)
  overallScore:     Number    (0–100)
  atsScore:         Number    (0–100)
  jobMatchScore:    Number    (0–100)
  matchingSkills:   [String]
  missingSkills:    [String]
  keywords:         [{ term: String, frequency: Number }]
  strengths:        [String]
  weaknesses:       [String]
  recommendations:  [String]
  recommendedRoles: [{ role: String, matchPercentage: Number }]
  createdAt:        Date      (default: Date.now)
}
```

### Python FastAPI — Request/Response Schemas (Pydantic)

**POST /extract — Request**: `multipart/form-data` with field `file` (binary)

**POST /extract — Response**:
```json
{ "extracted_text": "string" }
```

**POST /analyze — Request**:
```json
{
  "extracted_text": "string",
  "job_title": "string",
  "job_description": "string"
}
```

**POST /analyze — Response**:
```json
{
  "overallScore": 0,
  "atsScore": 0,
  "jobMatchScore": 0,
  "matchingSkills": ["string"],
  "missingSkills": ["string"],
  "keywords": [{ "term": "string", "frequency": 0 }],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"],
  "recommendedRoles": [{ "role": "string", "matchPercentage": 0 }]
}
```

---

## Correctness Properties

