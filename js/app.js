// The instrument and range are deliberately fixed: acoustic grand piano, A0-C8.
window.getCurrentInstrument = () => "piano";
buildPiano();

window.setTimeout(() => {
  if (lastNote.textContent === "音源を準備しています…") {
    lastNote.textContent = "Grand Piano · A0–C8";
  }
}, 2500);
