# Requirements Document

## Introduction

The AI Resume Analyzer is a full-stack web application that allows users to register and log in, upload a resume (PDF or DOCX), enter a job description, and receive a detailed AI-style analysis. The analysis covers an overall resume score, an estimated ATS compatibility score, a job-description match score, matching and missing skills, keyword analysis, resume strengths and weaknesses, improvement recommendations, and recommended job roles. Users can view their full analysis history on a professional dashboard. The system is composed of three layers: a React frontend, a Node.js/Express REST API backed by MongoDB, and a Python FastAPI microservice that performs all text extraction and analysis.

---

## Glossary

- **User**: A registered account holder who interacts with the application.
- **Resume**: A PDF or DOCX file uploaded by a User containing professional experience, skills, and education.
- **Job Description**: Free-text input provided by the User describing the target role's requirements.
- **Analysis**: The structured result produced by the Analysis_Service for a given Resume and Job Description.
- **Auth_Service**: The authentication subsystem of the Node/Express backend responsible for registration, login, and JWT issuance.
- **API_Server**: The Node.js/Express backend that handles all REST endpoints, communicates with MongoDB, and delegates analysis to the Analysis_Service.
- **Analysis_Service**: The Python FastAPI microservice that extracts text from resumes and performs all NLP-based scoring and analysis.
- **Database**: The MongoDB instance storing Users, Resumes, and Analyses.
- **JWT**: JSON Web Token used to authenticate requests to the API_Server.
- **ATS**: Applicant Tracking System — a class of software used by employers to filter resumes. The ATS score in this application is an **estimated** compatibility score, not output from a real ATS.
- **Dashboard**: The React page that shows summary statistics and recent analyses for the logged-in User.
- **Extracted_Text**: The plain-text content parsed from a Resume file by the Analysis_Service.
- **Score**: A numeric value in the range 0–100 representing a measured quality dimension (overall, ATS, job match).
- **Skill**: A term or phrase identified as a professional capability (e.g., "Python", "Project Management").
- **Keyword**: A significant term extracted from the Job Description used to measure resume alignment.

---

## Requirements

---

### Requirement 1: User Registration

**User Story:** As a new visitor, I want to create an account with my name, email, and password, so that I can save and revisit my resume analyses.

#### Acceptance Criteria

1. THE Auth_Service SHALL accept a registration request containing a non-empty name, a valid email address, and a password of at least 8 characters.
2. WHEN a registration request is received with a duplicate email, THE Auth_Service SHALL return an error response with HTTP status 409 and a message indicating the email is already registered.
3. WHEN a valid registration request is received, THE Auth_Service SHALL hash the password using bcrypt with a minimum cost factor of 10 before persisting the User record.
4. WHEN a valid registration request is received, THE Auth_Service SHALL store the User's name, email, hashed password, and createdAt timestamp in the Database.
5. WHEN a User is successfully registered, THE Auth_Service SHALL return an HTTP 201 response containing a JWT and the User's name and email (password hash excluded).
6. IF the registration request is missing any required field, THEN THE Auth_Service SHALL return an HTTP 400 response with a descriptive validation error message identifying the missing field(s).
7. THE Auth_Service SHALL never include the password or password hash in any API response.

---

### Requirement 2: User Login

**User Story:** As a registered user, I want to log in with my email and password, so that I can access my analyses and upload new resumes.

#### Acceptance Criteria

1. WHEN a login request is received with a valid email and correct password, THE Auth_Service SHALL return an HTTP 200 response containing a JWT and the User's name and email.
2. WHEN a login request is received with an email that does not match any registered User, THE Auth_Service SHALL return an HTTP 401 response with a generic "invalid credentials" message.
3. WHEN a login request is received with a valid email but an incorrect password, THE Auth_Service SHALL return an HTTP 401 response with a generic "invalid credentials" message.
4. IF the login request is missing the email or password field, THEN THE Auth_Service SHALL return an HTTP 400 response with a descriptive validation error.
5. THE Auth_Service SHALL issue JWTs with an expiry of 7 days.
6. THE Auth_Service SHALL never include the password or password hash in any API response.

---

### Requirement 3: JWT-Protected Route Access

**User Story:** As a logged-in user, I want my session to be secured by a token, so that other users cannot access my data.

#### Acceptance Criteria

1. WHILE a request carries a valid, non-expired JWT in the Authorization header, THE API_Server SHALL permit access to all protected endpoints.
2. WHEN a request to a protected endpoint is received without a JWT, THE API_Server SHALL return an HTTP 401 response.
3. WHEN a request to a protected endpoint is received with an expired or invalid JWT, THE API_Server SHALL return an HTTP 401 response.
4. THE API_Server SHALL extract the userId from the JWT and scope all data queries to that userId, preventing cross-user data access.

---

### Requirement 4: Frontend Route Protection

