const iceRink = document.getElementById("ice-rink");

// Add all LA Kings players
const players = [
  "Adrian Kempe #9.png",
  "Quinton Byfield #55.png",
  "Drew Doughty #8.png",
  "Alex Iafallo #12.png",
  "Anze Kopitar #11.png",
  "Trevor Moore #26.png",
  "Kevin Fiala #22.png",
  "Carl Grundstrom #13.png",
  "Blake Lizotte #15.png",
  "Sean Durzi #4.png",
  "Matt Roy #27.png",
  "Jordan Spence #6.png",
  "Cal Petersen #35.png",
  "Jonathan Quick #32.png"
];

// Randomize vertical position and speed
players.forEach((file, i) => {
  const img = document.createElement("img");
  img.src = `players/${file}`; // folder "players" should contain all PNGs
  img.className = "skater";
  img.style.bottom = `${10 + Math.random() * 50}px`;
  img.style.animationDuration = `${5 + Math.random() * 8}s`;
  img.style.animationDelay = `${Math.random() * 5}s`;
  iceRink.appendChild(img);
});
