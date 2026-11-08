/* =========================
   メモ帳
========================= */

/* ウィンドウの中身（外枠・タイトルバーは initWindows() が生成） */
const NOTEPAD_WINDOW_CONTENT = `
  <div class="notepad-body">
    <textarea
      id="notepadText"
      data-i18n-placeholder="notepadPlaceholder"
      class="notepad-textarea"
      spellcheck="false"
    ></textarea>
  </div>
`;

const NOTEPAD_STORAGE_KEY = "notepad-content";

function openNotepad() {
  registerWindowOpen("notepadWindow");
  document.getElementById("notepadText")?.focus();
}

function initNotepadApp() {
  const notepadText = document.getElementById("notepadText");
  if (!notepadText) return;

  notepadText.value = localStorage.getItem(NOTEPAD_STORAGE_KEY) || "";
  notepadText.addEventListener("input", () => {
    localStorage.setItem(NOTEPAD_STORAGE_KEY, notepadText.value);
  });
}
