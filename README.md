# InterviewAI — Full Stack Project

A React + Tailwind frontend and Express + MongoDB + Gemini backend for generating personalized interview reports from a PDF resume, self-description, and job description.

## Requirements
- Node.js 20 or newer
- MongoDB local or Atlas connection string
- Google Gemini API key

## 1. Backend setup
```bash
cd Backend
npm install
```
Copy `.env.example` to `.env`, then fill in `MONGO_URI`, `JWT_SECRET`, and `GOOGLE_GENAI_API_KEY`.
```bash
npm run dev
```
Backend default: `http://localhost:3000`; health check: `http://localhost:3000/api/health`.

## 2. Frontend setup
Open another terminal:
```bash
cd Frontend
npm install
```
Copy `.env.example` to `.env` if needed. Start the frontend:
```bash
npm run dev
```
Frontend default: `http://localhost:5173`.

## API routes
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — sign in
- `POST /api/auth/logout` — sign out
- `GET /api/auth/get-me` — current user
- `POST /api/interview` — multipart form with `resume` (PDF), `selfDescription`, `jobDescription`
- `GET /api/interview` — current user's report summaries
- `GET /api/interview/report/:interviewId` — fetch one owned report
- `POST /api/interview/resume/pdf/:interviewReportId` — create tailored resume PDF

Authentication uses an HTTP-only cookie. The frontend sends credentials with Axios.

## Notes
- Never commit `.env` files or expose your Gemini API key.
- PDF extraction works for text-based PDFs; scanned image PDFs require OCR, which is not included.
- Gemini model can be changed with `GEMINI_MODEL` in the backend `.env`.
