/* =========================
   バーコードジェネレーター (Code128 / Code Set B)
========================= */

/* ウィンドウの中身（外枠・タイトルバーは initWindows() が生成） */
const BARCODE_WINDOW_CONTENT = `
  <div class="barcode-body">

    <label class="barcode-option-label barcode-type-label">
      <span data-i18n="barcodeTypeLabel"></span>
      <select id="barcodeType">
        <option value="code128">CODE128</option>
        <option value="code39">CODE39</option>
        <option value="ean13">EAN-13</option>
        <option value="ean8">EAN-8</option>
        <option value="upca">UPC-A</option>
        <option value="itf">ITF (Interleaved 2 of 5)</option>
        <option value="codabar">Codabar (NW-7)</option>
      </select>
    </label>

    <input
      type="text"
      id="barcodeText"
      class="barcode-input"
      data-i18n-placeholder="barcodeTextPlaceholder"
      spellcheck="false"
    >

    <p class="barcode-type-hint" id="barcodeTypeHint"></p>

    <div class="barcode-options">
      <label class="barcode-option-label">
        <span data-i18n="barcodeBarWidthLabel"></span>
        <input type="range" id="barcodeBarWidth" min="1" max="4" value="2">
      </label>
      <label class="barcode-option-label">
        <span data-i18n="barcodeBarHeightLabel"></span>
        <input type="range" id="barcodeBarHeight" min="40" max="150" value="80">
      </label>
      <label class="barcode-option-label barcode-checkbox-label">
        <input type="checkbox" id="barcodeShowText" checked>
        <span data-i18n="barcodeShowTextLabel"></span>
      </label>
    </div>

    <div class="barcode-preview" id="barcodePreview">
      <canvas id="barcodeCanvas"></canvas>
      <div class="barcode-empty" id="barcodeEmpty" data-i18n="barcodeEmptyText"></div>
    </div>

    <div class="barcode-actions">
      <button type="button" class="barcode-download-btn" id="barcodeDownloadBtn" disabled data-i18n="barcodeDownloadBtn"></button>
      <button type="button" class="barcode-clear-btn" onclick="clearBarcode()" data-i18n="clear"></button>
    </div>

    <div class="barcode-status" id="barcodeStatus"></div>

  </div>
`;

// Code128 の全107シンボル(値0〜106)に対応するバー/スペースパターン(11ビット、
// STOP(値106)のみ13ビット)。'1'=黒バー、'0'=白スペース。Code Set B は
// 値0〜94がASCII 32〜126に1対1で対応する。
const CODE128_PATTERNS = [
  "11011001100", "11001101100", "11001100110", "10010011000", "10010001100",
  "10001001100", "10011001000", "10011000100", "10001100100", "11001001000",
  "11001000100", "11000100100", "10110011100", "10011011100", "10011001110",
  "10111001100", "10011101100", "10011100110", "11001110010", "11001011100",
  "11001001110", "11011100100", "11001110100", "11101101110", "11101001100",
  "11100101100", "11100100110", "11101100100", "11100110100", "11100110010",
  "11011011000", "11011000110", "11000110110", "10100011000", "10001011000",
  "10001000110", "10110001000", "10001101000", "10001100010", "11010001000",
  "11000101000", "11000100010", "10110111000", "10110001110", "10001101110",
  "10111011000", "10111000110", "10001110110", "11101110110", "11010001110",
  "11000101110", "11011101000", "11011100010", "11011101110", "11101011000",
  "11101000110", "11100010110", "11101101000", "11101100010", "11100011010",
  "11101111010", "11001000010", "11110001010", "10100110000", "10100001100",
  "10010110000", "10010000110", "10000101100", "10000100110", "10110010000",
  "10110000100", "10011010000", "10011000010", "10000110100", "10000110010",
  "11000010010", "11001010000", "11110111010", "11000010100", "10001111010",
  "10100111100", "10010111100", "10010011110", "10111100100", "10011110100",
  "10011110010", "11110100100", "11110010100", "11110010010", "11011011110",
  "11011110110", "11110110110", "10101111000", "10100011110", "10001011110",
  "10111101000", "10111100010", "11110101000", "11110100010", "10111011110",
  "10111101110", "11101011110", "11110101110", "11010000100", "11010010000",
  "11010011100", "1100011101011"
];

