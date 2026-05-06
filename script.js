const API_KEY = "6pXJciAjlVYn3qySffIwgvllfIkLVtVIzJbWDKlX";
const BASE_URL = "https://api.nasa.gov/planetary/apod";

const container = document.getElementById("current-image-container");
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const historyList = document.getElementById("search-history");
const historyEmpty = document.getElementById("history-empty");

/* ─── RENDER HELPERS ──────────────────────────────── */
function showLoader() {
  container.innerHTML = `
    <div class="loader">
      <div class="orbit"><div class="planet"></div></div>
      <p>Contacting Deep Space…</p>
    </div>`;
}

function renderAPOD(data) {
  const media =
    data.media_type === "video"
      ? `<iframe class="apod-media-iframe" src="${data.url}" frameborder="0" allowfullscreen title="${data.title}"></iframe>`
      : `<img class="apod-media" src="${data.hdurl || data.url}" alt="${data.title}" loading="lazy" />`;

  const copyright = data.copyright
    ? `<p class="apod-copyright">© ${data.copyright.trim()}</p>`
    : "";

  container.innerHTML = `
    <span class="apod-date-badge">${data.date}</span>
    <h2 class="apod-title">${data.title}</h2>
    ${media}
    ${copyright}
    <p class="apod-explanation">${data.explanation}</p>
  `;
}

function showError(msg) {
  container.innerHTML = `<div class="error-box">⚠ ${msg}</div>`;
}

/* ─── FETCH ───────────────────────────────────────── */
async function fetchAPOD(date) {
  const url = `${BASE_URL}?api_key=${API_KEY}&date=${date}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.msg || `HTTP ${res.status}`);
  }
  return res.json();
}

/* ─── CURRENT IMAGE OF THE DAY ────────────────────── */
async function getCurrentImageOfTheDay() {
  const currentDate = new Date().toISOString().split("T")[0];
  showLoader();
  try {
    const data = await fetchAPOD(currentDate);
    renderAPOD(data);
  } catch (err) {
    showError(`Failed to load today's picture: ${err.message}`);
  }
}

/* ─── GET IMAGE FOR SELECTED DATE ─────────────────── */
async function getImageOfTheDay(date) {
  showLoader();
  try {
    const data = await fetchAPOD(date);
    renderAPOD(data);
    saveSearch(date);
    addSearchToHistory();
  } catch (err) {
    showError(`Could not retrieve picture for ${date}: ${err.message}`);
  }
}

/* ─── SAVE SEARCH TO LOCAL STORAGE ───────────────── */
function saveSearch(date) {
  let searches = JSON.parse(localStorage.getItem("nasaSearches") || "[]");
  // Avoid duplicates; move to top if already exists
  searches = searches.filter((d) => d !== date);
  searches.unshift(date);
  localStorage.setItem("nasaSearches", JSON.stringify(searches));
}

/* ─── POPULATE HISTORY LIST ───────────────────────── */
function addSearchToHistory() {
  const searches = JSON.parse(localStorage.getItem("nasaSearches") || "[]");
  historyList.innerHTML = "";

  if (searches.length === 0) {
    historyEmpty.style.display = "block";
    return;
  }
  historyEmpty.style.display = "none";

  searches.forEach((date) => {
    const li = document.createElement("li");
    li.textContent = date;
    li.setAttribute("title", `View APOD for ${date}`);
    li.addEventListener("click", () => getImageOfTheDay(date));
    historyList.appendChild(li);
  });
}

/* ─── FORM SUBMIT ─────────────────────────────────── */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const date = input.value;
  if (!date) return;
  getImageOfTheDay(date);
});

/* ─── INIT ────────────────────────────────────────── */
getCurrentImageOfTheDay();
addSearchToHistory();
