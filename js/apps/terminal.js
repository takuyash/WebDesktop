/* =========================
   ターミナル
========================= */

/* ウィンドウの中身（外枠・タイトルバーは initWindows() が生成） */
const TERMINAL_WINDOW_CONTENT = `
  <div class="terminal-body">
    <div class="terminal-output" id="terminalOutput"></div>
    <div class="terminal-input-line">
      <span class="terminal-prompt">C:\\></span>
      <input
        type="text"
        id="terminalInput"
        class="terminal-input"
        autocomplete="off"
        spellcheck="false"
      >
    </div>
  </div>
`;

let terminalBooted = false;
const terminalHistory = [];
let terminalHistoryIndex = -1;

function openTerminal() {
  registerWindowOpen("terminalWindow");

  if (!terminalBooted) {
    terminalBooted = true;
    printTerminalWelcome();
  }

  document.getElementById("terminalInput")?.focus();
}

function getTerminalOutput() {
  return document.getElementById("terminalOutput");
}

function appendTerminalLine(text, type = "output") {
  const output = getTerminalOutput();
  if (!output) return;

  const line = document.createElement("div");
  line.className = `terminal-line terminal-${type}`;
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function clearTerminalOutput() {
  const output = getTerminalOutput();
  if (output) {
    output.innerHTML = "";
  }
}

function printTerminalWelcome() {
  appendTerminalLine(data[lang].terminalWelcome, "welcome");
  appendTerminalLine(data[lang].terminalHint, "hint");
}

function getTerminalDirListing() {
  const d = data[lang];
  return [
    `${d.calculator}.exe`,
    `${d.notepad}.exe`,
    `${d.paint}.exe`,
    `${d.terminal}.exe`,
    "README.txt"
  ].join("\n");
}

function terminalOpenApp(name) {
  const apps = {
    calc: { fn: openCalculator, label: () => data[lang].calculator },
    calculator: { fn: openCalculator, label: () => data[lang].calculator },
    notepad: { fn: openNotepad, label: () => data[lang].notepad },
    paint: { fn: openPaint, label: () => data[lang].paint },
    terminal: { fn: openTerminal, label: () => data[lang].terminal },
    browser: { fn: openBrowser, label: () => data[lang].browser }
  };

  const app = apps[name?.toLowerCase()];
  if (!app) return false;

  app.fn();
  appendTerminalLine(
    data[lang].terminalOpened.replace("{app}", app.label()),
    "success"
  );
  return true;
}

function terminalSetLanguage(code) {
  const nextLang = code?.toLowerCase();

  if (nextLang !== "ja" && nextLang !== "en") {
    appendTerminalLine(data[lang].terminalLangInvalid, "error");
    return;
  }

  setLang(nextLang);
  appendTerminalLine(
    data[lang].terminalLangSet.replace("{lang}", lang.toUpperCase()),
    "success"
  );
}

function executeTerminalCommand(input) {
  const trimmed = input.trim();
  if (!trimmed) return;

  appendTerminalLine(`> ${trimmed}`, "input-echo");

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (cmd) {
    case "help":
      appendTerminalLine(data[lang].terminalHelpText, "output");
      break;

    case "clear":
    case "cls":
      clearTerminalOutput();
      break;

    case "echo":
      appendTerminalLine(args.join(" "), "output");
      break;

    case "date": {
      const locale = lang === "ja" ? "ja-JP" : "en-US";
      appendTerminalLine(new Date().toLocaleString(locale), "output");
      break;
    }

    case "whoami":
      appendTerminalLine("desktop-user", "output");
      break;

    case "open":
      if (!args[0]) {
        appendTerminalLine(data[lang].terminalOpenUsage, "error");
        break;
      }
      if (!terminalOpenApp(args[0])) {
        appendTerminalLine(
          data[lang].terminalOpenUnknown.replace("{app}", args[0]),
          "error"
        );
      }
      break;

    case "lang":
      if (!args[0]) {
        appendTerminalLine(data[lang].terminalLangInvalid, "error");
        break;
      }
      terminalSetLanguage(args[0]);
      break;

    case "ver":
    case "version":
      appendTerminalLine(data[lang].terminalVersion, "output");
      break;

    case "about":
      appendTerminalLine(data[lang].terminalAbout, "output");
      break;

    case "ls":
    case "dir":
      appendTerminalLine(getTerminalDirListing(), "output");
      break;

    default:
      appendTerminalLine(
        data[lang].terminalUnknown.replace("{cmd}", parts[0]),
        "error"
      );
  }
}

function initTerminalApp() {
  const input = document.getElementById("terminalInput");
  if (!input) return;

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const value = input.value;
      if (value.trim()) {
        terminalHistory.push(value);
        terminalHistoryIndex = terminalHistory.length;
      }
      executeTerminalCommand(value);
      input.value = "";
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!terminalHistory.length) return;

      terminalHistoryIndex = Math.max(0, terminalHistoryIndex - 1);
      input.value = terminalHistory[terminalHistoryIndex] || "";
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!terminalHistory.length) return;

      terminalHistoryIndex = Math.min(terminalHistory.length, terminalHistoryIndex + 1);
      input.value = terminalHistory[terminalHistoryIndex] || "";
    }
  });
}
