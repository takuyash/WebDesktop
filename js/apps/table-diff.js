/* =========================
   テーブル差分比較（table-diff.html を iframe で表示）
========================= */

/* ウィンドウの中身（外枠・タイトルバーは initWindows() が生成） */
const TABLE_DIFF_WINDOW_CONTENT = `
  <div class="table-diff-body">
    <iframe
      id="tableDiffFrame"
      class="table-diff-frame"
      src="table-diff.html"
      title="Table Diff"
    ></iframe>
  </div>
`;

/* iframe 側へ現在の言語を通知する */
function syncTableDiffLanguage() {
  const frame = document.getElementById("tableDiffFrame");
  frame?.contentWindow?.postMessage(
    { type: "app-language", lang },
    "*"
  );
}

function openTableDiff() {
  registerWindowOpen("tableDiffWindow");
  syncTableDiffLanguage();
}

function initTableDiffApp() {
  document.getElementById("tableDiffFrame")?.addEventListener("load", syncTableDiffLanguage);
}
