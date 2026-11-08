/* =========================
   ペイント
========================= */

/* ウィンドウの中身（外枠・タイトルバーは initWindows() が生成） */
const PAINT_WINDOW_CONTENT = `
  <div class="paint-body">
    <div class="paint-toolbar">
      <button type="button" class="paint-tool active" id="paintBrushBtn" onclick="setPaintTool('brush')" data-i18n="paintBrush"></button>
      <button type="button" class="paint-tool" id="paintEraserBtn" onclick="setPaintTool('eraser')" data-i18n="paintEraser"></button>
      <label class="paint-color-label">
        <input type="color" id="paintColor" value="#000000" onchange="setPaintColor(this.value)">
      </label>
      <label class="paint-size-label">
        <span data-i18n="paintSize"></span>
        <input type="range" id="paintSize" min="1" max="24" value="4" oninput="setPaintLineWidth(this.value)">
      </label>
      <button type="button" class="paint-clear-btn" onclick="clearPaintCanvas()" data-i18n="paintClear"></button>
    </div>
    <canvas id="paintCanvas" width="480" height="300"></canvas>
  </div>
`;

const PAINT_STORAGE_KEY = "paint-content";

function openPaint() {
  registerWindowOpen("paintWindow");
}

const paintState = {
  isDrawing: false,
  tool: "brush",
  color: "#000000",
  lineWidth: 4,
  lastX: 0,
  lastY: 0
};

let paintCtx = null;

function getPaintCanvas() {
  return document.getElementById("paintCanvas");
}

function getPaintCoords(clientX, clientY, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

function setPaintTool(tool) {
  paintState.tool = tool;

  const brushBtn = document.getElementById("paintBrushBtn");
  const eraserBtn = document.getElementById("paintEraserBtn");

  if (brushBtn) {
    brushBtn.classList.toggle("active", tool === "brush");
  }

  if (eraserBtn) {
    eraserBtn.classList.toggle("active", tool === "eraser");
  }
}

function setPaintColor(color) {
  paintState.color = color;
  setPaintTool("brush");
}

function setPaintLineWidth(width) {
  paintState.lineWidth = parseInt(width, 10) || 4;
}

function fillPaintBackground() {
  const canvas = getPaintCanvas();
  if (!canvas || !paintCtx) return;

  paintCtx.globalCompositeOperation = "source-over";
  paintCtx.fillStyle = "#ffffff";
  paintCtx.fillRect(0, 0, canvas.width, canvas.height);
}

function savePaintCanvas() {
  const canvas = getPaintCanvas();
  if (!canvas) return;

  try {
    localStorage.setItem(PAINT_STORAGE_KEY, canvas.toDataURL());
  } catch (e) {
    /* localStorage quota exceeded */
  }
}

function loadPaintCanvas() {
  const canvas = getPaintCanvas();
  if (!canvas || !paintCtx) return;

  const saved = localStorage.getItem(PAINT_STORAGE_KEY);

  if (!saved) {
    fillPaintBackground();
    return;
  }

  const img = new Image();
  img.onload = () => {
    paintCtx.globalCompositeOperation = "source-over";
    paintCtx.clearRect(0, 0, canvas.width, canvas.height);
    paintCtx.drawImage(img, 0, 0);
  };
  img.src = saved;
}

function clearPaintCanvas() {
  fillPaintBackground();
  savePaintCanvas();
}

function paintStroke(x, y) {
  if (!paintCtx) return;

  paintCtx.lineCap = "round";
  paintCtx.lineJoin = "round";
  paintCtx.lineWidth = paintState.lineWidth;

  if (paintState.tool === "eraser") {
    paintCtx.globalCompositeOperation = "destination-out";
    paintCtx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    paintCtx.globalCompositeOperation = "source-over";
    paintCtx.strokeStyle = paintState.color;
  }

  paintCtx.beginPath();
  paintCtx.moveTo(paintState.lastX, paintState.lastY);
  paintCtx.lineTo(x, y);
  paintCtx.stroke();

  paintState.lastX = x;
  paintState.lastY = y;
}

function startPaintDraw(clientX, clientY) {
  const canvas = getPaintCanvas();
  if (!canvas || !paintCtx) return;

  paintState.isDrawing = true;
  const { x, y } = getPaintCoords(clientX, clientY, canvas);
  paintState.lastX = x;
  paintState.lastY = y;
  paintStroke(x, y);
}

function movePaintDraw(clientX, clientY) {
  if (!paintState.isDrawing) return;

  const canvas = getPaintCanvas();
  if (!canvas) return;

  const { x, y } = getPaintCoords(clientX, clientY, canvas);
  paintStroke(x, y);
}

function stopPaintDraw() {
  if (!paintState.isDrawing) return;

  paintState.isDrawing = false;
  savePaintCanvas();
}

function initPaintApp() {
  const canvas = getPaintCanvas();
  if (!canvas) return;

  paintCtx = canvas.getContext("2d");
  loadPaintCanvas();

  canvas.addEventListener("mousedown", e => {
    e.preventDefault();
    startPaintDraw(e.clientX, e.clientY);
  });

  canvas.addEventListener("mousemove", e => {
    if (!paintState.isDrawing) return;
    e.preventDefault();
    movePaintDraw(e.clientX, e.clientY);
  });

  canvas.addEventListener("mouseup", stopPaintDraw);
  canvas.addEventListener("mouseleave", stopPaintDraw);

  canvas.addEventListener("touchstart", e => {
    e.preventDefault();
    const touch = e.touches[0];
    startPaintDraw(touch.clientX, touch.clientY);
  }, { passive: false });

  canvas.addEventListener("touchmove", e => {
    if (!paintState.isDrawing) return;
    e.preventDefault();
    const touch = e.touches[0];
    movePaintDraw(touch.clientX, touch.clientY);
  }, { passive: false });

  canvas.addEventListener("touchend", stopPaintDraw);
}
