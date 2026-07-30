# The Qualified Path

A scholarship prep, guidance, and consultation site for Pakistani students applying through HEC — starting with Stipendium Hungaricum, expanding to other HEC-facilitated scholarships over time.

**Live:** https://the-qualified-path.netlify.app *(update once renamed)*

## What's here

- Full USAT/HAT syllabus breakdown by stream, with official HEC weightages
- Interactive sample papers with answer reveal
- Downloadable past papers, mock tests, and prep material (including my own material from actually sitting the test)
- Application walkthrough with direct links to HEC and Tempus Public Foundation
- Motivation letter / CV / document guides
- A consultation booking form with email notifications
- A running list of other HEC-facilitated scholarships

## Stack

Plain HTML/CSS/JS frontend (no build step) + a Netlify Function handling the consultation form's email notifications. Content (syllabus, past papers, scholarship list) lives in JSON so it's easy to keep updating without touching the page markup.

## Structure

```
frontend/     the site itself
netlify/      serverless function for the contact form
database/     schema for a future move off flat JSON files
```

## Running locally

Open `frontend/index.html` directly in a browser — no build step needed.

## Deploying

Connected to Netlify — pushes to `main` deploy automatically. Environment variables (`EMAIL_USER`, `EMAIL_APP_PASSWORD`, `EMAIL_TO`) are set in Netlify's dashboard, not in this repo.

---

Built by Qaisar Baloch.