const CODE128_START_B = 104;
const CODE128_STOP = 106;

// 対応文字なら Code128 のバイナリパターン(文字列)を返し、非対応文字が
// 含まれる場合は null を返す
function encodeCode128(text) {
  if (!text) return null;

  const values = [];
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code < 32 || code > 126) return null;
    values.push(code - 32);
  }

  let checksum = CODE128_START_B;
  values.forEach((v, i) => {
    checksum += v * (i + 1);
  });
  checksum %= 103;

  const symbolValues = [CODE128_START_B, ...values, checksum, CODE128_STOP];
  return symbolValues.map(v => CODE128_PATTERNS[v]).join("");
}

/* ---- CODE39 (Code 3 of 9) ----
   各文字を10進値でエンコードし、2進数に変換するとナロー(1モジュール)/
   ワイド(3モジュール)を表す15桁のバー/スペースパターンになる。
   （出典: Code 39 の公開仕様に基づく標準的な符号化テーブル） */
const CODE39_CHARS = [
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
  "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
  "U", "V", "W", "X", "Y", "Z",
  "-", ".", " ", "$", "/", "+", "%", "*"
];
const CODE39_ENCODINGS = [
  20957, 29783, 23639, 30485, 20951, 29813, 23669, 20855, 29789, 23645,
  29975, 23831, 30533, 22295, 30149, 24005, 21623, 29981, 23837, 22301,
  30023, 23879, 30545, 22343, 30161, 24017, 21959, 30065, 23921, 22385,
  29015, 18263, 29141, 17879, 29045, 18293,
  17783, 29021, 18269, 17477, 17489, 17681, 20753, 35770
];

// 対応文字なら Code39 のバイナリパターン(文字列、開始/終了の*付き)を返し、
// 非対応文字が含まれる場合は null を返す
function encodeCode39(text) {
  if (!text) return null;

  const upper = text.toUpperCase();
  const startStopIdx = CODE39_CHARS.indexOf("*");
  let result = CODE39_ENCODINGS[startStopIdx].toString(2);

  for (let i = 0; i < upper.length; i += 1) {
    const ch = upper[i];
    if (ch === "*") return null;
    const idx = CODE39_CHARS.indexOf(ch);
    if (idx === -1) return null;
    result += CODE39_ENCODINGS[idx].toString(2) + "0";
  }

  result += CODE39_ENCODINGS[startStopIdx].toString(2);
  return result;
}

/* ---- EAN-13 / EAN-8 / UPC-A ----
   L(奇数パリティ)/G(偶数パリティ)/R(右側)の7ビットパターンと、
   EAN-13の先頭数字に応じたL/G構成テーブル（標準的なEAN/UPC符号化仕様に基づく） */
const EAN_SIDE_BIN = "101";
const EAN_MIDDLE_BIN = "01010";
const EAN_L = [
  "0001101", "0011001", "0010011", "0111101", "0100011",
  "0110001", "0101111", "0111011", "0110111", "0001011"
];
const EAN_G = [
  "0100111", "0110011", "0011011", "0100001", "0011101",
  "0111001", "0000101", "0010001", "0001001", "0010111"
];
const EAN_R = [
  "1110010", "1100110", "1101100", "1000010", "1011100",
  "1001110", "1010000", "1000100", "1001000", "1110100"
];
const EAN13_STRUCTURE = [
  "LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG",
  "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"
];

function ean13Checksum(digits12) {
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    const n = parseInt(digits12[i], 10);
    sum += (i % 2 === 1) ? n * 3 : n;
  }
  return (10 - (sum % 10)) % 10;
}

