# WebDesktop

ブラウザで動くデスクトップ風の Web サイトです。
HTML / CSS / JavaScript だけで作っていて、ビルドツールやサーバーは不要です。
ウィンドウの移動・リサイズ・最小化・最大化、タスクバー、スタートメニューなど、
デスクトップ OS のような操作感で便利ツールを使えます。

## 使い方

`index.html` をブラウザで開くだけで動きます（ダブルクリックで開いても OK）。

- デスクトップのアイコン、または左下の `⊞`（スタートメニュー）からアプリを起動
- タイトルバーをドラッグで移動、ウィンドウの端をドラッグでリサイズ
- タスクバー右側で 言語切替（日本語 / English）・全画面表示・時計（クリックでカレンダー）

## アプリ一覧

| アプリ | 内容 |
|---|---|
| 🧮 電卓 | 四則演算 |
| 📝 メモ帳 | 入力内容はブラウザに自動保存 |
| 🎨 ペイント | ブラシ・消しゴム・色・太さの変更。描いた絵は自動保存 |
| 💻 ターミナル | `help` `echo` `date` `open` `lang` などの簡易コマンド |
| 🌐 ブラウザ | URL・検索語でページを表示（iframe 表示のため、埋め込みを禁止しているサイトは表示できません） |
| 🖼️ フォト | `assets` フォルダの画像を表示 |
| 🔤 文字数カウンター | 文字数（改行含む／除く／空白除く）と行数 |
| 🔄 ICO変換 | 画像（PNG / JPG / WebP / BMP / GIF / SVG）からサイズごとの `.ico` を作成。出力ファイル名も指定可 |
| 🔳 QRコード | 文字列・URL から QR コードを作成し PNG で保存 |
| 🔠 全角/半角変換 | 英数字・カタカナ・空白を全角⇔半角に変換 |
| 🏷️ バーコード | CODE128 / CODE39 / EAN-13 / EAN-8 / UPC-A / ITF / Codabar を作成し PNG で保存 |
| ⏱️ ストップウォッチ | 計測とラップタイム |
| 🔡 ヘボン式ローマ字変換 | ひらがな・カタカナをヘボン式ローマ字に変換（長音のマクロン表記・大文字出力に対応） |
| ⚙️ 設定 | 背景画像・言語の変更、保存データの削除 |
| 🔍 テーブル差分比較 | 2 つの表データをセル単位で比較（`table-diff.html`） |

## 保存されるデータ

次のデータはブラウザの `localStorage` に保存されます。設定アプリの「保存データを削除」で消せます。

| キー | 内容 |
|---|---|
| `notepad-content` | メモ帳の内容 |
| `paint-content` | ペイントの画像 |
| `desktop-bg` | 選択した背景画像 |

## ファイル構成

```
index.html            土台（デスクトップ・タスクバー・スタートメニュー）と読み込み
table-diff.html       テーブル差分比較ツール（iframe で表示）
qrcode-lib.js         QR コード生成ライブラリ
assets/               背景・フォト用の画像
css/
  base.css            デスクトップ・タスクバー・ウィンドウ共通のスタイル
  apps/*.css          アプリごとのスタイル（ウィンドウの初期位置・サイズもここ）
js/
  i18n.js             日本語 / 英語の翻訳文字列
  core/
    utils.js          共通処理
    window-manager.js ウィンドウの生成・最小化・最大化・ドラッグ・リサイズ
    desktop.js        デスクトップアイコン・スタートメニュー
    taskbar.js        全画面表示・時計・カレンダー
  apps/*.js           アプリごとの画面（HTML）と処理
  windows.js          アプリ一覧（WINDOW_CONFIG）
  main.js             言語切替時の再描画と初期化
```

`<script>` は依存関係の順に読み込んでいます。`js/windows.js` は各アプリの関数を参照するので、
`js/apps/*.js` より後に読み込む必要があります。

## アプリの追加方法

1. `js/apps/foo.js` を作成し、次を定義する
   - `FOO_WINDOW_CONTENT`：ウィンドウの中身の HTML（タイトルバーと操作ボタンは自動で付きます）
   - `openFoo()`：`registerWindowOpen("fooWindow")` を呼ぶ
   - 必要なら `initFooApp()`：イベント登録などの初期化
2. `css/apps/foo.css` を作成し、`.foo-window`（初期位置・サイズ）とアプリ内のスタイルを書く
3. `js/windows.js` の `WINDOW_CONFIG` に 1 行追加する
   ```js
   { id: "fooWindow", titleKey: "foo", icon: "🦊", onOpen: openFoo, desktop: true, startMenu: true,
     className: "foo-window", content: FOO_WINDOW_CONTENT, minWidth: 320, minHeight: 240 },
   ```
   配列の並び順がデスクトップアイコン・スタートメニューの並び順になります。
   `desktop` / `startMenu` を `false` にすると非表示にできます。
4. `js/i18n.js` の `ja` / `en` 両方に、タイトル（`foo`）と画面内の文言のキーを追加する
5. `index.html` に `<link>` と `<script>` を追加する。`initFooApp()` を作った場合は `js/main.js` からも呼ぶ

### 多言語対応

画面内の文言は `js/i18n.js` のキーで指定します。言語を切り替えると自動で書き換わります。

```html
<span data-i18n="キー"></span>                     <!-- テキスト -->
<input data-i18n-placeholder="キー">               <!-- プレースホルダー -->
<button data-i18n-title="キー"></button>           <!-- ツールチップ -->
```

JavaScript から表示する文言は `data[lang].キー` で取得します。

## ライセンス

[MIT License](LICENSE)
