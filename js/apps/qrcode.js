/* =========================
   QRコードジェネレーター
========================= */

/* ウィンドウの中身（外枠・タイトルバーは initWindows() が生成） */
const QRCODE_WINDOW_CONTENT = `
  <div class="qr-body">

    <textarea
      id="qrText"
      class="qr-textarea"
      data-i18n-placeholder="qrTextPlaceholder"
      spellcheck="false"
    ></textarea>

    <div class="qr-options">
      <label class="qr-option-label">
        <span data-i18n="qrErrorLevelLabel"></span>
        <select id="qrErrorLevel">
          <option value="L">L (7%)</option>
          <option value="M" selected>M (15%)</option>
          <option value="Q">Q (25%)</option>
          <option value="H">H (30%)</option>
        </select>
      </label>
      <label class="qr-option-label">
        <span data-i18n="qrCellSizeLabel"></span>
        <input type="range" id="qrCellSize" min="3" max="12" value="6">
      </label>
    </div>

    <div class="qr-preview" id="qrPreview">
      <canvas id="qrCanvas"></canvas>
      <div class="qr-empty" id="qrEmpty" data-i18n="qrEmptyText"></div>
    </div>

    <div class="qr-actions">
      <button type="button" class="qr-download-btn" id="qrDownloadBtn" disabled data-i18n="qrDownloadBtn"></button>
      <button type="button" class="qr-clear-btn" onclick="clearQrCode()" data-i18n="clear"></button>
    </div>

    <div class="qr-status" id="qrStatus"></div>

  </div>
`;

function openQrCode() {
  registerWindowOpen("qrWindow");
  document.getElementById("qrText")?.focus();
}

function clearQrCode() {
  const textarea = document.getElementById("qrText");
  if (!textarea) return;

  textarea.value = "";
  generateQrCode();
  textarea.focus();
}

function setQrStatus(msg) {
  const statusEl = document.getElementById("qrStatus");
  if (statusEl) statusEl.textContent = msg || "";
}

function generateQrCode() {
  const textarea = document.getElementById("qrText");
  const canvas = document.getElementById("qrCanvas");
  const preview = document.getElementById("qrPreview");
  const downloadBtn = document.getElementById("qrDownloadBtn");
  const errorLevelSelect = document.getElementById("qrErrorLevel");
  const cellSizeInput = document.getElementById("qrCellSize");

  if (!textarea || !canvas || !preview) return;

  const text = textarea.value;

  if (!text) {
    preview.classList.remove("has-code");
    if (downloadBtn) downloadBtn.disabled = true;
    setQrStatus("");
    return;
  }

  const errorLevel = errorLevelSelect ? errorLevelSelect.value : "M";
  const cellSize = cellSizeInput ? parseInt(cellSizeInput.value, 10) || 6 : 6;
  const margin = cellSize * 2;

  try {
    // typeNumber 0 = 自動判定
    const qr = qrcode(0, errorLevel);
    qr.addData(text);
    qr.make();

    const moduleCount = qr.getModuleCount();
    const size = moduleCount * cellSize + margin * 2;

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#000000";

    for (let row = 0; row < moduleCount; row += 1) {
      for (let col = 0; col < moduleCount; col += 1) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(
            margin + col * cellSize,
            margin + row * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }

    preview.classList.add("has-code");
    if (downloadBtn) downloadBtn.disabled = false;
    setQrStatus("");
  } catch (err) {
    preview.classList.remove("has-code");
    if (downloadBtn) downloadBtn.disabled = true;
    setQrStatus(data[lang].qrErrorTooLong);
  }
}

function downloadQrCode() {
  const canvas = document.getElementById("qrCanvas");
  if (!canvas) return;

  downloadUrl(canvas.toDataURL("image/png"), "qrcode.png");
}

function initQrCodeApp() {
  const textarea = document.getElementById("qrText");
  const errorLevelSelect = document.getElementById("qrErrorLevel");
  const cellSizeInput = document.getElementById("qrCellSize");
  const downloadBtn = document.getElementById("qrDownloadBtn");

  if (!textarea) return;

  textarea.addEventListener("input", generateQrCode);
  errorLevelSelect?.addEventListener("change", generateQrCode);
  cellSizeInput?.addEventListener("input", generateQrCode);
  downloadBtn?.addEventListener("click", downloadQrCode);

  generateQrCode();
}
