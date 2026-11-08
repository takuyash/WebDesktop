/* =========================
   フォト
========================= */

/* ウィンドウの中身（外枠・タイトルバーは initWindows() が生成） */
const PHOTO_WINDOW_CONTENT = `
  <div class="photo-body">
    <div class="photo-thumbs" id="photoThumbs"></div>

    <div class="photo-viewer">
      <div class="photo-viewer-main">
        <button type="button" class="photo-nav-btn" onclick="photoPrev()">◀</button>
        <img id="photoMainImage" class="photo-main-image" src="" alt="">
        <button type="button" class="photo-nav-btn" onclick="photoNext()">▶</button>
      </div>
      <div class="photo-caption" id="photoCaption"></div>
    </div>
  </div>
`;

/* 画像リスト（assets 配下の実際のファイル名。設定アプリの背景選択でも使用） */
const photoFiles = [
  { file: "assets/bg.png", caption: "bg.png" },
  { file: "assets/bg1.png", caption: "bg1.png" },
  { file: "assets/bg2.png", caption: "bg2.png" },
  { file: "assets/bg3.png", caption: "bg3.png" }
];

let photoBooted = false;
let photoIndex = 0;

function openPhoto() {
  registerWindowOpen("photoWindow");

  if (!photoBooted) {
    photoBooted = true;
    renderPhotoThumbs();
    photoShow(0);
  }
}

function renderPhotoThumbs() {
  const container = document.getElementById("photoThumbs");
  if (!container) return;

  if (!photoFiles.length) {
    container.innerHTML = `<div class="photo-empty">${data[lang].photoEmpty}</div>`;
    return;
  }

  container.innerHTML = photoFiles
    .map((p, i) => `
      <button type="button" class="photo-thumb-btn ${i === photoIndex ? "active" : ""}" data-index="${i}">
        <img src="${p.file}" alt="">
      </button>
    `)
    .join("");

  container.querySelectorAll(".photo-thumb-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      photoShow(parseInt(btn.dataset.index, 10));
    });
  });
}

function photoShow(index) {
  if (!photoFiles.length) return;

  const len = photoFiles.length;
  photoIndex = ((index % len) + len) % len;

  const photo = photoFiles[photoIndex];
  const img = document.getElementById("photoMainImage");
  const caption = document.getElementById("photoCaption");

  if (img) {
    img.src = photo.file;
    img.alt = photo.caption || "";
  }

  if (caption) {
    caption.textContent = photo.caption || "";
  }

  renderPhotoThumbs();
}

function photoPrev() {
  photoShow(photoIndex - 1);
}

function photoNext() {
  photoShow(photoIndex + 1);
}
