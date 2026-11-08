/* =========================
   ヘボン式ローマ字変換ロジック
========================= */

/* ウィンドウの中身（外枠・タイトルバーは initWindows() が生成） */
const HEPBURN_WINDOW_CONTENT = `
  <div class="hepburn-body">

    <p class="hepburn-col-label" data-i18n="hepburnInputLabel"></p>
    <textarea
      id="hepburnInput"
      class="hepburn-textarea"
      data-i18n-placeholder="hepburnInputPlaceholder"
      spellcheck="false"
    ></textarea>

    <div class="hepburn-options">
      <label class="hepburn-option-label">
        <input type="checkbox" id="hepburnMacron" checked>
        <span data-i18n="hepburnMacronLabel"></span>
      </label>
      <label class="hepburn-option-label">
        <input type="checkbox" id="hepburnUppercase">
        <span data-i18n="hepburnUppercaseLabel"></span>
      </label>
    </div>

    <div class="hepburn-actions">
      <button type="button" class="hepburn-convert-btn" id="hepburnConvertBtn" data-i18n="hepburnConvertBtn"></button>
      <button type="button" class="hepburn-copy-btn" id="hepburnCopyBtn" data-i18n="hepburnCopyBtn"></button>
      <button type="button" class="hepburn-clear-btn" id="hepburnClearBtn" data-i18n="clear"></button>
      <span class="hepburn-status" id="hepburnStatus"></span>
    </div>

    <p class="hepburn-col-label" data-i18n="hepburnOutputLabel"></p>
    <div id="hepburnOutput" class="hepburn-result"></div>

    <p class="hepburn-note" data-i18n="hepburnNote"></p>

  </div>
`;

function openHepburn() {
  registerWindowOpen("hepburnWindow");
  document.getElementById("hepburnInput")?.focus();
}

// 標準的なヘボン式をベースにしたかな→ローマ字表
const HEPBURN_TABLE = {
  "あ":"a","い":"i","う":"u","え":"e","お":"o",
  "か":"ka","き":"ki","く":"ku","け":"ke","こ":"ko",
  "さ":"sa","し":"shi","す":"su","せ":"se","そ":"so",
  "た":"ta","ち":"chi","つ":"tsu","て":"te","と":"to",
  "な":"na","に":"ni","ぬ":"nu","ね":"ne","の":"no",
  "は":"ha","ひ":"hi","ふ":"fu","へ":"he","ほ":"ho",
  "ま":"ma","み":"mi","む":"mu","め":"me","も":"mo",
  "や":"ya","ゆ":"yu","よ":"yo",
  "ら":"ra","り":"ri","る":"ru","れ":"re","ろ":"ro",
  "わ":"wa","を":"o",
  "ん":"n",
  "が":"ga","ぎ":"gi","ぐ":"gu","げ":"ge","ご":"go",
  "ざ":"za","じ":"ji","ず":"zu","ぜ":"ze","ぞ":"zo",
  "だ":"da","ぢ":"ji","づ":"zu","で":"de","ど":"do",
  "ば":"ba","び":"bi","ぶ":"bu","べ":"be","ぼ":"bo",
  "ぱ":"pa","ぴ":"pi","ぷ":"pu","ぺ":"pe","ぽ":"po",

  "きゃ":"kya","きゅ":"kyu","きょ":"kyo",
  "しゃ":"sha","しゅ":"shu","しょ":"sho",
  "ちゃ":"cha","ちゅ":"chu","ちょ":"cho",
  "にゃ":"nya","にゅ":"nyu","にょ":"nyo",
  "ひゃ":"hya","ひゅ":"hyu","ひょ":"hyo",
  "みゃ":"mya","みゅ":"myu","みょ":"myo",
  "りゃ":"rya","りゅ":"ryu","りょ":"ryo",
  "ぎゃ":"gya","ぎゅ":"gyu","ぎょ":"gyo",
  "じゃ":"ja","じゅ":"ju","じょ":"jo",
  "びゃ":"bya","びゅ":"byu","びょ":"byo",
  "ぴゃ":"pya","ぴゅ":"pyu","ぴょ":"pyo",

  // カタカナ由来の拡張音
  "うぃ":"wi","うぇ":"we","うぉ":"wo",
  "ゔぁ":"va","ゔぃ":"vi","ゔ":"vu","ゔぇ":"ve","ゔぉ":"vo",
  "ゔゃ":"vya","ゔゅ":"vyu","ゔょ":"vyo",
  "てぃ":"ti","でぃ":"di",
  "とぅ":"tu","どぅ":"du",
  "ふぁ":"fa","ふぃ":"fi","ふぇ":"fe","ふぉ":"fo",
  "ふゅ":"fyu",
  "しぇ":"she","じぇ":"je","ちぇ":"che",
  "つぁ":"tsa","つぃ":"tsi","つぇ":"tse","つぉ":"tso",
  "くぁ":"kwa","くぃ":"kwi","くぇ":"kwe","くぉ":"kwo",
  "ぐぁ":"gwa","ぐぃ":"gwi","ぐぇ":"gwe","ぐぉ":"gwo",
  "いぇ":"ye",
  "でゅ":"dyu","てゅ":"tyu",
  "にぇ":"nye",
  "すぃ":"si","ずぃ":"zi",
  "きぇ":"kye","ぎぇ":"gye",
  "ひぇ":"hye","びぇ":"bye","ぴぇ":"pye",
  "りぇ":"rye"
};

