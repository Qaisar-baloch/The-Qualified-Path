# Route to Hungary

A website for Stipendium Hungaricum scholarship preparation, guidance, and consultation.
Starts with one scholarship; built to expand to others later.

## Structure

```
frontend/   what visitors see — plain HTML/CSS/JS, no build step
backend/    API server (Node + Express) — contact form, future content endpoints
database/   schema + seed data — where your real material will eventually live
```

Right now the frontend shows static placeholder content, and can *also* talk to
the backend for two things:
1. The consultation/contact form (`POST /api/contact`)
2. USAT/HAT prep sections (`GET /api/content/usat`) — currently reading from
   `database/seed-data/usat-sections.json`, ready to move into a real database.

## Running it locally

You'll need [Node.js](https://nodejs.org) installed (v18+).

**1. Start the backend:**
```
cd backend
npm install
npm run dev
```
This runs the API at `http://localhost:3000`.

**2. Open the frontend:**
Just open `frontend/index.html` in your browser — no build step needed.
(For a smoother experience, use a simple local server, e.g. the "Live Server"
extension in VS Code, or `npx serve frontend`.)

The frontend is already pointed at `http://localhost:3000/api` in
`frontend/js/main.js`. When you deploy, update `API_BASE` to your live
backend URL.

## Adding your real content

- **USAT/HAT material** → edit `database/seed-data/usat-sections.json` for
  now (each object is one card on the site). No backend restart needed if
  you use nodemon; otherwise restart `npm run dev`.
- **Motivation letter / CV guides** → currently static in
  `frontend/index.html` under `#docs`. Once you have more material than fits
  comfortably in HTML, we'll move these into the database too (`guides` table
  in `database/schema.sql`).
- **Consultation pricing** → edit the `.consult-list` in
  `frontend/index.html`, or move to the `services` table later.
- **Application procedure timeline** → static in `frontend/index.html` under
  `#procedure`.

## Where the database fits in

`database/schema.sql` is written for SQLite (a real database that lives in a
single file — no server to manage). It's not wired up yet; the backend
currently reads/writes plain JSON files (`database/seed-data/*.json` for
content, `backend/data/messages.json` for form submissions). That's
intentional — it keeps things simple while you're still assembling material.

When you're ready to move to the real database:
1. `npm install better-sqlite3` in `backend/`
2. Run `database/schema.sql` against a new `.db` file
3. Swap the `fs.readFileSync` calls in `backend/routes/*.js` for SQL queries

This is a good task to hand to **Claude Code** once you get there — point it
at this repo and ask it to wire up the SQLite migration.

## Email notifications for the contact form

Form submissions are saved to `backend/data/messages.json` either way, and
now also trigger an email to you using Gmail + nodemailer.

Setup (5 minutes):
1. Turn on **2-Step Verification** on the Gmail account you want to send
   from, if it isn't already: https://myaccount.google.com/security
2. Generate an **app password**: https://myaccount.google.com/apppasswords
   — this is a 16-character code, different from your normal password.
3. In `backend/`, copy `.env.example` to a new file named `.env`:
   ```
   cd backend
   cp .env.example .env
   ```
4. Open `.env` and fill in:
   - `EMAIL_USER` — the Gmail address sending the notification
   - `EMAIL_APP_PASSWORD` — the app password from step 2
   - `EMAIL_TO` — where you want to receive requests (can be the same address)
5. Restart the backend (`npm run dev`). Submit the form on the site — you
   should get an email within seconds, with the applicant's email set as
   "reply to" so you can respond directly.

`.env` is already listed in `.gitignore` — never commit it or share it,
since it holds real credentials.

## Deploying

- **Frontend**: any static host — Netlify, Vercel, GitHub Pages (drag and
  drop the `frontend/` folder).
- **Backend**: needs a Node host — Render, Railway, or Fly.io all have free
  tiers suitable for a project this size.

## Next steps

1. Drop your USAT/HAT material into `database/seed-data/usat-sections.json`
2. Write out your motivation letter & CV guides
3. Set real prices in the consultation section
4. Wire up email notifications for form submissions (see the `TODO` in
   `backend/routes/contact.js`)
