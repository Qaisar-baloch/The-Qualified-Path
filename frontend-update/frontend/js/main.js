// The contact form posts to a Netlify Function deployed alongside this site
// (see netlify/functions/contact.js) — no separate backend host needed.
// This path only works once the site is deployed on Netlify; locally, the
// form will show "couldn't reach the server," which is expected.
const API_BASE = "/.netlify/functions";

// --- Contact / consultation request form ---
const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    service: form.service.value,
    message: form.message.value.trim(),
  };

  status.className = "status";
  status.textContent = "Sending...";
  status.style.display = "block";

  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Request failed");
    status.className = "status ok";
    status.textContent = "Request received. You'll hear back by email soon.";
    form.reset();
  } catch (err) {
    status.className = "status err";
    status.textContent =
      "Couldn't reach the server. Make sure the backend is running, or email directly for now.";
  }
});

// --- Dynamic USAT/HAT content (falls back to the static HTML already in the page) ---
async function loadUsatSections() {
  try {
    const res = await fetch(`${API_BASE}/content/usat`);
    if (!res.ok) return; // keep static fallback markup
    const sections = await res.json();
    if (!Array.isArray(sections) || sections.length === 0) return;

    const container = document.getElementById("usat-sections");
    container.innerHTML = sections
      .map(
        (s) => `
      <div class="card">
        <div class="tag">${s.tag ?? "Section"}</div>
        <h3>${s.title}</h3>
        <p>${s.description ?? ""}</p>
        <ul>${(s.points ?? []).map((p) => `<li>${p}</li>`).join("")}</ul>
      </div>`
      )
      .join("");
  } catch (err) {
    // Backend not running yet — the static placeholder cards stay visible.
  }
}

loadUsatSections();
