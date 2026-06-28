const picks = {
  round32: Array(16).fill(""),
  round16: Array(8).fill(""),
  qf: Array(4).fill(""),
  sf: Array(2).fill(""),
  final: Array(1).fill("")
};

// CORRECT BRACKET ORDER + FLAGS
const fixtures32 = [
  ["🇩🇪 Germany", "🇵🇾 Paraguay"],
  ["🇫🇷 France", "🇸🇪 Sweden"],
  ["🇿🇦 South Africa", "🇨🇦 Canada"],
  ["🇳🇱 Netherlands", "🇲🇦 Morocco"],
  ["🇵🇹 Portugal", "🇭🇷 Croatia"],
  ["🇪🇸 Spain", "🇦🇹 Austria"],
  ["🇺🇸 USA", "🇧🇦 Bosnia and Herzegovina"],
  ["🇧🇪 Belgium", "🇸🇳 Senegal"],
  ["🇧🇷 Brazil", "🇯🇵 Japan"],
  ["🇨🇮 Ivory Coast", "🇳🇴 Norway"],
  ["🇲🇽 Mexico", "🇪🇨 Ecuador"],
  ["🏴 England", "🇨🇩 DR Congo"],
  ["🇦🇷 Argentina", "🇨🇻 Cape Verde"],
  ["🇦🇺 Australia", "🇪🇬 Egypt"],
  ["🇨🇭 Switzerland", "🇩🇿 Algeria"],
  ["🇨🇴 Colombia", "🇬🇭 Ghana"]
];

function createRound(id, fixtures, label, disabled = false) {
  const container = document.getElementById(id);
  container.innerHTML = `<h2>${label}</h2>`;

  fixtures.forEach((pair, i) => {
    container.innerHTML += `
      <div class="match">
        <select ${disabled ? "disabled" : ""} onchange="updatePick('${id}', ${i}, this.value)">
          <option value="">Select winner</option>
          <option>${pair[0]}</option>
          <option>${pair[1]}</option>
        </select>
      </div>`;
  });
}

function unlockRound(roundId) {
  const selects = document.getElementById(roundId).getElementsByTagName("select");
  for (let s of selects) s.disabled = false;
}

function autoScrollTo(roundId) {
  document.getElementById(roundId).scrollIntoView({ behavior: "smooth" });
}

function updatePick(round, index, value) {
  picks[round][index] = value;

  if (round === "round32") {
    updateNext("round32", "round16");
    if (!picks.round32.includes("")) {
      unlockRound("round16");
      autoScrollTo("round16");
    }
  }

  if (round === "round16") {
    updateNext("round16", "qf");
    if (!picks.round16.includes("")) {
      unlockRound("qf");
      autoScrollTo("qf");
    }
  }

  if (round === "qf") {
    updateNext("qf", "sf");
    if (!picks.qf.includes("")) {
      unlockRound("sf");
      autoScrollTo("sf");
    }
  }

  if (round === "sf") {
    updateNext("sf", "final");
    if (!picks.sf.includes("")) {
      unlockRound("final");
      autoScrollTo("final");
    }
  }
}

function updateNext(current, next) {
  const winners = picks[current].filter(x => x !== "");
  const nextRound = document.getElementById(next).getElementsByTagName("select");

  for (let i = 0; i < nextRound.length; i++) {
    nextRound[i].innerHTML = `
      <option value="">Select winner</option>
      <option>${winners[i * 2] || ""}</option>
      <option>${winners[i * 2 + 1] || ""}</option>
    `;
  }
}

function validateAllPicks() {
  if (!document.getElementById("playerName").value.trim()) {
    alert("Please enter your name.");
    return false;
  }

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

  let csv = "Name,Round,Match,Pick\n";
  const name = document.getElementById("playerName").value;

  Object.keys(picks).forEach(round => {
    picks[round].forEach((pick, i) => {
      csv += `${name},${round},${i + 1},${pick}\n`;
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

  const name = document.getElementById("playerName").value;
  let message = `🏆 *Knockout Picks*%0A👤 Player: ${name}%0A%0A`;

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
        message += `${i + 1}. ${pick}%0A`;
      }
    });
    message += "%0A";
  });

  const yourNumber = "447728845515";
  const url = `https://wa.me/${yourNumber}?text=${message}`;
  window.open(url, "_blank");
}

// BUILD ROUNDS
createRound("round32", fixtures32, "Last 32", false);
createRound("round16", Array(8).fill(["", ""]), "Last 16", true);
createRound("qf", Array(4).fill(["", ""]), "Quarterfinals", true);
createRound("sf", Array(2).fill(["", ""]), "Semifinals", true);
createRound("final", Array(1).fill(["", ""]), "Final", true);
