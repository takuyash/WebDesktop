/* =========================
   全角/半角変換ロジック
========================= */

/* ウィンドウの中身（外枠・タイトルバーは initWindows() が生成） */
const ZENKAKU_WINDOW_CONTENT = `
  <div class="zenkaku-body">

    <div class="zenkaku-options" id="zenkakuOptions">
      <label class="zenkaku-option-label">
        <input type="checkbox" id="zenkakuOptAlnum" checked>
        <span data-i18n="zenkakuOptAlnum"></span>
      </label>
      <label class="zenkaku-option-label">
        <input type="checkbox" id="zenkakuOptKana" checked>
        <span data-i18n="zenkakuOptKana"></span>
      </label>
      <label class="zenkaku-option-label">
        <input type="checkbox" id="zenkakuOptSpace">
        <span data-i18n="zenkakuOptSpace"></span>
      </label>
    </div>

    <div class="zenkaku-columns">
      <div class="zenkaku-column">
        <p class="zenkaku-col-label" data-i18n="zenkakuInputLabel"></p>
        <textarea
          id="zenkakuInput"
          class="zenkaku-textarea"
          data-i18n-placeholder="zenkakuInputPlaceholder"
          spellcheck="false"
        ></textarea>
      </div>

      <div class="zenkaku-buttons">
        <button type="button" class="zenkaku-conv-btn" id="zenkakuToFull" data-i18n="zenkakuToFullBtn"></button>
        <button type="button" class="zenkaku-conv-btn" id="zenkakuToHalf" data-i18n="zenkakuToHalfBtn"></button>
        <button type="button" class="zenkaku-swap-btn" id="zenkakuSwap" data-i18n-title="zenkakuSwapTitle">⇄</button>
      </div>

      <div class="zenkaku-column">
        <p class="zenkaku-col-label" data-i18n="zenkakuOutputLabel"></p>
        <textarea
          id="zenkakuOutput"
          class="zenkaku-textarea"
          readonly
          spellcheck="false"
        ></textarea>
      </div>
    </div>

    <div class="zenkaku-actions">
      <button type="button" class="zenkaku-copy-btn" id="zenkakuCopyBtn" data-i18n="zenkakuCopyBtn"></button>
      <button type="button" class="zenkaku-clear-btn" id="zenkakuClearBtn" data-i18n="clear"></button>
      <span class="zenkaku-status" id="zenkakuStatus"></span>
    </div>

  </div>
`;

function openZenkaku() {
  registerWindowOpen("zenkakuWindow");
  document.getElementById("zenkakuInput")?.focus();
}

// 半角カタカナ -> 全角カタカナ 変換テーブル
const ZENKAKU_KANA_MAP = {
  "ｱ": "ア", "ｲ": "イ", "ｳ": "ウ", "ｴ": "エ", "ｵ": "オ",
  "ｶ": "カ", "ｷ": "キ", "ｸ": "ク", "ｹ": "ケ", "ｺ": "コ",
  "ｻ": "サ", "ｼ": "シ", "ｽ": "ス", "ｾ": "セ", "ｿ": "ソ",
  "ﾀ": "タ", "ﾁ": "チ", "ﾂ": "ツ", "ﾃ": "テ", "ﾄ": "ト",
  "ﾅ": "ナ", "ﾆ": "ニ", "ﾇ": "ヌ", "ﾈ": "ネ", "ﾉ": "ノ",
  "ﾊ": "ハ", "ﾋ": "ヒ", "ﾌ": "フ", "ﾍ": "ヘ", "ﾎ": "ホ",
  "ﾏ": "マ", "ﾐ": "ミ", "ﾑ": "ム", "ﾒ": "メ", "ﾓ": "モ",
  "ﾔ": "ヤ", "ﾕ": "ユ", "ﾖ": "ヨ",
  "ﾗ": "ラ", "ﾘ": "リ", "ﾙ": "ル", "ﾚ": "レ", "ﾛ": "ロ",
  "ﾜ": "ワ", "ｦ": "ヲ", "ﾝ": "ン",
  "ｧ": "ァ", "ｨ": "ィ", "ｩ": "ゥ", "ｪ": "ェ", "ｫ": "ォ",
  "ｬ": "ャ", "ｭ": "ュ", "ｮ": "ョ", "ｯ": "ッ",
  "ｰ": "ー", "ﾞ": "゛", "ﾟ": "゜", "｡": "。", "｢": "「",
  "｣": "」", "､": "、", "･": "・"
};