const hepburnKatakanaToHiragana = (text) =>
  text.replace(/[\u30A1-\u30F6]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );

const HEPBURN_VOWELS = new Set(["a", "i", "u", "e", "o"]);
const HEPBURN_MACRON_VOWELS = new Set(["ā", "ī", "ū", "ē", "ō"]);

// かなの母音の連続のうち長音として扱うもの（修正ヘボン式）
// 「いい」「えい」は表記どおり ii / ei のまま
const HEPBURN_LONG_VOWELS = { aa: "ā", uu: "ū", ee: "ē", oo: "ō", ou: "ō" };

function isHepburnConsonantStart(s) {
  return /^[bcdfghjklmnpqrstvwxyz]/.test(s);
}

// 「ー」を適用した結果を返す（直前の母音を長音にする）
// マクロンON：ra + ー → rā、マクロンOFF：ra + ー → raa
function applyHepburnLongVowelMark(result, macronEnabled) {
  const last = result.slice(-1);

  // 「とうー」のように既に長音になっている場合は何もしない
  if (HEPBURN_MACRON_VOWELS.has(last)) return result;
  if (!HEPBURN_VOWELS.has(last)) return result + "ー";

  if (!macronEnabled) return result + last;
  return result.slice(0, -1) + { a:"ā", i:"ī", u:"ū", e:"ē", o:"ō" }[last];
}

