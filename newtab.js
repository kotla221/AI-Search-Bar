const engines = [
  {
    id: "google",
    name: "Google",
    color: "#3f7ee8",
    url: (query) => `https://www.google.com/search?q=${query}`,
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    color: "#18d6b0",
    autoSubmit: true,
    url: (query) => `https://chatgpt.com/?q=${query}`,
  },
  {
    id: "claude",
    name: "Claude Code",
    color: "#e49b3f",
    autoSubmit: true,
    url: (query) => `https://claude.ai/new?q=${query}`,
  },
  {
    id: "gemini",
    name: "Gemini AI Mode",
    color: "#6f8cff",
    url: (query) => `https://www.google.com/search?udm=50&q=${query}`,
  },
  {
    id: "perplexity",
    name: "Perplexity",
    color: "#42c7bd",
    url: (query) => `https://www.perplexity.ai/search?q=${query}`,
  },
  {
    id: "grok",
    name: "Grok",
    color: "#aab2c0",
    url: (query) => `https://x.com/i/grok?text=${query}`,
  },
  {
    id: "reddit",
    name: "Reddit",
    color: "#ff7043",
    url: (query) => `https://www.reddit.com/search/?q=${query}`,
  },
  {
    id: "x",
    name: "X",
    color: "#c7ced9",
    url: (query) => `https://x.com/search?q=${query}&src=typed_query`,
  },
  {
    id: "amazon",
    name: "Amazon",
    color: "#ffbd4a",
    url: (query) => `https://www.amazon.com/s?k=${query}`,
  },
];

const root = document.documentElement;
const form = document.querySelector("#searchForm");
const input = document.querySelector("#queryInput");
const grid = document.querySelector("#engineGrid");
const modeLabel = document.querySelector("#modeLabel");
const dateLabel = document.querySelector("#dateLabel");
const clockLabel = document.querySelector("#clockLabel");
const themeToggle = document.querySelector("#themeToggle");
const themeLabel = document.querySelector("#themeLabel");
const defaultEngineLabel = document.querySelector("#defaultEngineLabel");
const defaultEngineButton = document.querySelector("#defaultEngineButton");

let defaultEngineId = localStorage.getItem("defaultEngine") || "chatgpt";
const savedEngine = localStorage.getItem("selectedEngine");
const initialEngine = savedEngine || defaultEngineId;
const savedTheme = localStorage.getItem("theme") || "dark";
let selectedEngine = engines.some((engine) => engine.id === initialEngine)
  ? initialEngine
  : "chatgpt";

function findEngine(engineId) {
  return engines.find((engine) => engine.id === engineId) ?? engines[0];
}

function getSelectedEngine() {
  return findEngine(selectedEngine);
}

function getDefaultEngine() {
  return findEngine(defaultEngineId);
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  themeLabel.textContent = theme === "light" ? "Light" : "Dark";
}

function renderDefaultControl() {
  const selected = getSelectedEngine();
  const currentDefault = getDefaultEngine();
  const isDefault = selected.id === currentDefault.id;

  defaultEngineLabel.textContent = `Default: ${currentDefault.name}`;
  defaultEngineButton.textContent = isDefault
    ? "Current engine is default"
    : `Make ${selected.name} default`;
  defaultEngineButton.disabled = isDefault;
}

function renderEngines() {
  grid.innerHTML = "";
  const selected = getSelectedEngine();
  modeLabel.textContent = `Search with ${selected.name}`;

  for (const engine of engines) {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "engine-option";
    option.setAttribute("role", "radio");
    option.setAttribute("aria-checked", String(engine.id === selectedEngine));
    option.dataset.engineId = engine.id;
    option.style.setProperty("--engine-color", engine.color);

    const dot = document.createElement("span");
    dot.className = "engine-dot";
    dot.setAttribute("aria-hidden", "true");

    const name = document.createElement("span");
    name.className = "engine-name";
    name.textContent = engine.name;

    option.append(dot, name);
    grid.append(option);
  }

  renderDefaultControl();
}

function selectEngine(engineId) {
  selectedEngine = engineId;
  localStorage.setItem("selectedEngine", selectedEngine);
  renderEngines();
  input.focus();
}

function search(openInNewTab = false) {
  const rawQuery = input.value.trim();
  const engine = getSelectedEngine();

  if (!rawQuery) {
    input.focus();
    return;
  }

  const url = new URL(engine.url(encodeURIComponent(rawQuery)));

  if (engine.autoSubmit && localStorage.getItem("autoSubmitAi") !== "false") {
    url.searchParams.set("aisearch_submit", "1");
  }

  if (openInNewTab) {
    window.open(url.toString(), "_blank", "noopener");
    return;
  }

  window.location.href = url.toString();
}

function updateTime() {
  const now = new Date();
  dateLabel.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(now);
  clockLabel.textContent = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(now);
}

grid.addEventListener("click", (event) => {
  const option = event.target.closest(".engine-option");
  if (!option) return;
  selectEngine(option.dataset.engineId);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  search(event.shiftKey);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    search(event.shiftKey);
  }
});

themeToggle.addEventListener("click", () => {
  applyTheme(root.dataset.theme === "light" ? "dark" : "light");
});

defaultEngineButton.addEventListener("click", () => {
  defaultEngineId = selectedEngine;
  localStorage.setItem("defaultEngine", defaultEngineId);
  renderDefaultControl();
});

applyTheme(savedTheme);
renderEngines();
updateTime();
setInterval(updateTime, 30_000);
