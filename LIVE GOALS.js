const teamId = 26; // LA Kings

async function fetchScore() {
  const today = new Date().toISOString().split("T")[0];
  const url = `https://statsapi.web.nhl.com/api/v1/schedule?teamId=${teamId}&date=${today}&expand=schedule.linescore`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.dates || data.dates.length === 0) {
    document.getElementById("scoreboard").innerHTML = "No LA Kings game today.";
    return;
  }

  const game = data.dates[0].games[0];
  const away = game.teams.away;
  const home = game.teams.home;
  const state = game.status.detailedState;
  const linescore = game.linescore || {};

  document.getElementById("scoreboard").innerHTML = `
    <div class="team">
      <img src="https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${away.team.id}.svg" alt="${away.team.name}">
      <div>${away.team.name}</div>
      <div><strong>${away.score}</strong></div>
    </div>
    <span class="vs">vs</span>
    <div class="team">
      <img src="https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${home.team.id}.svg" alt="${home.team.name}">
      <div>${home.team.name}</div>
      <div><strong>${home.score}</strong></div>
    </div>
    <div class="status">
      ${state}${state.includes("In Progress") ? ` – Period ${linescore.currentPeriod}` : ""}
    </div>
  `;
}

fetchScore();
setInterval(fetchScore, 30000); // refresh every 30s


// Example function to show a goal popup
function showGoal(playerName, playerNumber, teamId) {
  const logoUrl = `https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${teamId}.svg`;

  const popup = document.createElement('div');
  popup.className = 'goal-popup';
  popup.innerHTML = `
    <img src="${logoUrl}" alt="Team Logo">
    <strong>GOAL!</strong> ${playerName} (#${playerNumber})
  `;

  document.body.appendChild(popup);

  // Remove popup after animation
  setTimeout(() => popup.remove(), 12000); // 12s duration
}