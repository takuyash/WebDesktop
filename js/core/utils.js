/* =========================
   共通ユーティリティ
========================= */

/* URL（data URL / blob URL）をファイルとしてダウンロードさせる */
function downloadUrl(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
