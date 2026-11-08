/* =========================
   ICO Converter
========================= */

/* ウィンドウの中身（外枠・タイトルバーは initWindows() が生成） */
const ICO_CONVERTER_WINDOW_CONTENT = `
  <div class="ico-converter-body">
    <div class="ico-app">
      <div class="ico-card">
        <div class="section">
          <p class="section-label" data-i18n="icoInputLabel">入力</p>
          <div class="dropzone" id="icoDropzone">
            <div class="icon">📁</div>
            <div class="dz-main" data-i18n="icoDropMain">画像をドラッグ＆ドロップ</div>
            <div class="dz-or" data-i18n="icoDropOr">または</div>
            <button type="button" class="btn" id="icoSelectBtn" data-i18n="icoSelectBtn">ファイルを選択</button>
          </div>
          <input type="file" id="icoFileInput" accept=".png,.jpg,.jpeg,.webp,.bmp,.gif,.svg,image/*" style="display:none;">
          <div class="accepted-types" data-i18n="icoAcceptedTypes">対応形式: PNG / JPG / JPEG / WebP / BMP / GIF / SVG</div>
        </div>

        <div class="section">
          <p class="section-label" data-i18n="icoPreviewLabel">プレビュー</p>
          <div id="icoPreviewArea">
            <span class="empty-preview" data-i18n="icoEmptyPreview">画像が選択されていません</span>
          </div>
        </div>

        <div class="section">
          <p class="section-label"><span data-i18n="icoSizeLabel">作成サイズ</span> <span style="font-size:10px;color:var(--text-dim);font-weight:normal;" data-i18n="icoSizeSub">（サイズごとに個別のICOを出力）</span></p>
          <div class="size-grid" id="icoSizeGrid"></div>
          <div class="select-row">
            <button type="button" class="btn" id="icoSelectAll" data-i18n="icoSelectAll">すべて選択</button>
            <button type="button" class="btn" id="icoDeselectAll" data-i18n="icoDeselectAll">すべて解除</button>
          </div>
        </div>

        <div class="section">
          <p class="section-label" data-i18n="icoFileNameLabel">ファイル名</p>
          <div class="filename-row">
            <input type="text" class="filename-input" id="icoFileName" placeholder="icon" spellcheck="false" autocomplete="off">
            <span class="filename-suffix">_32x32.ico</span>
          </div>
        </div>

        <div class="section">
          <button type="button" class="create-btn" id="icoCreateBtn" disabled data-i18n="icoCreateBtn">選択サイズのICOを作成</button>
          <div class="status" id="icoStatus"></div>
        </div>
      </div>
    </div>
  </div>
`;

function openIcoConverter() {
  registerWindowOpen("icoConverterWindow");
}

/* =========================
   ICO エンコード
   ICOファイル = ICONDIR(6byte) + ICONDIRENTRY(16byte × 枚数) + 画像データ
   画像データは 256px のみ PNG 圧縮、それ以下は 32bit BMP(DIB) で格納する
   （Windows 標準のアイコンと同じ構成で、古いツールでも読み込める）
========================= */
const ICO_PNG_MIN_SIZE = 256;
const ICO_DEFAULT_FILE_NAME = "icon";

/* 入力されたファイル名から、ファイル名に使えない文字と拡張子を取り除く（空なら "icon"） */
function sanitizeIcoFileName(name) {
  const cleaned = (name || "")
    .replace(/\.ico$/i, "")
    .replace(/[\\/:*?"<>|]/g, "")
    .trim();
  return cleaned || ICO_DEFAULT_FILE_NAME;
}

/* 縦横比を保ったまま size×size の中央に描画する（余白は透明） */
function renderIcoCanvas(img, size) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const srcW = img.naturalWidth || size;
  const srcH = img.naturalHeight || size;
  const scale = Math.min(size / srcW, size / srcH);
  const w = Math.round(srcW * scale);
  const h = Math.round(srcH * scale);
  ctx.drawImage(img, Math.floor((size - w) / 2), Math.floor((size - h) / 2), w, h);

  return canvas;
}

/* canvas → ICO用 32bit BMP データ
   BITMAPINFOHEADER の高さは XOR(色)+AND(マスク) 分で2倍、行は下から上の順 */
function encodeIcoBmp(canvas) {
  const size = canvas.width;
  const pixels = canvas.getContext("2d").getImageData(0, 0, size, size).data;

  const headerSize = 40;
  const xorSize = size * size * 4;
  const andRowBytes = Math.ceil(size / 32) * 4;
  const andSize = andRowBytes * size;

  const buf = new Uint8Array(headerSize + xorSize + andSize);
  const view = new DataView(buf.buffer);

  view.setUint32(0, headerSize, true);      // biSize
  view.setInt32(4, size, true);             // biWidth
  view.setInt32(8, size * 2, true);         // biHeight（XOR + AND）
  view.setUint16(12, 1, true);              // biPlanes
  view.setUint16(14, 32, true);             // biBitCount
  view.setUint32(16, 0, true);              // biCompression = BI_RGB
  view.setUint32(20, xorSize + andSize, true); // biSizeImage

  for (let y = 0; y < size; y += 1) {
    const srcRow = size - 1 - y;
    for (let x = 0; x < size; x += 1) {
      const src = (srcRow * size + x) * 4;
      const dst = headerSize + (y * size + x) * 4;
      buf[dst] = pixels[src + 2];     // B
      buf[dst + 1] = pixels[src + 1]; // G
      buf[dst + 2] = pixels[src];     // R
      buf[dst + 3] = pixels[src + 3]; // A

      // 完全に透明な画素は AND マスクのビットを立てる
      if (pixels[src + 3] === 0) {
        buf[headerSize + xorSize + y * andRowBytes + (x >> 3)] |= 0x80 >> (x & 7);
      }
    }
  }

  return buf;
}

function canvasToPngBytes(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error("PNG encode failed"));
        return;
      }
      blob.arrayBuffer().then(ab => resolve(new Uint8Array(ab)), reject);
    }, "image/png");
  });
}