// 12桁(チェックデジット自動計算)または13桁(チェックデジット検証)の数字から
// EAN-13のバー/スペースパターンを返す。不正な場合は null
function encodeEAN13(text) {
  if (!/^[0-9]{12,13}$/.test(text)) return null;

  let digits = text;
  if (digits.length === 12) {
    digits += String(ean13Checksum(digits));
  } else if (parseInt(digits[12], 10) !== ean13Checksum(digits.slice(0, 12))) {
    return null;
  }

  const structure = EAN13_STRUCTURE[parseInt(digits[0], 10)];
  let left = "";
  for (let i = 0; i < 6; i += 1) {
    const d = parseInt(digits[1 + i], 10);
    left += structure[i] === "L" ? EAN_L[d] : EAN_G[d];
  }
  let right = "";
  for (let i = 0; i < 6; i += 1) {
    right += EAN_R[parseInt(digits[7 + i], 10)];
  }

  return {
    pattern: EAN_SIDE_BIN + left + EAN_MIDDLE_BIN + right + EAN_SIDE_BIN,
    displayText: digits
  };
}

function ean8Checksum(digits7) {
  let sum = 0;
  for (let i = 0; i < 7; i += 1) {
    const n = parseInt(digits7[i], 10);
    sum += (i % 2 === 1) ? n : n * 3;
  }
  return (10 - (sum % 10)) % 10;
}

// 7桁(チェックデジット自動計算)または8桁(チェックデジット検証)の数字から
// EAN-8のバー/スペースパターンを返す。不正な場合は null
function encodeEAN8(text) {
  if (!/^[0-9]{7,8}$/.test(text)) return null;

  let digits = text;
  if (digits.length === 7) {
    digits += String(ean8Checksum(digits));
  } else if (parseInt(digits[7], 10) !== ean8Checksum(digits.slice(0, 7))) {
    return null;
  }

  let left = "";
  for (let i = 0; i < 4; i += 1) left += EAN_L[parseInt(digits[i], 10)];
  let right = "";
  for (let i = 0; i < 4; i += 1) right += EAN_R[parseInt(digits[4 + i], 10)];

  return {
    pattern: EAN_SIDE_BIN + left + EAN_MIDDLE_BIN + right + EAN_SIDE_BIN,
    displayText: digits
  };
}

function upcaChecksum(digits11) {
  let sum = 0;
  for (let i = 1; i < 11; i += 2) sum += parseInt(digits11[i], 10);
  for (let i = 0; i < 11; i += 2) sum += parseInt(digits11[i], 10) * 3;
  return (10 - (sum % 10)) % 10;
}

// 11桁(チェックデジット自動計算)または12桁(チェックデジット検証)の数字から
// UPC-Aのバー/スペースパターンを返す。不正な場合は null
function encodeUPCA(text) {
  if (!/^[0-9]{11,12}$/.test(text)) return null;

  let digits = text;
  if (digits.length === 11) {
    digits += String(upcaChecksum(digits));
  } else if (parseInt(digits[11], 10) !== upcaChecksum(digits.slice(0, 11))) {
    return null;
  }

  let left = "";
  for (let i = 0; i < 6; i += 1) left += EAN_L[parseInt(digits[i], 10)];
  let right = "";
  for (let i = 0; i < 6; i += 1) right += EAN_R[parseInt(digits[6 + i], 10)];

  return {
    pattern: EAN_SIDE_BIN + left + EAN_MIDDLE_BIN + right + EAN_SIDE_BIN,
    displayText: digits
  };
}

/* ---- ITF (Interleaved 2 of 5) ----
   2桁ずつ組にして、1桁目を黒バー・2桁目を白スペースに交互に割り当てる
   （標準的なInterleaved 2 of 5符号化仕様に基づく） */
const ITF_START_BIN = "1010";
const ITF_END_BIN = "11101";
const ITF_DIGIT_BIN = [
  "00110", "10001", "01001", "11000", "00101",
  "10100", "01100", "00011", "10010", "01010"
];

