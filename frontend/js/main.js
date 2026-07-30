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

// --- Test-prep syllabus tabs (USAT / HAT), loaded from a static JSON file ---
let syllabusData = null;
let activeTest = "usat";
let activeStream = null;

function renderSubjectTable(rows, columnLabel) {
  return `
    <table class="syllabus-table">
      <thead><tr><th>Subject</th><th>${columnLabel}</th></tr></thead>
      <tbody>
        ${rows
          .map(
            (r) => `
          <tr><td>${r.subject}${
              r.breakdown
                ? `<div class="syllabus-breakdown">${r.breakdown.join(" · ")}</div>`
                : ""
            }</td><td>${r.count ?? r.weight}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>`;
}

function renderSamplePaper(stream) {
  if (!stream.samplePaper) {
    return `<div class="sample-missing">No sample paper added yet for ${stream.code} — check back soon.</div>`;
  }
  const sp = stream.samplePaper;
  const sections = sp.sections
    .map(
      (sec) => `
      <div class="sample-section">
        <h5 class="sample-section-title">${sec.title}</h5>
        ${sec.groups
          .map(
            (grp) => `
          ${grp.context ? `<div class="sample-passage">${grp.context}</div>` : ""}
          ${grp.questions
            .map(
              (q) => `
            <div class="sample-q">
              <div class="sample-q-text"><strong>${q.num}.</strong> ${q.text}</div>
              <div class="sample-options">
                ${Object.entries(q.options)
                  .map(([letter, text]) => `<span class="sample-opt">${letter}. ${text}</span>`)
                  .join("")}
              </div>
              <button class="reveal-btn" data-answer="${q.answer}">Show answer</button>
            </div>`
            )
            .join("")}`
          )
          .join("")}
      </div>`
    )
    .join("");

  const essays = sp.essays
    ? `
    <div class="sample-section">
      <h5 class="sample-section-title">Essay prompts (choose one from each)</h5>
      <div class="essay-block"><strong>Argumentative:</strong>
        <ul>${sp.essays.argumentative.map((e) => `<li>${e}</li>`).join("")}</ul>
      </div>
      <div class="essay-block"><strong>Narrative:</strong>
        <ul>${sp.essays.narrative.map((e) => `<li>${e}</li>`).join("")}</ul>
      </div>
    </div>`
    : "";

  return `<div class="sample-paper">${sections}${essays}</div>`;
}

function attachRevealHandlers() {
  document.querySelectorAll(".reveal-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.outerHTML = `<span class="answer-shown">Answer: ${btn.dataset.answer}</span>`;
    });
  });
}

function renderStreamTabs() {
  const group = syllabusData[activeTest];
  const container = document.getElementById("stream-tabs");
  container.innerHTML = group.streams
    .map(
      (s, i) =>
        `<button class="stream-btn${i === 0 ? " active" : ""}" data-code="${s.code}">${s.code}</button>`
    )
    .join("");

  container.querySelectorAll(".stream-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".stream-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeStream = btn.dataset.code;
      renderStreamContent();
    });
  });

  activeStream = group.streams[0].code;
}

function renderStreamContent() {
  const group = syllabusData[activeTest];
  const stream = group.streams.find((s) => s.code === activeStream);
  const content = document.getElementById("stream-content");

  if (activeTest === "usat") {
    content.innerHTML = `
      <div class="syllabus-info">${group.sharedInfo}</div>
      <h4 class="syllabus-stream-name">${stream.code} — ${stream.name}</h4>
      <div class="syllabus-part-label">Part I — common to all streams</div>
      ${renderSubjectTable(group.sharedPart1, "MCQs")}
      <div class="syllabus-part-label">Part I — subject-specific for ${stream.code}</div>
      ${renderSubjectTable(stream.subjects, "MCQs")}
      <div class="syllabus-part-label">Part II — essay (same for all streams)</div>
      ${renderSubjectTable(group.sharedPart2, "Marks")}
      <button class="sample-toggle-btn" id="sample-toggle-btn">Show sample paper for ${stream.code}</button>
      <div class="sample-container" id="sample-container" style="display:none;">${renderSamplePaper(stream)}</div>
    `;
    document.getElementById("sample-toggle-btn").addEventListener("click", (e) => {
      const box = document.getElementById("sample-container");
      const showing = box.style.display !== "none";
      box.style.display = showing ? "none" : "block";
      e.target.textContent = showing
        ? `Show sample paper for ${stream.code}`
        : `Hide sample paper for ${stream.code}`;
    });
    attachRevealHandlers();
  } else {
    content.innerHTML = `
      <div class="syllabus-info">${group.sharedInfo}</div>
      <h4 class="syllabus-stream-name">${stream.code} — ${stream.name}</h4>
      ${renderSubjectTable(stream.weights, "Weight")}
      <button class="sample-toggle-btn" id="sample-toggle-btn">Show sample paper for ${stream.code}</button>
      <div class="sample-container" id="sample-container" style="display:none;">${renderSamplePaper(stream)}</div>
    `;
    document.getElementById("sample-toggle-btn").addEventListener("click", (e) => {
      const box = document.getElementById("sample-container");
      const showing = box.style.display !== "none";
      box.style.display = showing ? "none" : "block";
      e.target.textContent = showing
        ? `Show sample paper for ${stream.code}`
        : `Hide sample paper for ${stream.code}`;
    });
    attachRevealHandlers();
  }
}

async function loadSyllabus() {
  try {
    const res = await fetch("data/test-streams.json");
    syllabusData = await res.json();
    renderStreamTabs();
    renderStreamContent();
    renderCalendar();
    renderOpportunities();
    renderRoadmapTable();
    renderProcedureTabs();
  } catch (err) {
    document.getElementById("stream-content").innerHTML =
      "<p>Could not load syllabus data.</p>";
  }
}

let activeProcedure = null;

function renderProcedureContent() {
  const steps = syllabusData.procedures[activeProcedure];
  const content = document.getElementById("procedure-content");
  if (!steps) {
    content.innerHTML = `
      <div class="sample-missing">Application steps for <strong>${activeProcedure}</strong> aren't built yet.
      In the meantime, see <a href="https://scholarship.hec.gov.pk/" target="_blank" rel="noopener">HEC's Opportunities Abroad portal</a> for the current process.</div>`;
    return;
  }
  content.innerHTML = steps
    .map(
      (s, i) => `
    <div class="tl-item">
      <div class="step">Step ${i + 1}</div>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
      ${s.link ? `<p class="tl-link"><a href="${s.link}" target="_blank" rel="noopener">${s.linkLabel}</a></p>` : ""}
    </div>`
    )
    .join("");
}

