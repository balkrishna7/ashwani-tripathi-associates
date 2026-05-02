# Ashwani Tripathi & Associates

Full-stack lawyer website with:

- premium public-facing frontend
- first-time admin setup and secure login
- blog publishing API
- legal news aggregation with fallback content
- consultation request capture
- newsletter subscription capture

## Tech Stack

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Auth: JWT + bcrypt
- News feed: Google News RSS aggregation with fallback legal briefings

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment

Copy `.env.example` to `.env` and update the values:

```bash
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ashwani-tripathi-associates
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_ORIGIN=http://localhost:5000
NEWS_CACHE_MINUTES=15
```

## 3. Run locally

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Then open:

```text
http://localhost:5000
```

## 4. First-time admin setup

Open the website, go to the `Admin Dashboard` section, and use the `First-Time Setup` form to create the first admin account.

## Main API Routes

- `GET /api/health`
- `GET /api/news`
- `GET /api/blog`
- `POST /api/blog` (admin auth required)
- `GET /api/admin/status`
- `POST /api/admin/setup`
- `POST /api/admin/login`
- `GET /api/admin/me`
- `GET /api/admin/dashboard` (admin auth required)
- `POST /api/consultations`
- `GET /api/consultations` (admin auth required)
- `POST /api/newsletter`

## Deploy Notes

This project now runs best as a single Node/Express app so the frontend and backend use the same origin.

Recommended deployment targets:

- Render
- Railway
- VPS / Node hosting

For deployment:

1. set the environment variables
2. install dependencies with `npm install`
3. start the app with `npm start`

## Important

- MongoDB is required for persistent admin, blog, consultation, and newsletter data.
- If live news fetch fails, the frontend still shows fallback legal briefings so the section never goes blank.
