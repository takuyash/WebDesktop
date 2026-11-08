/* =========================
   文字数カウンターロジック
========================= */

/* ウィンドウの中身（外枠・タイトルバーは initWindows() が生成） */
const COUNTER_WINDOW_CONTENT = `
  <div class="counter-body">
    <textarea
      id="counterText"
      class="counter-textarea"
      data-i18n-placeholder="counterPlaceholder"
      spellcheck="false"
    ></textarea>

    <div class="counter-result">
      <div class="counter-card">
        <div data-i18n="countAllLabel">文字数（改行含む）</div>
        <div class="counter-value" id="countAll">0</div>
      </div>
      <div class="counter-card">
        <div data-i18n="countNoNewlineLabel">文字数（改行除く）</div>
        <div class="counter-value" id="countNoNewline">0</div>
      </div>
      <div class="counter-card">
        <div data-i18n="countNoSpaceLabel">文字数（空白除く）</div>
        <div class="counter-value" id="countNoSpace">0</div>
      </div>
      <div class="counter-card">
        <div data-i18n="lineCountLabel">行数</div>
        <div class="counter-value" id="lineCount">1</div>
      </div>
    </div>

    <button type="button" class="counter-clear-btn" onclick="clearCounterText()" data-i18n="clear">クリア</button>
  </div>
`;

function openCounter() {
  registerWindowOpen("counterWindow");
  document.getElementById("counterText")?.focus();
}

function updateCounter() {
  const textarea = document.getElementById("counterText");
  if (!textarea) return;

  const text = textarea.value;

  // 改行含む
  const countAll = text.length;
  // 改行除く
  const countNoNewline = text.replace(/\r?\n/g, "").length;
  // 空白・改行除く
  const countNoSpace = text.replace(/\s/g, "").length;
  // 行数
  const lineCount = text === "" ? 1 : text.split(/\r\n|\r|\n/).length;

  document.getElementById("countAll").textContent = countAll;
  document.getElementById("countNoNewline").textContent = countNoNewline;
  document.getElementById("countNoSpace").textContent = countNoSpace;
  document.getElementById("lineCount").textContent = lineCount;
}

function clearCounterText() {
  const textarea = document.getElementById("counterText");
  if (!textarea) return;

  textarea.value = "";
  updateCounter();
}

function initCounterApp() {
  const textarea = document.getElementById("counterText");
  if (!textarea) return;

  textarea.addEventListener("input", updateCounter);
  updateCounter();
}
