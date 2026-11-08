/* =========================
   描画（言語切替時に画面全体のテキストを更新）
========================= */
function render() {
  const d = data[lang];

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;

    if (d[key] !== undefined) {
      el.textContent = d[key];
    }
  });

  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.dataset.i18nTitle;

    if (d[key] !== undefined) {
      el.title = d[key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;

    if (d[key] !== undefined) {
      el.placeholder = d[key];
    }
  });

  updateFullscreenBtn();
  updateBarcodeTypeUI();

  updateStopwatchButtons();
  renderStopwatchLaps();

  updateClock();

  const calendar = document.getElementById("calendar");
  if (calendar && calendar.style.display === "block") {
    renderCalendar();
  }

  renderBrowserFavorites();

  if (photoBooted) {
    renderPhotoThumbs();
  }

  if (settingsBooted) {
    renderSettingsBgGrid();
    updateSettingsLangButtons();
  }

  updateWindowControlLabels();
  updateTaskbar();

  syncTableDiffLanguage();
}

function setLang(newLang) {
  if (newLang !== "ja" && newLang !== "en") return;
  if (lang === newLang) return;

  lang = newLang;

  const langBtn = document.getElementById("langBtn");
  if (langBtn) {
    langBtn.innerText = lang === "ja" ? "EN" : "JA";
  }

  render();
}

/* =========================
   初期化
========================= */
document.addEventListener("DOMContentLoaded", () => {

  const langBtn = document.getElementById("langBtn");

  if (langBtn) {
    langBtn.onclick = () => {
      setLang(lang === "ja" ? "en" : "ja");
    };
  }

  initBackground();

  renderDesktopIcons();
  renderStartMenu();
  initWindows();

  render();

  updateTaskbar();
  initFullscreenToggle();
  initClock();
  initCalendar();

  window.addEventListener("resize", updateDesktopIconRows);

  initNotepadApp();
  initPaintApp();
  initTerminalApp();
  initBrowserApp();
  initCounterApp();
  initIcoConverterApp();
  initQrCodeApp();
  initZenkakuApp();
  initBarcodeApp();
  initStopwatchApp();
  initHepburnApp();
  initSettingsApp();
  initTableDiffApp();
});
