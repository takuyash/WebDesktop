/* =========================
   ウィンドウ管理
   ※ WINDOW_CONFIG / windowState は js/windows.js で定義
========================= */
const TASKBAR_HEIGHT = 42;
let windowZIndex = 10;

function getWindowEl(id) {
  return document.getElementById(id);
}

function isWindowOpen(id) {
  return windowState[id]?.status !== "closed";
}

function saveWindowBounds(id) {
  const win = getWindowEl(id);
  if (!win) return;

  windowState[id].bounds = {
    top: win.offsetTop,
    left: win.offsetLeft,
    width: win.offsetWidth,
    height: win.offsetHeight
  };
}

function bringWindowToFront(id) {
  const win = getWindowEl(id);
  if (!win) return;

  windowZIndex += 1;
  win.style.zIndex = windowZIndex;
}

function applyMaximize(id) {
  const win = getWindowEl(id);
  const state = windowState[id];
  if (!win || !state) return;

  if (state.status !== "maximized" && !state.bounds) {
    saveWindowBounds(id);
  }

  win.style.display = "block";
  win.style.top = "0px";
  win.style.left = "0px";
  win.style.width = "100%";
  win.style.height = `calc(100vh - ${TASKBAR_HEIGHT}px)`;
  win.classList.add("window-maximized");
  state.status = "maximized";
  bringWindowToFront(id);
  updateMaximizeButton(id);
}

function restoreWindow(id) {
  const win = getWindowEl(id);
  const state = windowState[id];
  if (!win || !state) return;

  const bounds = state.bounds;
  if (bounds) {
    win.style.top = `${bounds.top}px`;
    win.style.left = `${bounds.left}px`;
    win.style.width = `${bounds.width}px`;
    win.style.height = `${bounds.height}px`;
  }

  win.classList.remove("window-maximized");
  state.bounds = null;
  state.status = "normal";
  updateMaximizeButton(id);
}

function toggleMaximize(id) {
  const state = windowState[id];
  if (!state || state.status === "closed" || state.status === "minimized") return;

  if (state.status === "maximized") {
    restoreWindow(id);
  } else {
    applyMaximize(id);
  }

  updateTaskbar();
}

function minimizeWindow(id) {
  const win = getWindowEl(id);
  const state = windowState[id];
  if (!win || !state || state.status === "closed") return;

  state.beforeMinimize =
    state.status === "maximized" ? "maximized" : "normal";
  win.style.display = "none";
  state.status = "minimized";
  updateTaskbar();
}

function focusWindow(id) {
  const win = getWindowEl(id);
  const state = windowState[id];
  if (!win || !state || state.status === "closed") return;

  win.style.display = "block";

  if (state.status === "minimized") {
    if (state.beforeMinimize === "maximized") {
      applyMaximize(id);
    } else {
      state.status = "normal";
      updateMaximizeButton(id);
    }
  }

  bringWindowToFront(id);
  updateTaskbar();

  if (id === "notepadWindow") {
    document.getElementById("notepadText")?.focus();
  }

  if (id === "terminalWindow") {
    document.getElementById("terminalInput")?.focus();
  }
}

/* アプリ起動時の共通処理（スタートメニューを閉じてウィンドウを表示） */
function registerWindowOpen(id) {
  closeStartMenu();

  const state = windowState[id];
  if (!state) return;

  if (state.status === "minimized") {
    focusWindow(id);
    return;
  }

  const win = getWindowEl(id);
  if (!win) return;

  win.style.display = "block";

  if (state.status === "closed") {
    state.status = "normal";
    state.bounds = null;
    win.classList.remove("window-maximized");
    updateMaximizeButton(id);
  }

  bringWindowToFront(id);
  updateTaskbar();
}

function closeManagedWindow(id) {
  const win = getWindowEl(id);
  const state = windowState[id];
  if (!win || !state) return;

  win.style.display = "none";
  win.classList.remove("window-maximized");
  state.status = "closed";
  state.bounds = null;
  state.beforeMinimize = "normal";
  updateMaximizeButton(id);
  updateTaskbar();
}

function updateMaximizeButton(id) {
  const win = getWindowEl(id);
  if (!win) return;

  const btn = win.querySelector(".win-maximize");
  if (!btn) return;

  const maximized = windowState[id]?.status === "maximized";
  btn.textContent = maximized ? "❐" : "□";
  btn.title = data[lang][maximized ? "winRestore" : "winMaximize"];
}

function updateWindowControlLabels() {
  document.querySelectorAll(".win-minimize").forEach(btn => {
    btn.title = data[lang].winMinimize;
  });

  document.querySelectorAll(".win-close").forEach(btn => {
    btn.title = data[lang].winClose;
  });

  WINDOW_CONFIG.forEach(({ id }) => {
    updateMaximizeButton(id);
  });
}

