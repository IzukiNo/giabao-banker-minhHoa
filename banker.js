function runBanker(_data) {
  const output = document.getElementById("output");
  output.textContent = "";
  const data = JSON.parse(_data);
  const { n, m, Allocation, Max, Available } = data;

  let Need = Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (_, j) => Max[i][j] - Allocation[i][j])
  );

  let Finish = Array(n).fill(false);
  let Work = [...Available];
  let sequence = [];
  let step = 1;
  let changed = true;

  output.textContent += `Bắt đầu thuật toán Banker...\n\n`;

  while (sequence.length < n && changed) {
    changed = false;
    output.textContent += `Vòng ${step}:\n\n`;

    for (let i = 0; i < n; i++) {
      if (!Finish[i]) {
        const need = Need[i];
        const alloc = Allocation[i];

        let canRun = true;

        for (let j = 0; j < m; j++) {
          if (need[j] > Work[j]) {
            canRun = false;
            break;
          }
        }

        if (canRun) {
          output.innerHTML += `▸ Chọn <span class="highlight">P${
            i + 1
          }(${need.join(
            ","
          )})</span> do thoả mãn số tài nguyên còn lại (${Work.join(",")})<br>`;

          for (let j = 0; j < m; j++) {
            Work[j] += alloc[j];
          }

          output.textContent += `\nThực hiện P${
            i + 1
          } rồi giải phóng tài nguyên => tài nguyên còn lại (${Work.join(
            ","
          )})\n\n`;
          Finish[i] = true;
          sequence.push(`P${i + 1}`);
          changed = true;
        }
      }
    }

    if (!changed) {
      output.textContent += `\n❌ Deadlock phát hiện tại vòng ${step}. Không tiến trình nào có thể thực thi.\n`;
    }

    step++;
  }

  if (sequence.length === n) {
    output.textContent += `✅ Vậy hệ thống an toàn với giải pháp là (${sequence.join(
      ", "
    )})`;
  } else {
    output.textContent += `\n⚠️ Hệ thống không an toàn! Không có chuỗi hoàn tất toàn bộ tiến trình.`;
  }
}

function genNeed(data) {
  const n = data.n;
  const m = data.m;
  const allocation = data.Allocation;
  const max = data.Max;
  const available = data.Available;
  const outputArea = document.getElementById("outputArea");

  let html =
    "<h3>Tài nguyên cần được cấp (Max - Allocation)</h3><table border='1'><tr><th></th>";

  for (let i = 0; i < m; i++) {
    html += `<th>R${i + 1}</th>`;
  }
  html += "</tr>";

  for (let i = 0; i < n; i++) {
    html += `<tr><td>P${i + 1}</td>`;
    for (let j = 0; j < m; j++) {
      const required = max[i][j] - allocation[i][j];
      html += `<td>${required >= 0 ? required : 0}</td>`;
    }
    html += "</tr>";
  }

  html += "</table>";

  html += "<h3>Tài nguyên hiện có</h3><ul>";
  for (let i = 0; i < m; i++) {
    html += `<li>R${i + 1}: ${available[i]}</li>`;
  }
  html += "</ul>";

  outputArea.innerHTML = html;
}

function genInput() {
  const p = parseInt(document.getElementById("pInput").value);
  const r = parseInt(document.getElementById("rInput").value);
  const inputArea = document.getElementById("inputArea");

  let html = "<h3>Tài nguyên cần thiết</h3><table border='1'><tr><th></th>";
  for (let i = 0; i < r; i++) {
    html += `<th>R${i + 1}</th>`;
  }
  html += "</tr>";

  for (let i = 0; i < p; i++) {
    html += `<tr><td>P${i + 1}</td>`;
    for (let j = 0; j < r; j++) {
      html += `<td><input type="number" id="max-${i}-${j}" min="0" max="10" size="2"></td>`;
    }
    html += "</tr>";
  }
  html += "</table>";

  html += "<h3>Số tài nguyên đã được cấp</h3><table border='1'><tr><th></th>";
  for (let i = 0; i < r; i++) {
    html += `<th>R${i + 1}</th>`;
  }
  html += "</tr>";

  for (let i = 0; i < p; i++) {
    html += `<tr><td>P${i + 1}</td>`;
    for (let j = 0; j < r; j++) {
      html += `<td><input type="number" id="alloc-${i}-${j}" min="0" max="10" size="2"></td>`;
    }
    html += "</tr>";
  }
  html += "</table>";

  html += "<h3>Tài nguyên còn lại</h3>";
  for (let j = 0; j < r; j++) {
    html += `<span>R${
      j + 1
    }: </span><input type="number" id="avail-${j}" min="0" max="10" size="2"> `;
  }

  html += "<br><br><button onclick='Run()'>Chạy thuật toán</button>";

  inputArea.innerHTML = html;
}

