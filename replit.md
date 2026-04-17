# BBOReporters

A professional MERN stack news website and Content Management System (CMS).

## Architecture

- **Frontend**: React 18 (Create React App) — runs on port 5000 in development
- **Backend**: Express.js (Node.js) — runs on port 3001 in development
- **Database**: MongoDB (via MongoDB Atlas) using Mongoose
- **Auth**: JWT + bcryptjs
- **Image uploads**: Cloudinary (via Multer)

## Project Structure

```
├── backend/           # Express API
│   ├── config/        # DB and Cloudinary configs
│   ├── controllers/   # Route handlers
│   ├── middleware/    # Auth, error handling, upload
│   ├── models/        # Mongoose schemas (User, Post, Category)
│   ├── routes/        # API routes
│   ├── .env           # Backend environment variables
│   └── server.js      # Backend entry point
├── frontend/          # React client
│   ├── src/
│   │   ├── admin/     # Admin dashboard pages
│   │   ├── components/# Reusable UI (Header, Footer, Sidebar)
│   │   ├── pages/     # Public pages (Home, Post, Category)
│   │   ├── services/  # Axios API abstraction
│   │   └── App.js     # Root routing
│   └── .env           # Frontend environment variables
└── start.sh           # Dev startup script (both services)
```

## Development

The `Start application` workflow runs `bash start.sh` which:
1. Starts the Express backend on port 3001
2. Starts the React dev server on port 5000 (proxies /api to backend)

## Key Environment Variables (backend/.env)

- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — JWT signing secret
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary image hosting
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` — Seed admin credentials

## Production Deployment

Build step: `cd frontend && npm run build`
Run command: `node backend/server.js`

In production, the backend serves the React build as static files and exposes all `/api` routes. The PORT defaults to 5000 and listens on 0.0.0.0.

## Admin Access

Visit `/admin/login` to access the CMS dashboard. Default credentials are set via `ADMIN_USERNAME` and `ADMIN_PASSWORD` in the backend `.env` file. Run `cd backend && node seedAdmin.js` to seed the admin user.
