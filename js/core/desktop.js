/* =========================
   デスクトップアイコン生成
   （WINDOW_CONFIG の並び順・desktopフラグを見て
     必要なDIVだけをJSで生成する）
========================= */
const DESKTOP_ICON_SLOT = 100; // 1アイコンあたりの高さ（アイコン88px + 隙間12px）
const DESKTOP_ICON_TOP_OFFSET = 40; // 上下の余白合計（top:20pxぶん×2）

function updateDesktopIconRows() {
  const container = document.getElementById("desktopIcons");
  if (!container) return;

  const availableHeight = window.innerHeight - TASKBAR_HEIGHT - DESKTOP_ICON_TOP_OFFSET;
  const rows = Math.max(1, Math.floor(availableHeight / DESKTOP_ICON_SLOT));

  container.style.setProperty("--icon-rows", rows);
}

function renderDesktopIcons() {
  const container = document.getElementById("desktopIcons");
  if (!container) return;

  container.innerHTML = "";

  WINDOW_CONFIG.forEach(({ id, titleKey, icon, onOpen, desktop }) => {
    if (!desktop) return;

    const iconEl = document.createElement("div");
    iconEl.className = "icon";
    iconEl.dataset.windowId = id;
    iconEl.onclick = onOpen;

    const image = document.createElement("span");
    image.className = "icon-image";
    image.textContent = icon;

    const label = document.createElement("div");
    label.className = "icon-label";
    label.dataset.i18n = titleKey;
    label.textContent = data[lang][titleKey] || "";

    iconEl.appendChild(image);
    iconEl.appendChild(label);
    container.appendChild(iconEl);
  });

  updateDesktopIconRows();
}

/* =========================
   スタートメニュー生成
   （同じく WINDOW_CONFIG から生成。表示順や表示/非表示の
     切り替えは WINDOW_CONFIG を編集するだけでよい）
========================= */
function renderStartMenu() {
  const menu = document.getElementById("startMenu");
  if (!menu) return;

  menu.innerHTML = "";

  WINDOW_CONFIG.forEach(({ titleKey, onOpen, startMenu }) => {
    if (!startMenu) return;

    const item = document.createElement("div");
    item.dataset.i18n = titleKey;
    item.textContent = data[lang][titleKey] || "";
    item.onclick = onOpen;

    menu.appendChild(item);
  });
}

/* =========================
   スタートメニュー
========================= */
function toggleStart() {
  const menu = document.getElementById("startMenu");
  if (!menu) return;

  menu.style.display =
    menu.style.display === "block"
      ? "none"
      : "block";
}

function closeStartMenu() {
  const menu = document.getElementById("startMenu");
  if (menu) {
    menu.style.display = "none";
  }
}

/* スタートメニュー外をクリックしたら閉じる */
document.addEventListener("click", e => {
  const menu = document.getElementById("startMenu");
  const startButton = document.querySelector(".start");

  if (!menu) return;

  // メニュー内、またはスタートボタンをクリックした場合は何もしない
  if (
    menu.contains(e.target) ||
    startButton?.contains(e.target)
  ) {
    return;
  }

  closeStartMenu();
});
