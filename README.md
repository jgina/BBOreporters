# BBOreporters

A professional MERN news website and admin CMS inspired by newspaper platforms.

## Structure

- `backend/` - Express API, MongoDB models, JWT authentication, Cloudinary upload
- `frontend/` - React public site, admin dashboard, React Router, React Quill

## Run locally

### Backend

```bash
cd backend
npm install
cp .env.example .env
# update .env values before starting
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### Run separately from project root

```bash
npm run start:backend
npm run start:frontend
```

## Notes

- Admin credentials are seeded with `ADMIN_USERNAME` / `ADMIN_PASSWORD` when running `npm run seed`.
- The frontend uses `REACT_APP_API_URL` to talk to the backend.
- Image uploads are handled with Cloudinary.
