/* =========================
   電卓
========================= */

/* ウィンドウの中身（外枠・タイトルバーは initWindows() が生成） */
const CALCULATOR_WINDOW_CONTENT = `
  <div class="calculator-body">
    <input type="text" class="calc-display" id="calcDisplay" readonly value="0">
    <div class="calc-buttons">
      <button class="calc-btn calc-btn-fn" onclick="calcClear()">C</button>
      <button class="calc-btn calc-btn-fn" onclick="calcBackspace()">⌫</button>
      <button class="calc-btn calc-btn-op" onclick="calcOperator('/')">÷</button>
      <button class="calc-btn calc-btn-op" onclick="calcOperator('*')">×</button>
      <button class="calc-btn" onclick="calcDigit('7')">7</button>
      <button class="calc-btn" onclick="calcDigit('8')">8</button>
      <button class="calc-btn" onclick="calcDigit('9')">9</button>
      <button class="calc-btn calc-btn-op" onclick="calcOperator('-')">−</button>
      <button class="calc-btn" onclick="calcDigit('4')">4</button>
      <button class="calc-btn" onclick="calcDigit('5')">5</button>
      <button class="calc-btn" onclick="calcDigit('6')">6</button>
      <button class="calc-btn calc-btn-op" onclick="calcOperator('+')">+</button>
      <button class="calc-btn" onclick="calcDigit('1')">1</button>
      <button class="calc-btn" onclick="calcDigit('2')">2</button>
      <button class="calc-btn" onclick="calcDigit('3')">3</button>
      <button class="calc-btn calc-btn-eq" onclick="calcEquals()">=</button>
      <button class="calc-btn calc-btn-zero" onclick="calcDigit('0')">0</button>
      <button class="calc-btn" onclick="calcDecimal()">.</button>
    </div>
  </div>
`;

function openCalculator() {
  registerWindowOpen("calcWindow");
}

const calcState = {
  display: "0",
  prev: null,
  operator: null,
  waiting: false
};

function calcUpdateDisplay() {
  const el = document.getElementById("calcDisplay");
  if (el) el.value = calcState.display;
}

function calcDigit(d) {
  if (calcState.display === "Error") {
    calcClear();
  }

  if (calcState.waiting) {
    calcState.display = d;
    calcState.waiting = false;
  } else {
    calcState.display =
      calcState.display === "0"
        ? d
        : calcState.display + d;
  }
  calcUpdateDisplay();
}

function calcDecimal() {
  if (calcState.display === "Error") {
    calcClear();
  }

  if (calcState.waiting) {
    calcState.display = "0.";
    calcState.waiting = false;
  } else if (!calcState.display.includes(".")) {
    calcState.display += ".";
  }
  calcUpdateDisplay();
}

function calcClear() {
  calcState.display = "0";
  calcState.prev = null;
  calcState.operator = null;
  calcState.waiting = false;
  calcUpdateDisplay();
}

function calcBackspace() {
  if (calcState.waiting) return;

  if (calcState.display.length <= 1 ||
      (calcState.display.length === 2 && calcState.display.startsWith("-"))) {
    calcState.display = "0";
  } else {
    calcState.display = calcState.display.slice(0, -1);
  }
  calcUpdateDisplay();
}

function calcCompute(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/":
      if (b === 0) return "Error";
      return a / b;
    default: return b;
  }
}

function calcFormatResult(value) {
  if (value === "Error") return "Error";
  const rounded = Math.round(value * 1e10) / 1e10;
  return String(rounded);
}

function calcOperator(op) {
  if (calcState.display === "Error") {
    calcClear();
    return;
  }

  const current = parseFloat(calcState.display);

  if (calcState.operator !== null && !calcState.waiting) {
    const result = calcCompute(calcState.prev, current, calcState.operator);
    calcState.display = calcFormatResult(result);
    calcState.prev = result === "Error" ? null : result;
  } else {
    calcState.prev = current;
  }

  calcState.operator = op;
  calcState.waiting = true;
  calcUpdateDisplay();
}

function calcEquals() {
  if (calcState.operator === null || calcState.waiting) return;

  const current = parseFloat(calcState.display);
  const result = calcCompute(calcState.prev, current, calcState.operator);

  calcState.display = calcFormatResult(result);
  calcState.prev = null;
  calcState.operator = null;
  calcState.waiting = true;
  calcUpdateDisplay();
}
