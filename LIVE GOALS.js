const teamId = 26; // LA Kings
let knownGoals = new Set(); // store already seen goal IDs
const scoreboard = document.getElementById("scoreboard");

async function fetchLiveGame() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const scheduleUrl = `https://statsapi.web.nhl.com/api/v1/schedule?teamId=${teamId}&date=${today}`;
    const scheduleResp = await fetch(scheduleUrl);
    const scheduleData = await scheduleResp.json();

    if (!scheduleData.dates || scheduleData.dates.length === 0) return;

    const game = scheduleData.dates[0].games[0];
    const gamePk = game.gamePk;

    const liveUrl = `https://statsapi.web.nhl.com/api/v1/game/${gamePk}/feed/live`;
    const liveResp = await fetch(liveUrl);
    const liveData = await liveResp.json();

    const scoringPlays = liveData.liveData.plays.scoringPlays || [];
    scoringPlays.forEach(playIndex => {
      const play = liveData.liveData.plays.allPlays[playIndex];
      const goalId = play.about.eventId;

      if (!knownGoals.has(goalId)) {
        knownGoals.add(goalId);
        const player = play.players.find(p => p.playerType === "Scorer");
        if (player) {
          showGoal(player.player.fullName, player.player.jerseyNumber, play.team.id);
        }
      }
    });

    const away = game.teams.away;
    const home = game.teams.home;
    const state = game.status.detailedState;
    const linescore = game.linescore || {};

    scoreboard.innerHTML = `
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
  } catch (err) {
    console.error("Error fetching live game:", err);
    scoreboard.innerHTML = "<div class='status'>Error loading score.</div>";
  }
}

// Goal popup
function showGoal(playerName, playerNumber, teamId) {
  const logoUrl = `https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${teamId}.svg`;
  const popup = document.createElement('div');
  popup.className = 'goal-popup';
  popup.innerHTML = `<img src="${logoUrl}" alt="Team Logo"><strong>GOAL!</strong> ${playerName} (#${playerNumber})`;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 12000);
}

// Run immediately and every 15 seconds
fetchLiveGame();
setInterval(fetchLiveGame, 15000);
