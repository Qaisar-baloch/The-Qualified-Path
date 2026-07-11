const express = require("express");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const router = express.Router();
const DATA_FILE = path.join(__dirname, "..", "data", "messages.json");

// Set these in backend/.env (see .env.example) — never commit real credentials.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function sendNotification(entry) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn(
      "Email not configured — skipping notification. See backend/.env.example."
    );
    return;
  }

  await transporter.sendMail({
    from: `"Route to Hungary" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO || process.env.EMAIL_USER,
    replyTo: entry.email,
    subject: `New consultation request — ${entry.service}`,
    text: [
      `Name: ${entry.name}`,
      `Email: ${entry.email}`,
      `Service: ${entry.service}`,
      `Message: ${entry.message || "(none)"}`,
      `Received: ${entry.receivedAt}`,
    ].join("\n"),
  });
}

function readMessages() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeMessages(messages) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
}

// POST /api/contact — a visitor requesting a consultation/review
router.post("/", async (req, res) => {
  const { name, email, service, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required." });
  }

  const entry = {
    id: Date.now(),
    name,
    email,
    service: service || "Unspecified",
    message: message || "",
    receivedAt: new Date().toISOString(),
  };

  const messages = readMessages();
  messages.push(entry);
  writeMessages(messages);

  try {
    await sendNotification(entry);
  } catch (err) {
    // The submission is already saved to messages.json above, so nothing
    // is lost even if email delivery fails. Log it and move on.
    console.error("Email notification failed:", err.message);
  }

  res.status(201).json({ ok: true });
});

// GET /api/contact — list submissions (add real auth before using this in production)
router.get("/", (req, res) => {
  res.json(readMessages());
});

module.exports = router;
