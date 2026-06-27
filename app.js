const picks = {
  round32: Array(16).fill(""),
  round16: Array(8).fill(""),
  qf: Array(4).fill(""),
  sf: Array(2).fill(""),
  final: Array(1).fill("")
};

function createRound(id, count, label, disabled = false) {
  const container = document.getElementById(id);
  container.innerHTML = `<h2>${label}</h2>`;
  for (let i = 0; i < count; i++) {
    container.innerHTML += `
      <div class="match">
        <select ${disabled ? "disabled" : ""} onchange="updatePick('${id}', ${i}, this.value)">
          <option value="">Select winner</option>
          <option>Team A</option>
          <option>Team B</option>
        </select>
      </div>`;
  }
}

function unlockRound(roundId) {
  const selects = document.getElementById(roundId).getElementsByTagName("select");
  for (let s of selects) s.disabled = false;
}

function updatePick(round, index, value) {
  picks[round][index] = value;

  if (round === "round32") {
    updateNext("round32", "round16");
    if (!picks.round32.includes("")) unlockRound("round16");
  }

  if (round === "round16") {
    updateNext("round16", "qf");
    if (!picks.round16.includes("")) unlockRound("qf");
  }

  if (round === "qf") {
    updateNext("qf", "sf");
    if (!picks.qf.includes("")) unlockRound("sf");
  }

  if (round === "sf") {
    updateNext("sf", "final");
    if (!picks.sf.includes("")) unlockRound("final");
  }
}

function updateNext(current, next) {
  const winners = picks[current].filter(x => x !== "");
  const nextRound = document.getElementById(next).getElementsByTagName("select");

  for (let i = 0; i < nextRound.length; i++) {
    nextRound[i].innerHTML = `
      <option value="">Select winner</option>
      <option>${winners[i*2] || ""}</option>
      <option>${winners[i*2+1] || ""}</option>
    `;
  }
}

function validateAllPicks() {
  for (const round in picks) {
    if (picks[round].some(p => p === "")) {
      alert("You must complete all picks before submitting.");
      return false;
    }
  }
  return true;
}

function exportCSV() {
  if (!validateAllPicks()) return;

  let csv = "Round,Match,Pick\n";

  Object.keys(picks).forEach(round => {
    picks[round].forEach((pick, i) => {
      csv += `${round},${i+1},${pick}\n`;
    });
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "knockout_picks.csv";
  a.click();
}

function submitToWhatsApp() {
  if (!validateAllPicks()) return;

  let message = "🏆 *My Knockout Picks*%0A%0A";

  const roundLabels = {
    round32: "LAST 32",
    round16: "LAST 16",
    qf: "QUARTERFINALS",
    sf: "SEMIFINALS",
    final: "FINAL"
  };

  Object.keys(picks).forEach(round => {
    message += `*${roundLabels[round]}*%0A`;
    picks[round].forEach((pick, i) => {
      if (round === "final") {
        message += `Winner: ${pick}%0A`;
      } else {
        message += `${i+1}. ${pick}%0A`;
      }
    });
    message += "%0A";
  });

  const yourNumber = "447XXXXXXXXX"; // Replace with your number
  const url = `https://wa.me/${yourNumber}?text=${message}`;
  window.open(url, "_blank");
}

createRound("round32", 16, "Last 32", false);
createRound("round16", 8, "Last 16", true);
createRound("qf", 4, "Quarterfinals", true);
createRound("sf", 2, "Semifinals", true);
createRound("final", 1, "Final", true);

