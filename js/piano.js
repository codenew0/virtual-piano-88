const LOWEST_MIDI = 21;
const HIGHEST_MIDI = 108;
const WHITE_KEY_COUNT = 52;

const pianoContainer = document.getElementById("piano-container");
const visualizer = document.getElementById("visualizer");
const lastNote = document.getElementById("last-note");
const keyElements = new Map();

function buildPiano() {
  pianoContainer.replaceChildren();
  keyElements.clear();

  const whiteMidis = [];
  for (let midi = LOWEST_MIDI; midi <= HIGHEST_MIDI; midi += 1) {
    if (!isBlack(midi)) whiteMidis.push(midi);
  }

  whiteMidis.forEach((midi) => {
    const key = createKey(midi, "white");
    pianoContainer.appendChild(key);
    keyElements.set(midi, key);
  });

  for (let midi = LOWEST_MIDI; midi <= HIGHEST_MIDI; midi += 1) {
    if (!isBlack(midi)) continue;
    const key = createKey(midi, "black");
    const precedingWhites = whiteMidis.filter((whiteMidi) => whiteMidi < midi).length;
    key.style.left = `${(precedingWhites / WHITE_KEY_COUNT) * 100}%`;
    pianoContainer.appendChild(key);
    keyElements.set(midi, key);
  }
}

function createKey(midi, color) {
  const key = document.createElement("div");
  key.className = `key-${color}`;
  key.dataset.midi = String(midi);
  key.setAttribute("role", "button");
  key.setAttribute("aria-label", noteName(midi));

  const content = document.createElement("span");
  content.className = "key-content";

  const note = document.createElement("span");
  note.className = "note-label";
  note.textContent = noteName(midi);
  content.appendChild(note);

  key.appendChild(content);
  return key;
}

function bubbleStrengthForHold(heldMilliseconds) {
  const clampedDuration = Math.max(0, Math.min(3000, heldMilliseconds));
  return clampedDuration / 3000;
}

function releaseBubble(midi, heldMilliseconds) {
  const strength = bubbleStrengthForHold(heldMilliseconds);
  emitBubble(midi, false, strength, heldMilliseconds);

  const particleCount = 1 + Math.round(strength * 3);
  for (let index = 0; index < particleCount; index += 1) {
    window.setTimeout(() => {
      emitBubble(midi, true, strength, heldMilliseconds);
    }, 45 + index * 52);
  }
}

function emitBubble(
  midi,
  particle,
  holdStrength = 0,
  heldMilliseconds = 0,
) {
  const key = keyElements.get(midi);
  if (!key) return;

  const bubble = document.createElement("span");
  bubble.className = [
    "note-bubble",
    isBlack(midi) ? "black-note" : "",
    particle ? "particle" : "",
  ].filter(Boolean).join(" ");
  bubble.dataset.midi = String(midi);
  bubble.dataset.heldMs = String(Math.round(heldMilliseconds));
  bubble.dataset.holdStrength = holdStrength.toFixed(3);
  bubble.textContent = "";

  const keyWidth = key.getBoundingClientRect().width;
  const baseSize = Math.max(10, Math.min(34, keyWidth * (isBlack(midi) ? 1.45 : 1.08)));
  const size = particle
    ? baseSize * (.2 + holdStrength * .3 + Math.random() * .24)
    : baseSize * (.74 + holdStrength * 1.72 + Math.random() * .22);
  const bubbleHeight = size;
  const travel = visualizer.clientHeight + Math.max(size, bubbleHeight) * .7;
  const swayAmplitude = 14 + Math.random() * 20;
  const randomSway = () => (Math.random() * 2 - 1) * swayAmplitude;
  const colorPalettes = [
    "129, 226, 244",
    "88, 198, 232",
    "167, 239, 245",
    "72, 166, 221",
    "111, 211, 224",
  ];

  bubble.style.width = `${size}px`;
  bubble.style.height = `${bubbleHeight}px`;
  bubble.style.setProperty("--bubble-color", colorPalettes[Math.floor(Math.random() * colorPalettes.length)]);
  bubble.style.setProperty("--shine-x", `${22 + Math.random() * 25}%`);
  bubble.style.setProperty("--shine-y", `${16 + Math.random() * 25}%`);
  bubble.style.setProperty("--rotation-start", `${-18 + Math.random() * 36}deg`);
  bubble.style.setProperty("--rotation-mid", `${-14 + Math.random() * 28}deg`);
  bubble.style.setProperty("--rotation-late", `${-20 + Math.random() * 40}deg`);
  bubble.style.setProperty("--rotation-end", `${-24 + Math.random() * 48}deg`);
  bubble.style.setProperty("--travel", `${-travel}px`);
  bubble.style.setProperty("--travel-20", `${-travel * .2}px`);
  bubble.style.setProperty("--travel-40", `${-travel * .4}px`);
  bubble.style.setProperty("--travel-60", `${-travel * .6}px`);
  bubble.style.setProperty("--travel-80", `${-travel * .8}px`);
  bubble.style.setProperty("--sway-1", `${randomSway()}px`);
  bubble.style.setProperty("--sway-2", `${randomSway()}px`);
  bubble.style.setProperty("--sway-3", `${randomSway()}px`);
  bubble.style.setProperty("--sway-4", `${randomSway()}px`);
  bubble.style.setProperty("--sway-end", `${randomSway() * .72}px`);
  bubble.style.setProperty("--duration", `${travel / 155}s`);
  positionBubble(bubble, key);
  visualizer.appendChild(bubble);
  visualizer.classList.add("has-notes");

  bubble.addEventListener("animationend", () => {
    bubble.remove();
    if (!visualizer.querySelector(".note-bubble")) visualizer.classList.remove("has-notes");
  }, { once: true });
}

function positionBubble(bubble, key) {
  const keyRect = key.getBoundingClientRect();
  const pianoRect = pianoContainer.getBoundingClientRect();
  const center = keyRect.left + keyRect.width / 2 - pianoRect.left;
  bubble.style.left = `${(center / pianoRect.width) * 100}%`;
}

function repositionBubbles() {
  visualizer.querySelectorAll(".note-bubble").forEach((bubble) => {
    const midi = Number(bubble.dataset.midi);
    const key = keyElements.get(midi);
    if (key) positionBubble(bubble, key);
  });
}

window.addEventListener("resize", repositionBubbles, { passive: true });