function updateTaskbar() {
  const container = document.getElementById("taskApps");
  if (!container) return;

  container.innerHTML = "";

  WINDOW_CONFIG.forEach(({ id, titleKey, icon }) => {
    const state = windowState[id];
    if (!state || state.status === "closed") return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "task-app-btn";
    btn.innerHTML = `<span class="task-app-icon">${icon}</span>`;
    btn.title = data[lang][titleKey];

    if (state.status === "minimized") {
      btn.classList.add("minimized");
    } else {
      btn.classList.add("active");
    }

    btn.onclick = () => {
      if (state.status === "minimized") {
        focusWindow(id);
      } else {
        bringWindowToFront(id);
        updateTaskbar();
      }
    };

    container.appendChild(btn);
  });
}

/* タイトルバー右端の 最小化 / 最大化 / 閉じる ボタンを生成する */
function createWindowControls(id) {
  const controls = document.createElement("div");
  controls.className = "controls";

  [
    { className: "win-minimize", label: "─", action: minimizeWindow },
    { className: "win-maximize", label: "□", action: toggleMaximize },
    { className: "win-close", label: "×", action: closeManagedWindow }
  ].forEach(({ className, label, action }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `win-btn ${className}`;
    btn.textContent = label;
    btn.addEventListener("click", e => {
      e.stopPropagation();
      action(id);
    });
    controls.appendChild(btn);
  });

  return controls;
}

/* ウィンドウの外枠（タイトルバー＋操作ボタン）を作り、各アプリの中身を流し込む */
function createWindowEl({ id, titleKey, className, content }) {
  const win = document.createElement("div");
  win.id = id;
  win.className = `window window-resizable ${className}`;
  win.style.display = "none";

  const bar = document.createElement("div");
  bar.className = "titlebar";

  const title = document.createElement("span");
  title.dataset.i18n = titleKey;

  bar.appendChild(title);
  bar.appendChild(createWindowControls(id));

  win.appendChild(bar);
  win.insertAdjacentHTML("beforeend", content);

  return win;
}

/* WINDOW_CONFIG の全ウィンドウを生成し、ドラッグ・リサイズを設定する
   ※ 各アプリの init*App() はウィンドウ内の要素を参照するので、これより後に呼ぶ */
function initWindows() {
  const desktop = document.querySelector(".desktop");
  if (!desktop) return;

  WINDOW_CONFIG.forEach(config => {
    const win = createWindowEl(config);
    desktop.appendChild(win);

    makeDraggable(win, win.querySelector(".titlebar"));
    makeResizable(win, { minWidth: config.minWidth, minHeight: config.minHeight });
  });
}

/* =========================
   ドラッグ処理
========================= */
function makeDraggable(win, bar) {
  if (!win || !bar) return;

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  bar.addEventListener("mousedown", e => {
    if (e.target.closest("button")) return;
    if (win.classList.contains("window-maximized")) return;

    isDragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
  });

  document.addEventListener("mousemove", e => {
    if (!isDragging) return;

    const newLeft = e.clientX - offsetX;
    const newTop = e.clientY - offsetY;

    // 画面上端より上には移動させない
    const maxTop = window.innerHeight - TASKBAR_HEIGHT - win.offsetHeight;

    win.style.left = Math.max(0, newLeft) + "px";
    win.style.top = Math.max(0, Math.min(newTop, maxTop)) + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

function makeResizable(win, options = {}) {
  if (!win) return;

  const minWidth = options.minWidth ?? 480;
  const minHeight = options.minHeight ?? 280;
  const directions = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

  directions.forEach(dir => {
    const handle = document.createElement("div");
    handle.className = `resize-handle resize-${dir}`;
    handle.dataset.dir = dir;
    win.appendChild(handle);
  });

  let resizing = false;
  let direction = "";
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;
  let startLeft = 0;
  let startTop = 0;

  win.addEventListener("mousedown", e => {
    const handle = e.target.closest(".resize-handle");
    if (!handle || !win.contains(handle)) return;
    if (win.classList.contains("window-maximized")) return;

    e.preventDefault();
    e.stopPropagation();

    resizing = true;
    direction = handle.dataset.dir;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = win.offsetWidth;
    startHeight = win.offsetHeight;
    startLeft = win.offsetLeft;
    startTop = win.offsetTop;

    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", e => {
    if (!resizing) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newLeft = startLeft;
    let newTop = startTop;

    if (direction.includes("e")) {
      newWidth = Math.max(minWidth, startWidth + dx);
    }

    if (direction.includes("w")) {
      newWidth = Math.max(minWidth, startWidth - dx);
      newLeft = startLeft + startWidth - newWidth;
    }

    if (direction.includes("s")) {
      newHeight = Math.max(minHeight, startHeight + dy);
    }

    if (direction.includes("n")) {
      newHeight = Math.max(minHeight, startHeight - dy);
      newTop = startTop + startHeight - newHeight;
    }

    win.style.width = `${newWidth}px`;
    win.style.height = `${newHeight}px`;
    win.style.left = `${newLeft}px`;
    win.style.top = `${newTop}px`;
  });

  document.addEventListener("mouseup", () => {
    if (!resizing) return;

    resizing = false;
    document.body.style.userSelect = "";
  });
}