// 濁点・半濁点付きの半角カタカナ -> 全角カタカナ
const ZENKAKU_KANA_DAKUTEN_MAP = {
  "ｶﾞ": "ガ", "ｷﾞ": "ギ", "ｸﾞ": "グ", "ｹﾞ": "ゲ", "ｺﾞ": "ゴ",
  "ｻﾞ": "ザ", "ｼﾞ": "ジ", "ｽﾞ": "ズ", "ｾﾞ": "ゼ", "ｿﾞ": "ゾ",
  "ﾀﾞ": "ダ", "ﾁﾞ": "ヂ", "ﾂﾞ": "ヅ", "ﾃﾞ": "デ", "ﾄﾞ": "ド",
  "ﾊﾞ": "バ", "ﾋﾞ": "ビ", "ﾌﾞ": "ブ", "ﾍﾞ": "ベ", "ﾎﾞ": "ボ",
  "ﾊﾟ": "パ", "ﾋﾟ": "ピ", "ﾌﾟ": "プ", "ﾍﾟ": "ペ", "ﾎﾟ": "ポ",
  "ｳﾞ": "ヴ"
};

// 全角カタカナ -> 半角カタカナ（濁点付きを含む）逆引きテーブル
const HANKAKU_KANA_MAP = (() => {
  const map = {};
  Object.entries(ZENKAKU_KANA_DAKUTEN_MAP).forEach(([half, full]) => {
    map[full] = half;
  });
  Object.entries(ZENKAKU_KANA_MAP).forEach(([half, full]) => {
    if (!map[full]) map[full] = half;
  });
  return map;
})();

function toFullWidth(text, opts) {
  let result = text;

  if (opts.alnum) {
    result = result.replace(/[A-Za-z0-9!-/:-@[-`{-~]/g, ch => {
      const code = ch.charCodeAt(0);
      return String.fromCharCode(code + 0xFEE0);
    });
  }

  if (opts.space) {
    result = result.replace(/ /g, "\u3000");
  }

  if (opts.kana) {
    // 濁点・半濁点付きを先に処理
    Object.entries(ZENKAKU_KANA_DAKUTEN_MAP).forEach(([half, full]) => {
      result = result.split(half).join(full);
    });
    Object.entries(ZENKAKU_KANA_MAP).forEach(([half, full]) => {
      result = result.split(half).join(full);
    });
  }

  return result;
}

function toHalfWidth(text, opts) {
  let result = text;

  if (opts.kana) {
    Object.entries(HANKAKU_KANA_MAP).forEach(([full, half]) => {
      result = result.split(full).join(half);
    });
  }

  if (opts.alnum) {
    result = result.replace(/[！-～]/g, ch => {
      const code = ch.charCodeAt(0);
      return String.fromCharCode(code - 0xFEE0);
    });
  }

  if (opts.space) {
    result = result.replace(/\u3000/g, " ");
  }

  return result;
}

function getZenkakuOptions() {
  return {
    alnum: !!document.getElementById("zenkakuOptAlnum")?.checked,
    kana: !!document.getElementById("zenkakuOptKana")?.checked,
    space: !!document.getElementById("zenkakuOptSpace")?.checked
  };
}

function setZenkakuStatus(msg) {
  const el = document.getElementById("zenkakuStatus");
  if (el) el.textContent = msg || "";
}

function runZenkakuConvert(direction) {
  const input = document.getElementById("zenkakuInput");
  const output = document.getElementById("zenkakuOutput");
  if (!input || !output) return;

  const opts = getZenkakuOptions();
  output.value =
    direction === "full"
      ? toFullWidth(input.value, opts)
      : toHalfWidth(input.value, opts);

  setZenkakuStatus("");
}

function clearZenkakuText() {
  const input = document.getElementById("zenkakuInput");
  const output = document.getElementById("zenkakuOutput");
  if (input) input.value = "";
  if (output) output.value = "";
  setZenkakuStatus("");
}

async function copyZenkakuOutput() {
  const output = document.getElementById("zenkakuOutput");
  if (!output || !output.value) return;

  try {
    await navigator.clipboard.writeText(output.value);
    setZenkakuStatus(data[lang].zenkakuCopied);
  } catch (err) {
    output.select();
    document.execCommand("copy");
    setZenkakuStatus(data[lang].zenkakuCopied);
  }
}

function swapZenkakuText() {
  const input = document.getElementById("zenkakuInput");
  const output = document.getElementById("zenkakuOutput");
  if (!input || !output) return;

  const tmp = input.value;
  input.value = output.value;
  output.value = tmp;
  setZenkakuStatus("");
}

function initZenkakuApp() {
  const input = document.getElementById("zenkakuInput");
  if (!input) return;

  document.getElementById("zenkakuToFull")?.addEventListener("click", () => runZenkakuConvert("full"));
  document.getElementById("zenkakuToHalf")?.addEventListener("click", () => runZenkakuConvert("half"));
  document.getElementById("zenkakuSwap")?.addEventListener("click", swapZenkakuText);
  document.getElementById("zenkakuCopyBtn")?.addEventListener("click", copyZenkakuOutput);
  document.getElementById("zenkakuClearBtn")?.addEventListener("click", clearZenkakuText);
}