function convertHepburnText(text, macronEnabled, uppercaseEnabled) {
  let s = hepburnKatakanaToHiragana(text);
  let result = "";
  let smallTsu = false;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    // 小さい「っ」
    if (ch === "っ") {
      smallTsu = true;
      continue;
    }

    // 長音符
    if (ch === "ー") {
      result = applyHepburnLongVowelMark(result, macronEnabled);
      continue;
    }

    // 改行・空白・記号はそのまま
    if (!/[\u3040-\u309F]/.test(ch)) {
      if (smallTsu) {
        result += "っ";
        smallTsu = false;
      }
      result += ch;
      continue;
    }

    // 3文字→2文字→1文字の順で確認
    // （文字列の末尾では slice が短くなるので、実際に一致した長さを使う）
    let kana = s.slice(i, i + 3);
    let roman = HEPBURN_TABLE[kana];

    if (!roman) {
      kana = s.slice(i, i + 2);
      roman = HEPBURN_TABLE[kana];
    }

    if (!roman) {
      kana = ch;
      roman = HEPBURN_TABLE[kana];
    }

    const consumed = kana.length;

    if (!roman) {
      if (smallTsu) {
        result += "っ";
        smallTsu = false;
      }
      result += ch;
      continue;
    }

    // ん：母音・yの前では n' とする
    if (kana === "ん") {
      const next = s[i + 1] || "";
      const nextRoman = HEPBURN_TABLE[s.slice(i + 1, i + 3)] || HEPBURN_TABLE[next] || "";
      if (nextRoman && (HEPBURN_VOWELS.has(nextRoman[0]) || nextRoman[0] === "y")) {
        result += "n'";
      } else {
        result += "n";
      }
      continue;
    }

    // っ：次のローマ字の先頭子音を重ねる
    if (smallTsu) {
      if (isHepburnConsonantStart(roman)) {
        // 例：まっちゃ → matcha（chの前はtを重ねる）
        if (roman.startsWith("ch")) {
          result += "t";
        } else {
          result += roman[0];
        }
      }
      smallTsu = false;
    }

    // 母音かなが直前の母音と長音を作る場合はマクロン付き母音にまとめる
    // 例：とうきょう → tōkyō、おおさか → ōsaka、くうき → kūki
    if (macronEnabled && consumed === 1) {
      const merged = HEPBURN_LONG_VOWELS[result.slice(-1) + roman];
      if (merged) {
        result = result.slice(0, -1) + merged;
        continue;
      }
    }

    result += roman;
    i += consumed - 1;
  }

  if (smallTsu) result += "っ";

  // macron OFF の場合、長音記号から生成された母音を含め、
  // 既存のマクロンも通常母音へ戻す
  if (!macronEnabled) {
    result = result
      .replaceAll("ā", "a")
      .replaceAll("ī", "i")
      .replaceAll("ū", "u")
      .replaceAll("ē", "e")
      .replaceAll("ō", "o");
  }

  return uppercaseEnabled ? result.toUpperCase() : result;
}

function setHepburnStatus(msg) {
  const el = document.getElementById("hepburnStatus");
  if (el) el.textContent = msg || "";
}

function runHepburnConvert() {
  const input = document.getElementById("hepburnInput");
  const output = document.getElementById("hepburnOutput");
  const macron = document.getElementById("hepburnMacron");
  const uppercase = document.getElementById("hepburnUppercase");
  if (!input || !output) return;

  output.textContent = convertHepburnText(
    input.value,
    !!macron?.checked,
    !!uppercase?.checked
  );
  setHepburnStatus("");
}

function clearHepburnText() {
  const input = document.getElementById("hepburnInput");
  const output = document.getElementById("hepburnOutput");
  if (input) input.value = "";
  if (output) output.textContent = "";
  setHepburnStatus("");
  input?.focus();
}

async function copyHepburnOutput() {
  const output = document.getElementById("hepburnOutput");
  if (!output || !output.textContent) return;

  try {
    await navigator.clipboard.writeText(output.textContent);
    setHepburnStatus(data[lang].hepburnCopied);
  } catch (err) {
    const range = document.createRange();
    range.selectNodeContents(output);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("copy");
    selection.removeAllRanges();
    setHepburnStatus(data[lang].hepburnCopied);
  }
}

function initHepburnApp() {
  const input = document.getElementById("hepburnInput");
  if (!input) return;

  const macron = document.getElementById("hepburnMacron");
  const uppercase = document.getElementById("hepburnUppercase");

  input.addEventListener("input", runHepburnConvert);
  macron?.addEventListener("change", runHepburnConvert);
  uppercase?.addEventListener("change", runHepburnConvert);
  document.getElementById("hepburnConvertBtn")?.addEventListener("click", runHepburnConvert);
  document.getElementById("hepburnCopyBtn")?.addEventListener("click", copyHepburnOutput);
  document.getElementById("hepburnClearBtn")?.addEventListener("click", clearHepburnText);

  runHepburnConvert();
}
