/* =========================
   ストップウォッチ
========================= */

/* ウィンドウの中身（外枠・タイトルバーは initWindows() が生成） */
const STOPWATCH_WINDOW_CONTENT = `
  <div class="stopwatch-body">

    <div class="stopwatch-display" id="stopwatchDisplay">00:00:00.00</div>

    <div class="stopwatch-controls">
      <button type="button" class="stopwatch-btn stopwatch-btn-lap" id="stopwatchLapBtn" disabled data-i18n="stopwatchLap"></button>
      <button type="button" class="stopwatch-btn stopwatch-btn-start" id="stopwatchStartBtn"></button>
      <button type="button" class="stopwatch-btn stopwatch-btn-reset" id="stopwatchResetBtn" disabled data-i18n="stopwatchReset"></button>
    </div>

    <div class="stopwatch-laps" id="stopwatchLaps">
      <div class="stopwatch-laps-empty" id="stopwatchLapsEmpty" data-i18n="stopwatchNoLaps"></div>
      <div class="stopwatch-laps-list" id="stopwatchLapsList"></div>
    </div>

  </div>
`;

let stopwatchRunning = false;
let stopwatchStartTimestamp = 0;
let stopwatchElapsedMs = 0;
let stopwatchTimerId = null;
let stopwatchLaps = [];

function formatStopwatchTime(ms) {
  const pad = (n, len = 2) => String(n).padStart(len, "0");

  const totalCentis = Math.floor(ms / 10);
  const centis = totalCentis % 100;
  const totalSeconds = Math.floor(totalCentis / 100);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centis)}`;
}

function getStopwatchElapsed() {
  if (!stopwatchRunning) return stopwatchElapsedMs;
  return stopwatchElapsedMs + (Date.now() - stopwatchStartTimestamp);
}

function updateStopwatchDisplay() {
  const display = document.getElementById("stopwatchDisplay");
  if (display) {
    display.textContent = formatStopwatchTime(getStopwatchElapsed());
  }
}

function updateStopwatchButtons() {
  const startBtn = document.getElementById("stopwatchStartBtn");
  const lapBtn = document.getElementById("stopwatchLapBtn");
  const resetBtn = document.getElementById("stopwatchResetBtn");
  if (!startBtn) return;

  const d = data[lang];

  startBtn.textContent = stopwatchRunning ? d.stopwatchStop : d.stopwatchStart;
  startBtn.classList.toggle("running", stopwatchRunning);

  if (lapBtn) lapBtn.disabled = !stopwatchRunning;
  if (resetBtn) resetBtn.disabled = stopwatchRunning || getStopwatchElapsed() === 0;
}

function renderStopwatchLaps() {
  const container = document.getElementById("stopwatchLaps");
  const list = document.getElementById("stopwatchLapsList");
  if (!container || !list) return;

  container.classList.toggle("has-laps", stopwatchLaps.length > 0);

  const label = data[lang].stopwatchLapLabel;

  list.innerHTML = stopwatchLaps
    .map((lap, i) => {
      const num = stopwatchLaps.length - i;
      return `<div class="stopwatch-lap-row">
        <span class="stopwatch-lap-number">${label} ${num}</span>
        <span class="stopwatch-lap-split">${formatStopwatchTime(lap.split)}</span>
        <span class="stopwatch-lap-total">${formatStopwatchTime(lap.total)}</span>
      </div>`;
    })
    .join("");
}

function toggleStopwatch() {
  if (stopwatchRunning) {
    stopwatchElapsedMs = getStopwatchElapsed();
    stopwatchRunning = false;
    clearInterval(stopwatchTimerId);
    stopwatchTimerId = null;
  } else {
    stopwatchRunning = true;
    stopwatchStartTimestamp = Date.now();
    stopwatchTimerId = setInterval(updateStopwatchDisplay, 10);
  }

  updateStopwatchDisplay();
  updateStopwatchButtons();
}

function lapStopwatch() {
  if (!stopwatchRunning) return;

  const total = getStopwatchElapsed();
  const prevTotal = stopwatchLaps.length ? stopwatchLaps[0].total : 0;
  const split = total - prevTotal;

  stopwatchLaps.unshift({ total, split });
  renderStopwatchLaps();
}

function resetStopwatch() {
  if (stopwatchRunning) return;

  stopwatchElapsedMs = 0;
  stopwatchLaps = [];
  updateStopwatchDisplay();
  updateStopwatchButtons();
  renderStopwatchLaps();
}

function openStopwatch() {
  registerWindowOpen("stopwatchWindow");
}

function initStopwatchApp() {
  const startBtn = document.getElementById("stopwatchStartBtn");
  if (!startBtn) return;

  startBtn.addEventListener("click", toggleStopwatch);
  document.getElementById("stopwatchLapBtn")?.addEventListener("click", lapStopwatch);
  document.getElementById("stopwatchResetBtn")?.addEventListener("click", resetStopwatch);

  updateStopwatchDisplay();
  updateStopwatchButtons();
  renderStopwatchLaps();
}