/* entries: [{ size, data: Uint8Array }] → ICO の Blob */
function buildIcoBlob(entries) {
  const dirSize = 6 + entries.length * 16;
  const header = new Uint8Array(dirSize);
  const view = new DataView(header.buffer);

  view.setUint16(0, 0, true);              // reserved
  view.setUint16(2, 1, true);              // type = 1 (ICO)
  view.setUint16(4, entries.length, true); // 画像の枚数

  let offset = dirSize;
  entries.forEach(({ size, data }, i) => {
    const p = 6 + i * 16;
    view.setUint8(p, size >= 256 ? 0 : size);     // 幅（256 は 0 で表す）
    view.setUint8(p + 1, size >= 256 ? 0 : size); // 高さ
    view.setUint8(p + 2, 0);                      // パレット色数
    view.setUint8(p + 3, 0);                      // reserved
    view.setUint16(p + 4, 1, true);               // planes
    view.setUint16(p + 6, 32, true);              // bit count
    view.setUint32(p + 8, data.length, true);     // データサイズ
    view.setUint32(p + 12, offset, true);         // データ位置
    offset += data.length;
  });

  return new Blob([header, ...entries.map(e => e.data)], { type: "image/x-icon" });
}

/* 画像から指定サイズ1枚の ICO を作る */
async function createIcoFile(img, size) {
  const canvas = renderIcoCanvas(img, size);
  const data = size >= ICO_PNG_MIN_SIZE
    ? await canvasToPngBytes(canvas)
    : encodeIcoBmp(canvas);

  return buildIcoBlob([{ size, data }]);
}

function initIcoConverterApp() {
  const SIZES = [16, 24, 32, 48, 64, 96, 128, 256];

  const dropzone = document.getElementById('icoDropzone');
  const fileInput = document.getElementById('icoFileInput');
  const selectBtn = document.getElementById('icoSelectBtn');
  const previewArea = document.getElementById('icoPreviewArea');
  const sizeGrid = document.getElementById('icoSizeGrid');
  const selectAllBtn = document.getElementById('icoSelectAll');
  const deselectAllBtn = document.getElementById('icoDeselectAll');
  const createBtn = document.getElementById('icoCreateBtn');
  const statusEl = document.getElementById('icoStatus');

  if (!dropzone || !sizeGrid) return;

  let currentImage = null;
  let currentName = '';

  // サイズグリッドの構築
  sizeGrid.innerHTML = SIZES.map(size => `
    <div class="size-tile">
      <input type="checkbox" id="ico-size-${size}" value="${size}" checked>
      <label for="ico-size-${size}">
        <span class="px-icon"></span>
        ${size}×${size}
      </label>
    </div>
  `).join('');

  selectAllBtn.addEventListener('click', () => {
    SIZES.forEach(s => {
      const cb = document.getElementById('ico-size-' + s);
      if (cb) cb.checked = true;
    });
  });

  deselectAllBtn.addEventListener('click', () => {
    SIZES.forEach(s => {
      const cb = document.getElementById('ico-size-' + s);
      if (cb) cb.checked = false;
    });
  });

  selectBtn.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('click', (e) => {
    if (e.target === selectBtn) return;
    fileInput.click();
  });

  ['dragenter', 'dragover'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleIcoFile(file);
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) handleIcoFile(file);
  });

  function handleIcoFile(file) {
    setIcoStatus('', '');
    const validExt = /\.(png|jpe?g|webp|bmp|gif|svg)$/i;
    const isImageType = file.type.startsWith('image/') || validExt.test(file.name);
    if (!isImageType) {
      setIcoStatus(data[lang].icoErrUnsupported, 'err');
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      currentName = file.name;
      previewArea.innerHTML = `
        <div class="preview-row">
          <div class="preview-box"><img src="${img.src}" alt="preview"></div>
          <div class="preview-meta">
            <div class="preview-name">${escapeHtml(currentName)}</div>
            <div class="preview-dims">${img.naturalWidth} × ${img.naturalHeight}px</div>
          </div>
        </div>
      `;
      createBtn.disabled = false;
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setIcoStatus(data[lang].icoErrLoad, 'err');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function setIcoStatus(msg, cls) {
    statusEl.textContent = msg;
    statusEl.className = 'status' + (cls ? ' ' + cls : '');
  }

  // 選択サイズごとに ICO を生成してダウンロード
  createBtn.addEventListener('click', async () => {
    if (!currentImage) return;
    const selectedSizes = SIZES.filter(s => document.getElementById('ico-size-' + s)?.checked);
    if (selectedSizes.length === 0) {
      setIcoStatus(data[lang].icoErrNoSize, 'err');
      return;
    }

    const baseName = sanitizeIcoFileName(document.getElementById('icoFileName')?.value);
    createBtn.disabled = true;

    try {
      for (const size of selectedSizes) {
        const blob = await createIcoFile(currentImage, size);
        const url = URL.createObjectURL(blob);
        downloadUrl(url, `${baseName}_${size}x${size}.ico`);
        // ダウンロード開始前に破棄しないよう少し待ってから解放
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      setIcoStatus(data[lang].icoDownloadStarted, 'ok');
    } catch (err) {
      setIcoStatus(data[lang].icoErrCreate, 'err');
    } finally {
      createBtn.disabled = false;
    }
  });
}