function renderProcedureTabs() {
  const list = syllabusData.otherOpportunities;
  const container = document.getElementById("procedure-tabs");
  container.innerHTML = list
    .map(
      (o, i) => `<button class="stream-btn${i === 0 ? " active" : ""}" data-name="${o.name.replace(/"/g, "&quot;")}">${o.name.split("—")[0].split("(")[0].trim()}</button>`
    )
    .join("");
  container.querySelectorAll(".stream-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".stream-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeProcedure = btn.dataset.name;
      renderProcedureContent();
    });
  });
  activeProcedure = list[0].name;
  renderProcedureContent();
}

function renderRoadmapTable() {
  const list = syllabusData.otherOpportunities;
  if (!list) return;
  const body = document.getElementById("roadmap-scholarship-body");
  body.innerHTML = list
    .map(
      (o) => `<tr><td>${o.name}${o.status === "active" ? ' <span class="roadmap-active-tag">active track</span>' : ""}</td><td>${o.eligibility || "Check HEC portal"}</td><td>${o.applicationWindow || "Check HEC portal"}</td></tr>`
    )
    .join("");
}

function renderOpportunities() {
  const list = syllabusData.otherOpportunities;
  if (!list) return;
  const container = document.getElementById("opp-grid");
  container.innerHTML = list
    .map(
      (o) => `
    <a class="opp-card${o.status === "active" ? " opp-active" : ""}" href="${o.link}" target="_blank" rel="noopener">
      ${o.status === "active" ? '<div class="opp-badge">This site\'s active track</div>' : ""}
      <div class="opp-country">${o.country}</div>
      <h3 class="opp-name">${o.name}</h3>
      <p class="opp-desc">${o.description}</p>
      <span class="opp-link">View on HEC portal →</span>
    </a>`
    )
    .join("");
}

let activeCalendarTest = 0;

function renderCalendarTable() {
  const cal = syllabusData.testCalendar;
  const test = cal.tests[activeCalendarTest];
  const container = document.getElementById("calendar-content");
  container.innerHTML = `
    <table class="syllabus-table calendar-table">
      <thead><tr><th>#</th><th>Announcement</th><th>Registration deadline</th><th>Roll No. slip</th><th>Test date</th><th>Result</th></tr></thead>
      <tbody>
        ${test.rounds
          .map(
            (r) => `<tr><td>${r.sr}</td><td>${r.announcement}</td><td>${r.regDeadline}</td><td>${r.rollSlip}</td><td><strong>${r.testDate}</strong></td><td>${r.result}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>
    <div class="calendar-source">Source: ${cal.source} — ${cal.year}</div>
  `;
}

function renderCalendar() {
  const cal = syllabusData.testCalendar;
  if (!cal) return;
  const toggle = document.getElementById("calendar-toggle");
  toggle.innerHTML = cal.tests
    .map((t, i) => `<button class="toggle-btn${i === 0 ? " active" : ""}" data-idx="${i}">${t.name}</button>`)
    .join("");
  toggle.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggle.querySelectorAll(".toggle-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCalendarTest = parseInt(btn.dataset.idx, 10);
      renderCalendarTable();
    });
  });
  activeCalendarTest = 0;
  renderCalendarTable();
}

document.getElementById("syllabus-toggle").querySelectorAll(".toggle-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".toggle-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeTest = btn.dataset.test;
    renderStreamTabs();
    renderStreamContent();
  });
});

loadSyllabus();

// --- FAQ accordion ---
document.querySelectorAll(".faq-question").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.parentElement.classList.toggle("open");
  });
});
