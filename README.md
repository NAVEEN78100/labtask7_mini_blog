# Mini Blog Lab (Express + EJS + MongoDB)

## Quick start
1. Copy the folder to your machine or extract the ZIP.
2. Rename `.env.example` to `.env` and update `MONGO_URI` and `SESSION_SECRET`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start MongoDB (or use Mongo Atlas) and run:
   ```bash
   npm start
   ```
5. Open http://localhost:3000

## What it includes
- User registration & login (bcrypt + express-session)
- CRUD for posts (server-rendered views + JSON REST API)
- EJS templates, method-override for PUT/DELETE

## Notes
- This uses the default MemoryStore for sessions (fine for lab/demo). For production use a persistent store.