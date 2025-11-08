// liveScore.js
const teamId = 26; // LA Kings
let knownGoals = new Set(); // store already seen goal IDs

// Hardcoded team logos
const nhlTeams = [
  { "teamId": 1, "name": "New Jersey Devils", "logo": "https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/1.svg" },
  { "teamId": 2, "name": "New York Islanders", "logo": "https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/2.svg" },
  { "teamId": 3, "name": "New York Rangers", "logo": "https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/3.svg" },
  { "teamId": 26, "name": "Los Angeles Kings", "logo": "https://www-league.nhlstatic.com/images/logos/teams-current-primary-light/26.svg" },
  // add others if needed
];

function getLogoById(id) {
  const team = nhlTeams.find(t => t.teamId === id);
  return team ? team.logo : "";
}

function showGoal(playerName, playerNumber, teamId) {
  const logoUrl = getLogoById(teamId);
  const popup = document.createElement('div');
  popup.className = 'goal-popup';
  popup.innerHTML = `<img src="${logoUrl}" alt="Team Logo"><strong>GOAL!</strong> ${playerName} (#${playerNumber})`;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 12000);
}

// Fetch scoreboard + countdown
async function fetchLiveGame() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const scheduleResp = await fetch(`https://statsapi.web.nhl.com/api/v1/schedule?teamId=${teamId}&date=${today}`);
    const scheduleData = await scheduleResp.json();

    const scoreboard = document.getElementById("scoreboard");
    const countdown = document.getElementById("countdown");
    const topScorerEl = document.getElementById("top-scorer");

    if (!scheduleData.dates || scheduleData.dates.length === 0) {
      scoreboard.innerHTML = "No LA Kings game today.";
      // Countdown to next game
      fetchNextGameCountdown();
      return;
    }

    const game = scheduleData.dates[0].games[0];
    const gamePk = game.gamePk;

    // Live game data
    const liveResp = await fetch(`https://statsapi.web.nhl.com/api/v1/game/${gamePk}/feed/live`);
    const liveData = await liveResp.json();

    // Scoring plays
    const scoringPlays = liveData.liveData.plays.scoringPlays || [];
    scoringPlays.forEach(playIndex => {
      const play = liveData.liveData.plays.allPlays[playIndex];
      const goalId = play.about.eventId;
      if (!knownGoals.has(goalId)) {
        knownGoals.add(goalId);
        const player = play.players.find(p => p.playerType === "Scorer");
        if (player) showGoal(player.player.fullName, player.player.jerseyNumber, play.team.id);
      }
    });

    const away = game.teams.away;
    const home = game.teams.home;
    const state = game.status.detailedState;
    const linescore = game.linescore || {};

    scoreboard.innerHTML = `
      <div class="team">
        <img src="${getLogoById(away.team.id)}" alt="${away.team.name}">
        <div>${away.team.name}</div>
        <div><strong>${away.score}</strong></div>
      </div>
      <span class="vs">vs</span>
      <div class="team">
        <img src="${getLogoById(home.team.id)}" alt="${home.team.name}">
        <div>${home.team.name}</div>
        <div><strong>${home.score}</strong></div>
      </div>
      <div class="status">
        ${state}${state.includes("In Progress") ? ` – Period ${linescore.currentPeriod}` : ""}
      </div>
    `;

    // Top scorer
    const allPlays = liveData.liveData.plays.allPlays;
    const scorerMap = {};
    allPlays.forEach(play => {
      if (play.result.eventTypeId === "GOAL") {
        const scorer = play.players.find(p => p.playerType === "Scorer");
        if (scorer) {
          const id = scorer.player.id;
          scorerMap[id] = (scorerMap[id] || 0) + 1;
        }
      }
    });
    let topPlayer = null;
    let maxGoals = 0;
    for (const id in scorerMap) {
      if (scorerMap[id] > maxGoals) {
        topPlayer = allPlays.find(p => p.players.some(pl => pl.player.id == id)).players.find(pl => pl.player.id == id).player.fullName;
        maxGoals = scorerMap[id];
      }
    }
    topScorerEl.innerHTML = topPlayer ? `Top Scorer: ${topPlayer} (${maxGoals} goals)` : '';

  } catch (err) {
    console.error(err);
    document.getElementById("scoreboard").innerHTML = "Error loading live game.";
  }
}

// Countdown to next game
async function fetchNextGameCountdown() {
  const scheduleResp = await fetch(`https://statsapi.web.nhl.com/api/v1/schedule?teamId=${teamId}`);
  const scheduleData = await scheduleResp.json();
  if (!scheduleData.dates || scheduleData.dates.length === 0) return;

  const nextGameDate = new Date(scheduleData.dates[0].date);
  const countdownEl = document.getElementById("countdown");

  function updateCountdown() {
    const now = new Date();
    const diff = nextGameDate - now;
    if (diff <= 0) {
      countdownEl.innerHTML = "Game is live!";
      return;
    }
    const hrs = Math.floor(diff / 1000 / 60 / 60);
    const mins = Math.floor(diff / 1000 / 60) % 60;
    const secs = Math.floor(diff / 1000) % 60;
    countdownEl.innerHTML = `Next Game In: ${hrs}h ${mins}m ${secs}s`;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Start updates
fetchLiveGame();
setInterval(fetchLiveGame, 15000);