// 偶数桁の数字からITFのバー/スペースパターンを返す。不正な場合は null
function encodeITF(text) {
  if (!/^([0-9]{2})+$/.test(text)) return null;

  let body = "";
  for (let i = 0; i < text.length; i += 2) {
    const first = ITF_DIGIT_BIN[parseInt(text[i], 10)];
    const second = ITF_DIGIT_BIN[parseInt(text[i + 1], 10)];
    for (let j = 0; j < 5; j += 1) {
      body += first[j] === "1" ? "111" : "1";
      body += second[j] === "1" ? "000" : "0";
    }
  }

  return {
    pattern: ITF_START_BIN + body + ITF_END_BIN,
    displayText: text
  };
}

/* ---- Codabar (NW-7) ----
   数字と一部記号、開始/終了文字(A〜D)から成る
   （標準的なCodabar符号化仕様に基づく） */
const CODABAR_ENCODINGS = {
  "0": "101010011", "1": "101011001", "2": "101001011", "3": "110010101", "4": "101101001",
  "5": "110101001", "6": "100101011", "7": "100101101", "8": "100110101", "9": "110100101",
  "-": "101001101", "$": "101100101", ":": "1101011011", "/": "1101101011", ".": "1101101101",
  "+": "1011011011", "A": "1011001001", "B": "1001001011", "C": "1010010011", "D": "1010011001"
};

// Codabarのバー/スペースパターンを返す。開始/終了文字(A〜D)が省略されている
// 場合は自動的に付加する。不正な場合は null
function encodeCodabar(text) {
  if (!text) return null;

  let target = text.toUpperCase();
  if (/^[0-9\-$:./+]+$/.test(target)) {
    target = "A" + target + "A";
  }
  if (!/^[A-D][0-9\-$:./+]+[A-D]$/.test(target)) return null;

  let result = "";
  for (let i = 0; i < target.length; i += 1) {
    result += CODABAR_ENCODINGS[target[i]];
    if (i !== target.length - 1) result += "0";
  }

  return { pattern: result, displayText: target };
}

/* ---- バーコード規格レジストリ ----
   各規格の符号化関数・エラーメッセージ/ヒント/プレースホルダーのi18nキーを
   1つにまとめ、UIとgenerateBarcode()から共通で参照する */
const BARCODE_FORMATS = {
  code128: {
    encode(text) {
      const pattern = encodeCode128(text);
      return pattern ? { pattern, displayText: text } : null;
    },
    errorKey: "barcodeErrorInvalid",
    hintKey: "barcodeHint128",
    placeholderKey: "barcodeTextPlaceholder"
  },
  code39: {
    encode(text) {
      const pattern = encodeCode39(text);
      return pattern ? { pattern, displayText: text.toUpperCase() } : null;
    },
    errorKey: "barcodeErrorInvalid39",
    hintKey: "barcodeHint39",
    placeholderKey: "barcodePlaceholder39"
  },
  ean13: {
    encode: encodeEAN13,
    errorKey: "barcodeErrorEAN13",
    hintKey: "barcodeHintEAN13",
    placeholderKey: "barcodePlaceholderEAN13"
  },
  ean8: {
    encode: encodeEAN8,
    errorKey: "barcodeErrorEAN8",
    hintKey: "barcodeHintEAN8",
    placeholderKey: "barcodePlaceholderEAN8"
  },
  upca: {
    encode: encodeUPCA,
    errorKey: "barcodeErrorUPCA",
    hintKey: "barcodeHintUPCA",
    placeholderKey: "barcodePlaceholderUPCA"
  },
  itf: {
    encode: encodeITF,
    errorKey: "barcodeErrorITF",
    hintKey: "barcodeHintITF",
    placeholderKey: "barcodePlaceholderITF"
  },
  codabar: {
    encode: encodeCodabar,
    errorKey: "barcodeErrorCodabar",
    hintKey: "barcodeHintCodabar",
    placeholderKey: "barcodePlaceholderCodabar"
  }
};

function getBarcodeFormat() {
  const select = document.getElementById("barcodeType");
  const key = select ? select.value : "code128";
  return BARCODE_FORMATS[key] || BARCODE_FORMATS.code128;
}

