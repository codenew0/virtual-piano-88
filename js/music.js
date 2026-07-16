// Existing Piano project shortcut layout, extended across the fixed A0-C8 range.
const KEY_MAP = {
  48: "1", 49: "2", 50: "3", 51: "4", 52: "5", 53: "6", 54: "7",
  55: "8", 56: "9", 57: "0", 58: "q", 59: "w",
  60: "e", 61: "r", 62: "t", 63: "y", 64: "u", 65: "i", 66: "o",
  67: "p", 68: "a", 69: "s", 70: "d", 71: "f",
  72: "g", 73: "h", 74: "j", 75: "k", 76: "l", 77: "z", 78: "x",
  79: "c", 80: "v", 81: "b", 82: "n", 83: "m", 84: ",",
};

const CHAR_MAP = Object.fromEntries(
  Object.entries(KEY_MAP).map(([midi, character]) => [character, Number(midi)]),
);

const FUNCTION_CODES = Array.from({ length: 12 }, (_, index) => `F${index + 13}`);
const LOW_CODES = [
  ...FUNCTION_CODES,
  "Numpad0", "Numpad1", "Numpad2", "Numpad3", "Numpad4",
  "Numpad5", "Numpad6", "Numpad7", "Numpad8", "Numpad9",
  "NumpadDecimal", "NumpadAdd", "NumpadSubtract", "NumpadMultiply", "Insert",
];
const HIGH_CODES = [
  ...FUNCTION_CODES,
  "Numpad0", "Numpad1", "Numpad2", "Numpad3", "Numpad4", "Numpad5",
  "Numpad6", "Numpad7", "Numpad8", "Numpad9", "NumpadDecimal", "NumpadEnter",
];

const LOW_CODE_MAP = {};
const HIGH_CODE_MAP = {};
const LOW_LABEL_MAP = {};
const HIGH_LABEL_MAP = {};

function compactKeyName(code) {
  return code
    .replace("NumpadDecimal", "Num.")
    .replace("NumpadAdd", "Num+")
    .replace("NumpadSubtract", "Num-")
    .replace("NumpadMultiply", "Num×")
    .replace("NumpadEnter", "Num↵")
    .replace("Numpad", "Num");
}

LOW_CODES.forEach((code, index) => {
  const midi = 21 + index;
  LOW_CODE_MAP[code] = midi;
  LOW_LABEL_MAP[midi] = compactKeyName(code);
});

HIGH_CODES.forEach((code, index) => {
  const midi = 85 + index;
  HIGH_CODE_MAP[code] = midi;
  HIGH_LABEL_MAP[midi] = `Ctrl+${compactKeyName(code)}`;
});

function midiForKeyboardEvent(event) {
  if (event.altKey || event.metaKey || event.shiftKey) return null;
  if (event.ctrlKey) return HIGH_CODE_MAP[event.code] ?? null;
  return LOW_CODE_MAP[event.code] ?? CHAR_MAP[event.key.toLowerCase()] ?? null;
}

function shortcutLabel(midi) {
  return KEY_MAP[midi]?.toUpperCase() || LOW_LABEL_MAP[midi] || HIGH_LABEL_MAP[midi] || "";
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function noteName(midi) {
  return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

function isBlack(midi) {
  return [1, 3, 6, 8, 10].includes(midi % 12);
}
