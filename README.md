# ⚡ AI Resume Analyzer

A full-stack AI-powered web application that analyzes resumes against job descriptions and provides detailed feedback including scores, skill gaps, keyword analysis, and job role recommendations.

![AI Resume Analyzer](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Python](https://img.shields.io/badge/Python-3.11+-yellow)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📸 Screenshots

| Login | Dashboard |
|-------|-----------|
| *Login Page* | *Dashboard Page* |

| Analyze Resume | Analysis Results |
|----------------|-----------------|
| *Analyze Page* | *Results Page* |

---

## ✨ Features

- 🔐 **User Authentication** — Register, login, JWT-based sessions
- 📄 **Resume Upload** — Drag & drop PDF/DOCX support (max 5MB)
- 🤖 **AI Analysis** — NLP-based skill extraction and scoring
- 📊 **Score Dashboard** — Overall score, ATS score, Job Match score
- 🎯 **Skill Matching** — Matching and missing skills detection
- 🔑 **Keyword Analysis** — TF-IDF keyword extraction from job descriptions
- 💪 **Strengths & Weaknesses** — Personalized resume feedback
- 💡 **Recommendations** — Actionable improvement suggestions
- 🎯 **Role Suggestions** — Recommended job roles with match percentages
- 📋 **Analysis History** — Track all past analyses
- ⚙️ **Profile Settings** — Update name and password

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI Framework |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Recharts | Score trend charts |
| React Dropzone | File upload |
| React Toastify | Notifications |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js 18+ | Runtime |
| Express.js | REST API framework |
| Mongoose | MongoDB ODM |
| JWT | Authentication |
| Multer | File upload handling |
| bcryptjs | Password hashing |
| Helmet | Security headers |

### AI Analysis Service
| Technology | Purpose |
|-----------|---------|
| Python 3.11+ | Runtime |
| FastAPI | API framework |
| PyMuPDF | PDF text extraction |
| python-docx | DOCX text extraction |
| scikit-learn | TF-IDF keyword extraction |

### Database
| Technology | Purpose |
|-----------|---------|
| MongoDB | Primary database |
| Mongoose | Schema modeling |

---

## 🏗️ Architecture


**Data Flow:**
1. User uploads resume + enters job description in React UI
2. React sends file to `POST /api/resumes/upload`
3. Express forwards file to Python FastAPI `/extract`
4. Python extracts text, returns to Express
5. Express saves Resume doc, returns `resumeId`
6. React posts `{ resumeId, jobTitle, jobDescription }` to `POST /api/analyses`
7. Express calls Python FastAPI `/analyze`
8. Python scores resume, returns full analysis JSON
9. Express saves Analysis to MongoDB, returns results
10. React displays results dashboard

---

## 📁 Project Structure


---

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas)
- pip

###  Clone the Repository

```bash
git clone https://github.com/yourusername/ai-resume-analyzer.git
cd ai-resume-analyzer


