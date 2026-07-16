const activeInputs = new Map();
const noteSources = new Map();
const noteStartedAt = new Map();

async function beginInput(token, midi) {
  if (activeInputs.has(token)) return;
  const key = keyElements.get(midi);
  if (!key) return;

  activeInputs.set(token, midi);
  if (!noteSources.has(midi)) noteSources.set(midi, new Set());
  const sources = noteSources.get(midi);
  sources.add(token);

  if (sources.size === 1) {
    noteStartedAt.set(midi, performance.now());
    key.classList.add("active");
    lastNote.textContent = `${noteName(midi)} · MIDI ${midi}`;
    await window.startNote(midi);
  }
}

function endInput(token) {
  const midi = activeInputs.get(token);
  if (midi === undefined) return;
  activeInputs.delete(token);

  const sources = noteSources.get(midi);
  sources?.delete(token);
  if (sources?.size) return;

  noteSources.delete(midi);
  keyElements.get(midi)?.classList.remove("active");
  const startedAt = noteStartedAt.get(midi) ?? performance.now();
  noteStartedAt.delete(midi);
  releaseBubble(midi, performance.now() - startedAt);
  window.stopNote(midi);
}

pianoContainer.addEventListener("pointerdown", (event) => {
  const key = event.target.closest("[data-midi]");
  if (!key) return;
  event.preventDefault();
  const token = `pointer:${event.pointerId}`;
  key.setPointerCapture(event.pointerId);
  beginInput(token, Number(key.dataset.midi));
});

function releasePointer(event) {
  endInput(`pointer:${event.pointerId}`);
}

pianoContainer.addEventListener("pointerup", releasePointer);
pianoContainer.addEventListener("pointercancel", releasePointer);
pianoContainer.addEventListener("lostpointercapture", releasePointer);

document.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  const midi = midiForKeyboardEvent(event);
  if (midi === null) return;
  event.preventDefault();
  beginInput(`keyboard:${event.code}`, midi);
});

document.addEventListener("keyup", (event) => {
  endInput(`keyboard:${event.code}`);
});

function releaseEverything() {
  [...activeInputs.keys()].forEach(endInput);
  window.stopAllNotes?.();
}

window.addEventListener("blur", releaseEverything);
window.addEventListener("pagehide", releaseEverything);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) releaseEverything();
});
