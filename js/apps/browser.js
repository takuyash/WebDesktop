/* =========================
   ブラウザ
========================= */

/* ウィンドウの中身（外枠・タイトルバーは initWindows() が生成） */
const BROWSER_WINDOW_CONTENT = `
  <div class="browser-body">
    <div class="browser-toolbar">
      <button type="button" class="browser-nav-btn" onclick="browserGoBack()">◀</button>
      <button type="button" class="browser-nav-btn" onclick="browserGoForward()">▶</button>
      <button type="button" class="browser-nav-btn" onclick="browserRefresh()">⟳</button>
      <input type="text" id="browserAddress" class="browser-address" data-i18n-placeholder="browserAddressPlaceholder" spellcheck="false">
      <button type="button" class="browser-go-btn" onclick="browserNavigateFromInput()" data-i18n="browserGo"></button>
    </div>
    <div class="browser-favorites" id="browserFavorites"></div>
    <div class="browser-frame-wrap">
      <iframe id="browserFrame" class="browser-frame" src="about:blank"></iframe>
    </div>
  </div>
`;

const browserFavorites = [
  {
    label: {
      ja: "wikipedia",
      en: "wikipedia"
    },
    url: {
      ja: "https://ja.wikipedia.org",
      en: "https://en.wikipedia.org"
    }
  }
];

let browserBooted = false;
const browserHistory = [];
let browserHistoryIndex = -1;

function openBrowser() {
  registerWindowOpen("browserWindow");

  if (!browserBooted) {
    browserBooted = true;
    browserNavigate(data[lang].browserHome);
  }

  document.getElementById("browserAddress")?.focus();
}

function normalizeBrowserUrl(input) {
  const trimmed = (input || "").trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // 「example.com」のようなドメイン形式ならhttps://を付与
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(trimmed) && !trimmed.includes(" ")) {
    return `https://${trimmed}`;
  }

  // それ以外は検索語として扱う
  return `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}`;
}

function browserNavigate(input, fromHistory = false) {
  const frame = document.getElementById("browserFrame");
  const addressInput = document.getElementById("browserAddress");
  if (!frame) return;

  const url = normalizeBrowserUrl(input);
  if (!url) return;

  frame.src = url;

  if (addressInput) {
    addressInput.value = url;
  }

  if (!fromHistory) {
    browserHistory.splice(browserHistoryIndex + 1);
    browserHistory.push(url);
    browserHistoryIndex = browserHistory.length - 1;
  }
}

function browserNavigateFromInput() {
  const addressInput = document.getElementById("browserAddress");
  if (!addressInput) return;
  browserNavigate(addressInput.value);
}

function browserGoBack() {
  if (browserHistoryIndex <= 0) return;
  browserHistoryIndex -= 1;
  browserNavigate(browserHistory[browserHistoryIndex], true);
}

function browserGoForward() {
  if (browserHistoryIndex >= browserHistory.length - 1) return;
  browserHistoryIndex += 1;
  browserNavigate(browserHistory[browserHistoryIndex], true);
}

function browserRefresh() {
  const frame = document.getElementById("browserFrame");
  if (!frame) return;
  frame.src = frame.src;
}

function initBrowserApp() {
  const addressInput = document.getElementById("browserAddress");
  if (!addressInput) return;

  addressInput.placeholder = data[lang].browserAddressPlaceholder;

  addressInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      browserNavigateFromInput();
    }
  });

  renderBrowserFavorites();
}

function renderBrowserFavorites() {
  const container = document.getElementById("browserFavorites");
  if (!container) return;

  container.innerHTML = browserFavorites
    .map(fav => `
      <button type="button" class="browser-fav-btn" data-url="${fav.url[lang] || fav.url.ja}">
        ${fav.label[lang] || fav.label.ja}
      </button>
    `)
    .join("");

  container.querySelectorAll(".browser-fav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      browserNavigate(btn.dataset.url);
    });
  });
}