// 選択中の規格に応じて入力欄のプレースホルダーとヒント文言を更新する
function updateBarcodeTypeUI() {
  const d = data[lang];
  const format = getBarcodeFormat();
  const input = document.getElementById("barcodeText");
  const hint = document.getElementById("barcodeTypeHint");

  if (input) {
    input.placeholder = d[format.placeholderKey] || d.barcodeTextPlaceholder;
  }
  if (hint) {
    hint.textContent = d[format.hintKey] || "";
  }
}

function openBarcode() {
  registerWindowOpen("barcodeWindow");
  document.getElementById("barcodeText")?.focus();
}

function clearBarcode() {
  const input = document.getElementById("barcodeText");
  if (!input) return;

  input.value = "";
  generateBarcode();
  input.focus();
}

function setBarcodeStatus(msg) {
  const statusEl = document.getElementById("barcodeStatus");
  if (statusEl) statusEl.textContent = msg || "";
}

function generateBarcode() {
  const input = document.getElementById("barcodeText");
  const canvas = document.getElementById("barcodeCanvas");
  const preview = document.getElementById("barcodePreview");
  const downloadBtn = document.getElementById("barcodeDownloadBtn");
  const barWidthInput = document.getElementById("barcodeBarWidth");
  const barHeightInput = document.getElementById("barcodeBarHeight");
  const showTextInput = document.getElementById("barcodeShowText");

  if (!input || !canvas || !preview) return;

  const text = input.value;
  const format = getBarcodeFormat();

  if (!text) {
    preview.classList.remove("has-code");
    if (downloadBtn) downloadBtn.disabled = true;
    setBarcodeStatus("");
    return;
  }

  const result = format.encode(text);

  if (!result) {
    preview.classList.remove("has-code");
    if (downloadBtn) downloadBtn.disabled = true;
    setBarcodeStatus(data[lang][format.errorKey] || data[lang].barcodeErrorInvalid);
    return;
  }

  const { pattern, displayText } = result;

  const moduleWidth = barWidthInput ? parseInt(barWidthInput.value, 10) || 2 : 2;
  const barHeight = barHeightInput ? parseInt(barHeightInput.value, 10) || 80 : 80;
  const showText = showTextInput ? showTextInput.checked : true;
  const quietZone = moduleWidth * 10;
  const textHeight = showText ? 22 : 0;

  const codeWidth = pattern.length * moduleWidth;
  const canvasWidth = codeWidth + quietZone * 2;
  const canvasHeight = barHeight + textHeight + 12;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = "#000000";

  let x = quietZone;
  for (let i = 0; i < pattern.length; i += 1) {
    if (pattern[i] === "1") {
      ctx.fillRect(x, 6, moduleWidth, barHeight);
    }
    x += moduleWidth;
  }

  if (showText) {
    ctx.font = "14px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(displayText, canvasWidth / 2, barHeight + 6 + textHeight / 2, codeWidth);
  }

  preview.classList.add("has-code");
  if (downloadBtn) downloadBtn.disabled = false;
  setBarcodeStatus("");
}

function downloadBarcode() {
  const canvas = document.getElementById("barcodeCanvas");
  if (!canvas) return;

  const typeSelect = document.getElementById("barcodeType");
  const type = typeSelect ? typeSelect.value : "code128";

  downloadUrl(canvas.toDataURL("image/png"), `barcode-${type}.png`);
}

function initBarcodeApp() {
  const input = document.getElementById("barcodeText");
  const typeSelect = document.getElementById("barcodeType");
  const barWidthInput = document.getElementById("barcodeBarWidth");
  const barHeightInput = document.getElementById("barcodeBarHeight");
  const showTextInput = document.getElementById("barcodeShowText");
  const downloadBtn = document.getElementById("barcodeDownloadBtn");

  if (!input) return;

  input.addEventListener("input", generateBarcode);
  typeSelect?.addEventListener("change", () => {
    updateBarcodeTypeUI();
    generateBarcode();
  });
  barWidthInput?.addEventListener("input", generateBarcode);
  barHeightInput?.addEventListener("input", generateBarcode);
  showTextInput?.addEventListener("change", generateBarcode);
  downloadBtn?.addEventListener("click", downloadBarcode);

  updateBarcodeTypeUI();
  generateBarcode();
}
