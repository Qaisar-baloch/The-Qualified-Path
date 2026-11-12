const nodemailer = require("nodemailer");

const json = (statusCode, body) => ({ statusCode, body: JSON.stringify(body) });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (err) {
    return json(400, { error: "Invalid request body." });
  }

  const { name, email, service, message, website } = data;

  // Honeypot: bots fill the hidden field. Pretend success and send nothing.
  if (website) return json(201, { ok: true });

  if (!name || !email || !message) {
    return json(400, { error: "Name, email and message are required." });
  }
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    name.length > 100 ||
    message.length > 2000
  ) {
    return json(400, { error: "Invalid input." });
  }

  // From Netlify's Site settings → Environment variables.
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn("Email not configured — set EMAIL_USER / EMAIL_APP_PASSWORD in Netlify env vars.");
    return json(500, { error: "Email not configured on the server yet." });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const FROM = `"The Qualified Path" <${process.env.EMAIL_USER}>`;

  try {
    // 1) Notify you; replying to this email answers the visitor directly.
    await transporter.sendMail({
      from: FROM,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      replyTo: email,
      subject: `New question — ${service || "General"} — ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Topic: ${service || "General"}`,
        `Message:\n${message}`,
        `Received: ${new Date().toISOString()}`,
        "",
        "Reply to this email to answer them directly.",
      ].join("\n"),
    });
  } catch (err) {
    console.error("Email send failed:", err.message);
    return json(500, { error: "Could not send email." });
  }

  // 2) Confirmation to the visitor. If this fails, the request still succeeds.
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: "We got your question — The Qualified Path",
      text: [
        `Hi ${name},`,
        "",
        "Thanks for reaching out. Your question has been received and I'll reply by email, usually within a few days.",
        "",
        "Your message:",
        message,
        "",
        "In the meantime, free prep material and guides are on the site: https://the-qualified-path.netlify.app",
        "",
        "— The Qualified Path",
      ].join("\n"),
    });
  } catch (err) {
    console.warn("Confirmation email failed:", err.message);
  }

  return json(201, { ok: true });
};
