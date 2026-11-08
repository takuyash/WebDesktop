/* =========================
   ウィンドウ（アプリ）一覧
   ※ 各アプリの open 関数・*_WINDOW_CONTENT を参照するため、js/apps/*.js より後に読み込む
========================= */

/*
 * desktop / startMenu: そのアプリをデスクトップアイコン・スタートメニューに
 * 出すかどうか（表示/非表示の切り替えはここを true/false にするだけ）
 * 配列の並び順 = デスクトップアイコンの並び順（縦方向に積んで、
 * 画面の高さで折り返して次の列へ）＝ スタートメニューの並び順
 * onOpen: アイコン/メニュー項目クリック時に呼ぶ関数
 * className: ウィンドウ要素に付けるクラス（初期位置・サイズは css/apps/*.css で指定）
 * content: ウィンドウの中身のHTML（タイトルバーより下の部分）
 * minWidth / minHeight: リサイズ時の最小サイズ
 */
const WINDOW_CONFIG = [
  { id: "calcWindow", titleKey: "calculator", icon: "🧮", onOpen: openCalculator, desktop: true, startMenu: true, className: "calculator-window", content: CALCULATOR_WINDOW_CONTENT, minWidth: 240, minHeight: 320 },
  { id: "notepadWindow", titleKey: "notepad", icon: "📝", onOpen: openNotepad, desktop: true, startMenu: true, className: "notepad-window", content: NOTEPAD_WINDOW_CONTENT, minWidth: 280, minHeight: 200 },
  { id: "paintWindow", titleKey: "paint", icon: "🎨", onOpen: openPaint, desktop: true, startMenu: true, className: "paint-window", content: PAINT_WINDOW_CONTENT, minWidth: 320, minHeight: 280 },
  { id: "terminalWindow", titleKey: "terminal", icon: "💻", onOpen: openTerminal, desktop: true, startMenu: true, className: "terminal-window", content: TERMINAL_WINDOW_CONTENT, minWidth: 360, minHeight: 240 },
  { id: "browserWindow", titleKey: "browser", icon: "🌐", onOpen: openBrowser, desktop: true, startMenu: true, className: "browser-window", content: BROWSER_WINDOW_CONTENT, minWidth: 400, minHeight: 300 },
  { id: "photoWindow", titleKey: "photo", icon: "🖼️", onOpen: openPhoto, desktop: true, startMenu: true, className: "photo-window", content: PHOTO_WINDOW_CONTENT, minWidth: 400, minHeight: 320 },
  { id: "counterWindow", titleKey: "counter", icon: "🔤", onOpen: openCounter, desktop: true, startMenu: true, className: "counter-window", content: COUNTER_WINDOW_CONTENT, minWidth: 380, minHeight: 320 },
  { id: "icoConverterWindow", titleKey: "icoConverter", icon: "🔄", onOpen: openIcoConverter, desktop: true, startMenu: true, className: "ico-converter-window", content: ICO_CONVERTER_WINDOW_CONTENT, minWidth: 400, minHeight: 400 },
  { id: "qrWindow", titleKey: "qrCode", icon: "🔳", onOpen: openQrCode, desktop: true, startMenu: true, className: "qr-window", content: QRCODE_WINDOW_CONTENT, minWidth: 360, minHeight: 420 },
  { id: "zenkakuWindow", titleKey: "zenkaku", icon: "🔠", onOpen: openZenkaku, desktop: true, startMenu: true, className: "zenkaku-window", content: ZENKAKU_WINDOW_CONTENT, minWidth: 480, minHeight: 360 },
  { id: "barcodeWindow", titleKey: "barcode", icon: "🏷️", onOpen: openBarcode, desktop: true, startMenu: true, className: "barcode-window", content: BARCODE_WINDOW_CONTENT, minWidth: 380, minHeight: 360 },
  { id: "stopwatchWindow", titleKey: "stopwatch", icon: "⏱️", onOpen: openStopwatch, desktop: true, startMenu: true, className: "stopwatch-window", content: STOPWATCH_WINDOW_CONTENT, minWidth: 320, minHeight: 400 },
  { id: "hepburnWindow", titleKey: "hepburn", icon: "🔡", onOpen: openHepburn, desktop: true, startMenu: true, className: "hepburn-window", content: HEPBURN_WINDOW_CONTENT, minWidth: 420, minHeight: 420 },
  { id: "settingsWindow", titleKey: "settings", icon: "⚙️", onOpen: openSettings, desktop: true, startMenu: true, className: "settings-window", content: SETTINGS_WINDOW_CONTENT, minWidth: 420, minHeight: 420 },
  { id: "tableDiffWindow", titleKey: "tableDiff", icon: "🔍", onOpen: openTableDiff, desktop: true, startMenu: true, className: "table-diff-window", content: TABLE_DIFF_WINDOW_CONTENT, minWidth: 720, minHeight: 420 },
];

const windowState = Object.fromEntries(
  WINDOW_CONFIG.map(({ id }) => [
    id,
    { status: "closed", bounds: null, beforeMinimize: "normal" }
  ])
);
