/* =========================
   設定アプリ
========================= */

/* ウィンドウの中身（外枠・タイトルバーは initWindows() が生成） */
const SETTINGS_WINDOW_CONTENT = `
  <div class="settings-body">

    <div class="settings-section">
      <h3 data-i18n="settingsBgTitle"></h3>
      <p class="settings-desc" data-i18n="settingsBgDesc"></p>
      <div class="settings-bg-grid" id="settingsBgGrid"></div>
    </div>

    <div class="settings-section">
      <h3 data-i18n="settingsLangTitle"></h3>
      <div class="settings-lang-buttons">
        <button type="button" class="settings-lang-btn" id="settingsLangJa" onclick="setLang('ja')">日本語</button>
        <button type="button" class="settings-lang-btn" id="settingsLangEn" onclick="setLang('en')">English</button>
      </div>
    </div>

    <div class="settings-section">
      <h3 data-i18n="settingsDataTitle"></h3>
      <p class="settings-desc" data-i18n="settingsDataDesc"></p>
      <button type="button" class="settings-danger-btn" id="settingsClearDataBtn" data-i18n="settingsClearDataBtn"></button>
      <span class="settings-status" id="settingsStatus"></span>
    </div>

  </div>
`;

const BG_STORAGE_KEY = "desktop-bg";
const DEFAULT_BG = "assets/bg.png";
let settingsBooted = false;

function applyBackground(file) {
  document.body.style.backgroundImage = `url("${file}")`;
}

function initBackground() {
  const saved = localStorage.getItem(BG_STORAGE_KEY);
  if (saved) {
    applyBackground(saved);
  }
}

function selectBackground(file) {
  applyBackground(file);
  localStorage.setItem(BG_STORAGE_KEY, file);
  renderSettingsBgGrid();
}

function renderSettingsBgGrid() {
  const grid = document.getElementById("settingsBgGrid");
  if (!grid) return;

  const current = localStorage.getItem(BG_STORAGE_KEY) || DEFAULT_BG;

  grid.innerHTML = photoFiles
    .map(p => `
      <button
        type="button"
        class="settings-bg-thumb${p.file === current ? " active" : ""}"
        onclick="selectBackground('${p.file}')"
        title="${p.caption}"
      >
        <img src="${p.file}" alt="${p.caption}">
      </button>
    `)
    .join("");
}

function updateSettingsLangButtons() {
  const jaBtn = document.getElementById("settingsLangJa");
  const enBtn = document.getElementById("settingsLangEn");
  if (!jaBtn || !enBtn) return;

  jaBtn.classList.toggle("active", lang === "ja");
  enBtn.classList.toggle("active", lang === "en");
}

function clearAllSavedData() {
  localStorage.removeItem(NOTEPAD_STORAGE_KEY);
  localStorage.removeItem(PAINT_STORAGE_KEY);
  localStorage.removeItem(BG_STORAGE_KEY);

  const notepadText = document.getElementById("notepadText");
  if (notepadText) {
    notepadText.value = "";
  }

  clearPaintCanvas();

  document.body.style.backgroundImage = "";
  renderSettingsBgGrid();

  const status = document.getElementById("settingsStatus");
  if (status) {
    status.textContent = data[lang].settingsDataCleared;
    setTimeout(() => {
      status.textContent = "";
    }, 2500);
  }
}

function openSettings() {
  registerWindowOpen("settingsWindow");

  if (!settingsBooted) {
    settingsBooted = true;
    renderSettingsBgGrid();
    updateSettingsLangButtons();
  }
}

function initSettingsApp() {
  document.getElementById("settingsClearDataBtn")?.addEventListener("click", () => {
    if (confirm(data[lang].settingsClearConfirm)) {
      clearAllSavedData();
    }
  });
}
