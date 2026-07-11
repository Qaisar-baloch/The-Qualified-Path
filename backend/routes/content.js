const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const SEED_FILE = path.join(
  __dirname,
  "..",
  "..",
  "database",
  "seed-data",
  "usat-sections.json"
);

// GET /api/content/usat — USAT/HAT prep sections
// Reads from database/seed-data for now. Swap this for a real SQL query
// once the material lives in the database instead of a JSON file.
router.get("/usat", (req, res) => {
  try {
    const sections = JSON.parse(fs.readFileSync(SEED_FILE, "utf-8"));
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: "Could not load USAT content." });
  }
});

module.exports = router;
