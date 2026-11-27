(() => {
  const steps = [
    ["roadmap", "Understand the scholarship process"],
    ["usat", "Review test preparation"],
    ["opportunities", "Shortlist scholarships"],
    ["procedure", "Review application instructions"],
    ["docs", "Prepare your documents"],
  ];
  const search = document.querySelector("#path-search");
  const dashboard = document.querySelector("#path-dashboard");
  const login = document.querySelector("#path-login");
  const query = search.querySelector("input");
  const results = search.querySelector("ul");
  const checklist = dashboard.querySelector("ul");
  const progress = dashboard.querySelector("progress");
  const summary = dashboard.querySelector("[data-summary]");
  const storageKey = "qualified-path.milestones.v1";
  let completed = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved)) completed = new Set(saved.filter(id => steps.some(([key]) => key === id)));
  } catch {
    dashboard.querySelector("[data-storage]").textContent = "Progress can be saved for this visit.";
  }

  function updateProgress() {
    progress.value = completed.size;
    summary.textContent = completed.size + " of " + steps.length + " milestones complete";
  }

  for (const [id, title] of steps) {
    const item = document.createElement("li");
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed.has(id);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) completed.add(id);
      else completed.delete(id);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...completed]));
      } catch {
        dashboard.querySelector("[data-storage]").textContent = "Progress can be saved for this visit.";
      }
      updateProgress();
    });
    label.append(checkbox, title);
    const link = document.createElement("a");
    link.href = "#" + id;
    link.textContent = "Open";
    link.setAttribute("aria-label", "Open " + title);
    link.addEventListener("click", () => dashboard.close());
    item.append(label, link);
    checklist.append(item);
  }
  updateProgress();

  function renderSearch() {
    const terms = query.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const items = [...document.querySelectorAll(
      "section[id] h2, section[id] h3, section[id] a[href]:not(.path-button)"
    )];
    const seen = new Set();
    results.replaceChildren();
    for (const item of items) {
      const title = item.textContent.replace(/\s+/g, " ").trim();
      const section = item.closest("section");
      const category = section.querySelector("h2")?.textContent.trim() || "";
      const href = item.matches("a") ? item.getAttribute("href") : "#" + section.id;
      if (!href || !title || !terms.every(term => (title + " " + category).toLowerCase().includes(term))) continue;
      if (!/^(https?:|#)/i.test(href) && /^[a-z][a-z\d+.-]*:/i.test(href)) continue;
      const key = title + "|" + href;
      if (seen.has(key)) continue;
      seen.add(key);
      const row = document.createElement("li");
      const link = document.createElement("a");
      link.href = href;
      link.textContent = title;
      if (item.hasAttribute("download")) link.setAttribute("download", item.getAttribute("download"));
      if (item.target === "_blank") {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      link.addEventListener("click", () => search.close());
      row.append(link);
      results.append(row);
      if (results.children.length === 30) break;
    }
    search.querySelector("[data-count]").textContent = results.children.length
      ? "Showing " + results.children.length + (results.children.length === 30 ? " matches at most" : " matches")
      : "No matching resources.";
  }
  query.addEventListener("input", renderSearch);

  const dialogs = {search, dashboard, login};
  document.querySelectorAll("[data-path-open]").forEach(button => {
    button.addEventListener("click", () => {
      const target = button.dataset.pathOpen;
      document.querySelectorAll("dialog.path-dialog[open]").forEach(dialog => dialog.close());
      if (target === "search") renderSearch();
      dialogs[target].showModal();
      if (target === "search") query.focus();
    });
  });
})();