function convertData() {
  const p = parseInt(document.getElementById("pInput").value);
  const r = parseInt(document.getElementById("rInput").value);

  let Allocation = [];
  let Max = [];
  let Available = [];

  for (let i = 0; i < p; i++) {
    let row = [];
    for (let j = 0; j < r; j++) {
      row.push(parseInt(document.getElementById(`max-${i}-${j}`).value) || 0);
    }
    Max.push(row);
  }

  for (let i = 0; i < p; i++) {
    let row = [];
    for (let j = 0; j < r; j++) {
      row.push(parseInt(document.getElementById(`alloc-${i}-${j}`).value) || 0);
    }
    Allocation.push(row);
  }

  for (let j = 0; j < r; j++) {
    Available.push(parseInt(document.getElementById(`avail-${j}`).value) || 0);
  }

  return JSON.stringify({
    n: p,
    m: r,
    Allocation: Allocation,
    Max: Max,
    Available: Available,
  });
}

function Run() {
  const data = convertData();
  genNeed(JSON.parse(data));
  runBanker(data);
  const elements = document.querySelectorAll(".result");
  elements.forEach((element) => {
    element.style.visibility = "visible";
  });
  const output = document.getElementById("output");
  output.scrollTop = output.scrollHeight;
  output.scrollIntoView({ behavior: "smooth" });
}

function loadTestCase(caseNumber) {
  let pInput = document.getElementById("pInput");
  let rInput = document.getElementById("rInput");

  const testCases = [
    {
      p: 3,
      r: 3,
      max: [
        [7, 5, 3],
        [3, 2, 2],
        [9, 0, 2],
      ],
      alloc: [
        [0, 1, 0],
        [2, 0, 0],
        [3, 0, 3],
      ],
      avail: [3, 3, 2],
    },
    {
      p: 3,
      r: 3,
      max: [
        [7, 5, 3],
        [3, 2, 2],
        [9, 0, 2],
      ],
      alloc: [
        [0, 1, 0],
        [2, 0, 0],
        [3, 0, 3],
      ],
      avail: [2, 1, 1],
    },
    {
      p: 4,
      r: 3,
      max: [
        [7, 5, 3],
        [3, 2, 2],
        [9, 0, 2],
        [2, 2, 2],
      ],
      alloc: [
        [0, 1, 0],
        [2, 0, 0],
        [3, 0, 3],
        [2, 1, 1],
      ],
      avail: [3, 3, 2],
    },
    {
      p: 2,
      r: 3,
      max: [
        [5, 3, 3],
        [2, 2, 2],
      ],
      alloc: [
        [2, 1, 1],
        [1, 1, 1],
      ],
      avail: [1, 1, 1],
    },
    {
      p: 3,
      r: 3,
      max: [
        [10, 5, 7],
        [3, 2, 2],
        [9, 0, 3],
      ],
      alloc: [
        [2, 1, 1],
        [2, 1, 0],
        [3, 0, 2],
      ],
      avail: [4, 3, 4],
    },
  ];

  const testCase = testCases[caseNumber - 1];

  pInput.value = testCase.p;
  rInput.value = testCase.r;

  genInput();

  for (let i = 0; i < testCase.p; i++) {
    for (let j = 0; j < testCase.r; j++) {
      document.getElementById(`max-${i}-${j}`).value = testCase.max[i][j];
    }
  }

  for (let i = 0; i < testCase.p; i++) {
    for (let j = 0; j < testCase.r; j++) {
      document.getElementById(`alloc-${i}-${j}`).value = testCase.alloc[i][j];
    }
  }

  for (let j = 0; j < testCase.r; j++) {
    document.getElementById(`avail-${j}`).value = testCase.avail[j];
  }
}
