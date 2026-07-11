const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body." }) };
  }

  const { name, email, service, message } = data;
  if (!name || !email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Name and email are required." }),
    };
  }

  // These come from Netlify's Site settings → Environment variables —
  // no .env file needed here, Netlify injects them at runtime.
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn("Email not configured — set EMAIL_USER / EMAIL_APP_PASSWORD in Netlify env vars.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Email not configured on the server yet." }),
    };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Route to Hungary" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      replyTo: email,
      subject: `New consultation request — ${service || "Unspecified"}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Service: ${service || "Unspecified"}`,
        `Message: ${message || "(none)"}`,
        `Received: ${new Date().toISOString()}`,
      ].join("\n"),
    });

    return { statusCode: 201, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error("Email send failed:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: "Could not send email." }) };
  }
};