**User Story:** As a visitor, I want unauthenticated pages to redirect me to login, so that private content is not visible without an account.

#### Acceptance Criteria

1. WHEN an unauthenticated visitor navigates to any protected React route (Dashboard, Analyze, Results, History, Settings), THE Frontend SHALL redirect the visitor to the Login page.
2. WHEN an authenticated User navigates to the Login or Register page, THE Frontend SHALL redirect the User to the Dashboard.
3. THE Frontend SHALL persist the JWT in localStorage and include it as a Bearer token in the Authorization header of all API requests.
4. WHEN the stored JWT is removed or the User clicks logout, THE Frontend SHALL clear the JWT from localStorage and redirect to the Login page.

---

### Requirement 5: Resume Upload

**User Story:** As a logged-in user, I want to upload a PDF or DOCX resume file, so that the system can extract its text for analysis.

#### Acceptance Criteria

1. THE API_Server SHALL accept resume file uploads only for file types with MIME types `application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
2. IF a file upload request contains a file with an unsupported MIME type, THEN THE API_Server SHALL return an HTTP 400 response with the message "Only PDF and DOCX files are accepted."
3. THE API_Server SHALL enforce a maximum file size of 5 MB per upload.
4. IF a file upload request contains a file exceeding 5 MB, THEN THE API_Server SHALL return an HTTP 400 response with the message "File size must not exceed 5 MB."
5. WHEN a valid file is uploaded, THE API_Server SHALL forward the file binary to the Analysis_Service for text extraction and SHALL store the Resume record (userId, fileName, extractedText, uploadedAt) in the Database.
6. WHEN text extraction succeeds, THE API_Server SHALL return an HTTP 201 response containing the resumeId and a confirmation message.
7. IF the Analysis_Service returns an error during text extraction, THEN THE API_Server SHALL return an HTTP 422 response with the message "Could not extract text from the uploaded file."
8. THE Frontend SHALL provide a drag-and-drop upload zone and a file-picker fallback, display a progress indicator during upload, and show a success or error toast notification upon completion.

---

### Requirement 6: Text Extraction

**User Story:** As the system, I need to reliably extract plain text from uploaded resume files, so that analysis can be performed on the content.

#### Acceptance Criteria

1. WHEN the Analysis_Service receives a PDF file, THE Analysis_Service SHALL extract all text content using PyMuPDF and return the cleaned plain text.
2. WHEN the Analysis_Service receives a DOCX file, THE Analysis_Service SHALL extract all paragraph text using python-docx and return the cleaned plain text.
3. THE Analysis_Service SHALL clean extracted text by removing excessive whitespace, non-printable characters, and redundant line breaks before returning it.
4. IF the Analysis_Service receives a file from which no text can be extracted (e.g., image-only PDF), THEN THE Analysis_Service SHALL return an HTTP 422 response with a descriptive error message.
5. FOR ALL valid PDF and DOCX input files, extracting text and then re-encoding it to UTF-8 SHALL produce text that preserves all human-readable content from the original file (round-trip text integrity property).

---

### Requirement 7: Resume Analysis

**User Story:** As a logged-in user, I want to submit my uploaded resume along with a job title and job description, so that I receive a comprehensive analysis of how well my resume matches the role.

#### Acceptance Criteria

1. WHEN an analysis request is received with a valid resumeId (owned by the requesting User), a non-empty jobTitle, and a non-empty jobDescription of at least 50 characters, THE API_Server SHALL forward the Extracted_Text, jobTitle, and jobDescription to the Analysis_Service.
2. WHEN the Analysis_Service completes successfully, THE API_Server SHALL persist an Analysis record in the Database containing all scored fields and return an HTTP 201 response with the full Analysis object.
3. IF the resumeId in an analysis request does not belong to the requesting User, THEN THE API_Server SHALL return an HTTP 403 response.
4. IF the jobDescription is fewer than 50 characters, THEN THE API_Server SHALL return an HTTP 400 response with the message "Job description must be at least 50 characters."
5. IF the Analysis_Service returns an error, THEN THE API_Server SHALL return an HTTP 502 response with the message "Analysis service unavailable. Please try again."
6. THE Analysis_Service SHALL return a structured JSON response containing: overallScore, atsScore, jobMatchScore, matchingSkills (array), missingSkills (array), keywords (array of objects with term and frequency), strengths (array), weaknesses (array), recommendations (array), and recommendedRoles (array of objects with role and matchPercentage).

---

### Requirement 8: Scoring Engine

**User Story:** As a user, I want the analysis scores to reflect a meaningful comparison between my resume and the job description, so that I can trust the feedback.

#### Acceptance Criteria

1. THE Analysis_Service SHALL compute the jobMatchScore as the percentage of Job Description keywords present in the Extracted_Text, expressed as a value in the range 0–100.
2. THE Analysis_Service SHALL compute the atsScore based on the presence of standard resume sections (e.g., education, experience, skills), absence of complex formatting, and keyword density, expressed as a value in the range 0–100.
3. THE Analysis_Service SHALL compute the overallScore as a weighted combination: jobMatchScore × 0.5 + atsScore × 0.3 + a formatting/completeness sub-score × 0.2, expressed as a value in the range 0–100.
4. THE Analysis_Service SHALL identify matchingSkills as the intersection of Skills found in the Extracted_Text and Skills referenced in the Job Description.
5. THE Analysis_Service SHALL identify missingSkills as Skills referenced in the Job Description that are absent from the Extracted_Text.
6. WHEN two resumes with identical content are submitted with the same Job Description, THE Analysis_Service SHALL return identical scores for both (determinism property).
7. FOR ALL valid resume/job-description pairs, the overallScore SHALL be in the range 0–100 inclusive (invariant property).
8. FOR ALL valid resume/job-description pairs, the atsScore SHALL be in the range 0–100 inclusive.
9. FOR ALL valid resume/job-description pairs, the jobMatchScore SHALL be in the range 0–100 inclusive.

---

### Requirement 9: Keyword and Skill Analysis

**User Story:** As a user, I want to see which keywords and skills I'm missing, so that I know exactly what to add to improve my resume.

#### Acceptance Criteria

1. THE Analysis_Service SHALL extract the top 20 most significant keywords from the Job Description using TF-IDF weighting, excluding common English stop words.
2. THE Analysis_Service SHALL return each keyword as an object with a `term` string and a `frequency` integer representing how many times it appears in the Job Description.
3. THE Analysis_Service SHALL identify Skills in the Extracted_Text by matching against a predefined skill taxonomy of at least 200 common technical and professional skills.
4. THE Analysis_Service SHALL return matchingSkills and missingSkills as arrays of plain strings.
5. WHEN a skill appears in both the resume and the job description with different letter cases (e.g., "python" vs "Python"), THE Analysis_Service SHALL treat it as a match (case-insensitive comparison).

---

### Requirement 10: Recommendations and Role Suggestions

**User Story:** As a user, I want to receive actionable recommendations and a list of roles that fit my resume, so that I can improve my resume and explore relevant opportunities.

#### Acceptance Criteria

1. THE Analysis_Service SHALL generate a strengths list containing at least 2 and at most 6 concise statements identifying strong attributes of the submitted resume relative to the Job Description.
2. THE Analysis_Service SHALL generate a weaknesses list containing at least 1 and at most 6 concise statements identifying areas where the resume falls short relative to the Job Description.
3. THE Analysis_Service SHALL generate a recommendations list containing at least 3 and at most 8 specific, actionable improvement suggestions for the submitted resume.
4. THE Analysis_Service SHALL generate a recommendedRoles list containing at least 3 and at most 8 job role objects, each with a `role` string and a `matchPercentage` value in the range 0–100.
5. WHEN the jobMatchScore is below 40, THE Analysis_Service SHALL include at least one recommendation explicitly advising the User to add the top 3 missing keywords to the resume.

---

### Requirement 11: Analysis History

**User Story:** As a logged-in user, I want to view a list of all my past analyses, so that I can track my improvement over time.

#### Acceptance Criteria

1. WHEN the API_Server receives an authenticated request to retrieve analysis history, THE API_Server SHALL return all Analysis records belonging to the requesting User, sorted by createdAt descending.
2. THE API_Server SHALL return each Analysis record with at minimum: analysisId, jobTitle, overallScore, atsScore, jobMatchScore, and createdAt.
3. WHEN a User has no prior analyses, THE API_Server SHALL return an HTTP 200 response with an empty array.
4. WHEN the API_Server receives an authenticated request for a single Analysis by analysisId, THE API_Server SHALL return the full Analysis record if it belongs to the requesting User.
5. IF an analysisId in a single-record request does not belong to the requesting User, THEN THE API_Server SHALL return an HTTP 403 response.

---

### Requirement 12: Dashboard Statistics

**User Story:** As a logged-in user, I want to see summary statistics about my usage on the Dashboard, so that I can get a quick overview of my progress.

#### Acceptance Criteria

1. WHEN the Dashboard is loaded, THE API_Server SHALL return the following statistics for the requesting User: total resume count, total analysis count, average overallScore across all analyses, and the highest overallScore across all analyses.
2. THE API_Server SHALL return the 5 most recent Analysis records (jobTitle, overallScore, atsScore, jobMatchScore, createdAt) for display in a recent-analyses list.
3. THE API_Server SHALL return a time-series array of overallScore values with corresponding createdAt dates for rendering a score-trend chart on the Dashboard.
4. WHEN a User has no analyses, THE API_Server SHALL return zero for all numeric statistics and empty arrays for lists and charts.

---

### Requirement 13: Settings and Profile Management

**User Story:** As a logged-in user, I want to update my name and password from a settings page, so that I can keep my account information current.

#### Acceptance Criteria

1. WHEN the API_Server receives an authenticated request to update the User's name with a non-empty value, THE API_Server SHALL update the name in the Database and return the updated User object (password excluded).
2. WHEN the API_Server receives an authenticated request to update the User's password, THE API_Server SHALL require the current password, verify it against the stored hash, hash the new password with bcrypt (minimum cost 10), and store the new hash.
3. IF the current password provided in a password-change request does not match the stored hash, THEN THE API_Server SHALL return an HTTP 401 response with the message "Current password is incorrect."
4. IF the new password in a password-change request is fewer than 8 characters, THEN THE API_Server SHALL return an HTTP 400 response with the message "Password must be at least 8 characters."
5. THE API_Server SHALL never return the password hash in any settings or profile response.

---

### Requirement 14: Error Handling and Resilience

**User Story:** As a user, I want clear and consistent error messages across the application, so that I understand what went wrong and what to do next.

#### Acceptance Criteria

1. THE API_Server SHALL return all error responses as JSON objects with at minimum an `error` string field and an `message` string field.
2. WHEN the Analysis_Service is unreachable, THE API_Server SHALL return an HTTP 502 response within 30 seconds rather than hanging indefinitely.
3. THE API_Server SHALL set a request timeout of 30 seconds for all calls to the Analysis_Service.
4. THE Frontend SHALL display a toast notification for every API error response, using the `message` field from the error response body.
5. THE Frontend SHALL display loading skeleton screens while awaiting API responses on the Dashboard, History, and Results pages.
6. WHEN a Frontend page receives an empty data set (no analyses, no resumes), THE Frontend SHALL display an empty-state illustration with a prompt to take the first action.
7. IF an unhandled exception occurs in the API_Server, THEN THE API_Server SHALL log the error with a timestamp and stack trace and return an HTTP 500 response with a generic "Internal server error" message (without exposing the stack trace to the client).

---

### Requirement 15: Input Validation

**User Story:** As a user, I want the application to validate my inputs and give me immediate feedback, so that I don't waste time submitting incomplete or invalid data.

#### Acceptance Criteria

1. THE Frontend SHALL validate the registration form and display inline field-level error messages before submitting to the API_Server for: empty name, invalid email format, and password shorter than 8 characters.
2. THE Frontend SHALL validate the login form and display inline error messages before submission for: empty email and empty password.
3. THE Frontend SHALL prevent submission of the analysis form if no resume file is selected, jobTitle is empty, or jobDescription contains fewer than 50 characters.
4. THE Frontend SHALL display a character count indicator on the jobDescription input field showing current length and the 50-character minimum threshold.
5. THE API_Server SHALL validate all incoming request bodies using a schema validation library and return structured HTTP 400 responses for any validation failure.

---

### Requirement 16: Security Constraints

**User Story:** As a user, I want my data to be securely stored and transmitted, so that my personal information and resume content are protected.

#### Acceptance Criteria

1. THE Auth_Service SHALL hash all passwords using bcrypt before storage and SHALL never store plaintext passwords.
2. THE API_Server SHALL sign JWTs with a secret key stored in an environment variable and SHALL never hardcode secrets in source code.
3. THE API_Server SHALL restrict file upload endpoints to authenticated Users only.
4. THE API_Server SHALL validate file MIME type and file size server-side, independent of any client-side checks.
5. THE Analysis_Service SHALL not persist any resume file content to disk beyond the duration of a single request.
6. THE API_Server SHALL include `Content-Security-Policy`, `X-Content-Type-Options`, and `X-Frame-Options` response headers on all responses.

---

### Requirement 17: README Documentation

**User Story:** As a developer, I want a comprehensive README, so that I can understand, install, and run the project without additional guidance.

#### Acceptance Criteria

1. THE README SHALL include a project overview, a features list, and a technology stack section.
2. THE README SHALL include an architecture description explaining the data flow between the Frontend, API_Server, Analysis_Service, and Database.
3. THE README SHALL include step-by-step installation instructions for each service (Frontend, API_Server, Analysis_Service) including prerequisite software versions.
4. THE README SHALL document all required environment variables for the API_Server and Analysis_Service with descriptions of each variable's purpose and an example value.
5. THE README SHALL include a complete API endpoints reference table listing method, path, authentication requirement, request body fields, and response shape for every endpoint.
6. THE README SHALL include a section describing how the Python Analysis_Service works, covering text extraction, skill identification, keyword extraction, and score computation.
7. THE README SHALL include a placeholder Screenshots section with descriptive labels for each page.
8. THE README SHALL include a Future Improvements section listing at least 5 potential enhancements.
