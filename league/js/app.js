async function loadData() {
  const res = await fetch(`data/scores.json?ts=${Date.now()}`, {
    cache: "no-store"
  });
  return res.json();
}

function sum(obj = {}) {
  return Object.values(obj).reduce((a, b) => a + b, 0);
}

async function render() {
  const data = await loadData();
  const players = data.players;

  // MAIN TABLE
  const main = players.map(p => {
    const WWE = sum(p.WWE);
    const AEW = sum(p.AEW);
    const TNA = sum(p.TNA);
    const NXT = sum(p.NXT);
    return {
      name: p.name,
      WWE, AEW, TNA, NXT,
      total: WWE + AEW + TNA + NXT
    };
  }).sort((a, b) => b.total - a.total);

  const mainBody = document.querySelector("#mainTable tbody");
  mainBody.innerHTML = "";

  main.forEach((p, i) => {
    mainBody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${p.name}</td>
        <td>${p.WWE}</td>
        <td>${p.AEW}</td>
        <td>${p.TNA}</td>
        <td>${p.NXT}</td>
        <td><strong>${p.total}</strong></td>
      </tr>
    `;
  });
// BREAKDOWN TABLES WITH TOTALS
["WWE", "AEW", "NXT", "TNA"].forEach(company => {
  const table = document.getElementById(company);
  const maxPoints = data.ppv_max_points[company] || {};

  // Collect PPVs
  const ppvs = new Set();
  players.forEach(p => {
    Object.keys(p[company] || {}).forEach(ppv => ppvs.add(ppv));
  });

  let html = "<thead><tr><th>PPV</th>";
  players.forEach(p => html += `<th>${p.name}</th>`);
  html += `<th>Total</th></tr></thead><tbody>`;

  ppvs.forEach(ppv => {
    let rowTotal = 0;

    html += `<tr><td>${ppv}</td>`;

    players.forEach(p => {
      const val = p[company]?.[ppv] ?? 0;
      rowTotal += val;
      html += `<td>${val}</td>`;
    });

    const max = maxPoints[ppv] ?? "-";
    html += `
      <td class="ppv-total">
        ${rowTotal}
        <div class="ppv-max">/ ${max}</div>
      </td>
    </tr>`;
  });

  html += "</tbody>";
  table.innerHTML = html;
});
}

render();
