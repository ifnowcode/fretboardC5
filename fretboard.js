
// fretboard.js
function random(min, max) {
  return min + Math.random() * (max + 1 - min);
}

function randomIndex(length) {
  return Math.floor(Math.random() * length)
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  //console.log("Color:", color);
  return color;
}

function removeExtension(path) {
  return path.substring(0, path.lastIndexOf('.')) || path;
}

function getFile(path) {
  return path.replace(/^.*[\\\/]/, '');
}

function getFileName(path) {
  return removeExtension(getFile(path));
}

function getExtension(filename) {
  const sections = filename.split('/');
  //console.log("Sections:", sections);
  const parts = sections[sections.length-1].split('.');
  //console.log("Parts:", parts);
  return parts.length > 1 ? parts.pop() : '';
}

const CHORD_INTERVALS = {
  "":     [0,4,7],          // Major
  "m":       [0,3,7],          // Minor
  "5":       [0,7],            // Power chord
  "sus2":    [0,2,7],          // Suspended 2nd
  "sus4":    [0,5,7],          // Suspended 4th
  "sus2sus4":[0,2,5,7],        // Both suspensions

  // Major family
  "maj7":    [0,4,7,11],       // Major 7th
  "maj9":    [0,4,7,11,14],
  "maj11":   [0,4,7,11,14,17],
  "maj13":   [0,4,7,11,14,17,21],
  "add9":    [0,4,7,14],
  "add11":   [0,4,7,17],
  "add13":   [0,4,7,21],
  "6":       [0,4,7,9],
  "6/9":     [0,4,7,9,14],
  "maj7#5":  [0,4,8,11],
  "maj7b5":  [0,4,6,11],
  "maj9#11": [0,4,7,11,14,18],
  "maj13#11":[0,4,7,11,14,18,21],

  // Minor family
  "m6":      [0,3,7,9],
  "m7":      [0,3,7,10],
  "m9":      [0,3,7,10,14],
  "m11":     [0,3,7,10,14,17],
  "m13":     [0,3,7,10,14,17,21],
  "madd9":   [0,3,7,14],
  "m6add9":  [0,3,7,9,14],
  "mmaj7":   [0,3,7,11],
  "mmaj9":   [0,3,7,11,14],
  "m7b5":    [0,3,6,10],       // Half‑diminished
  "m7#5":    [0,3,8,10],

  // Dominant family
  "7":       [0,4,7,10],
  "9":       [0,4,7,10,14],
  "11":      [0,4,7,10,14,17],
  "13":      [0,4,7,10,14,17,21],
  "7sus4":   [0,5,7,10],
  "7b5":     [0,4,6,10],
  "7#5":     [0,4,8,10],
  "7b9":     [0,4,7,10,13],
  "7#9":     [0,4,7,10,15],
  "9b5":     [0,4,6,10,14],
  "9#5":     [0,4,8,10,14],
  "11b9":    [0,4,7,10,13,17],
  "13b9":    [0,4,7,10,13,17,21],
  "13#11":   [0,4,7,10,14,18,21],

  // Altered dominant clusters
  "7(b5,b9)": [0,4,6,10,13],
  "7(b5,#9)": [0,4,6,10,15],
  "7(#5,b9)": [0,4,8,10,13],
  "7(#5,#9)": [0,4,8,10,15],

  // Diminished / Augmented
  "dim":     [0,3,6],
  "dim7":    [0,3,6,9],          // [0,3,6,9 is B] - Notes: D, F, Ab, C
  "halfdim": [0,3,6,10],         // same as m7b5
  "aug":     [0,4,8],
  "aug7":    [0,4,8,10]
};

const CHORD_INTERVAL_ORDER = [
  // popular quick list
  "", "m", "5", "7", "m7", "maj7", "dim", "aug", "sus2", "sus4", "sus2sus4",

  // Major family
  "add9",
  "add11",
  "add13",
  "6",
  "6/9",
  "maj7",
  "maj9",
  "maj11",
  "maj13",
  "maj7#5",
  "maj7b5",
  "maj9#11",
  "maj13#11",

  // Minor family
  "m",
  "madd9",
  "m6",
  "m6add9",
  "m7",
  "m9",
  "m11",
  "m13",
  "mmaj7",
  "mmaj9",
  "m7b5",   // half‑diminished
  "m7#5",

  // Suspended
  "sus2",
  "sus4",
  "sus2sus4",
  "7sus4",

  // Dominant family
  "7",
  "9",
  "11",
  "13",
  "7b5",
  "7#5",
  "7b9",
  "7#9",
  "9b5",
  "9#5",
  "11b9",
  "13b9",
  "13#11",

  // Altered dominant clusters
  "7(b5,b9)",
  "7(b5,#9)",
  "7(#5,b9)",
  "7(#5,#9)",

  // Diminished / Augmented
  "dim",
  "dim7",
  "halfdim",  // or m7b5
  "aug",
  "aug7",

  // Power chord
  "5"
];

const MODES = {
  "Ionian (Major)"    : [0,2,4,5,7,9,11],
  "Dorian"            : [0,2,3,5,7,9,10],
  "Phrygian"          : [0,1,3,5,7,8,10],
  "Lydian"            : [0,2,4,6,7,9,11],
  "Mixolydian"        : [0,2,4,5,7,9,10],
  "Aeolian (Minor)"   : [0,2,3,5,7,8,10],
  "Locrian"           : [0,1,3,5,6,8,10],
  "Major Pentatonic"  : [0,2,4,7,9],
  "Minor Pentatonic"  : [0,3,5,7,10],
  "Harmonic Minor"    : [0,2,3,5,7,8,10],
  "Minor Blues"       : [0,3,5,6,7,10],
  "Blue Minor"        : [0,2,3,5,6,7,8,10],
  "Petonian"          : [0,2,4,5,6,7,9,10,11],
  "Chromatic"         : [0,1,2,3,4,5,6,7,8,9,10,11],
};

const TUNINGS = {
  "Guitar Standard": ["E","A","D","G","B","E"],
  "Guitar Drop D": ["D","A","D","G","B","E"],
  "Guitar Open G": ["D","G","D","G","B","D"],
  "Bass 4 String": ["E","A","D","G"],
  "Bass 5 String": ["B","E","A","D","G"],
  "Violin Standard": ["G","D","A","E"],
  "Cello Standard": ["C","G","D","A"],
  "Banjo Standard": ["G","D","G","B","D"],
  "Mandolin Standard": ["G","D","A","E"],
  "Ukulele Standard": ["G","C","E","A"],
  "Three Notes": ["G","A","D"],
  "Two Notes": ["G","A"],
  "Tub Bass": ["G"],
};

// Internal canonical notes
const NOTES_SHARP = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const NOTES_FLAT  = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];

// Standard tuning (low to high)
//const TUNING = ["E","A","D","G","B","E"];
//const FRETS = 15;

// Circle of Fifths for scale dropdown
const CIRCLE_OF_FIFTHS = [
  "C","G","D","A","E","B","F#","Gb","Db","Ab","Eb","Bb","F"
];

// Keys typically spelled with sharps vs flats
const SHARP_KEYS = new Set(["C","G","D","A","E","B","F#","C#"]);
const FLAT_KEYS  = new Set(["F","Bb","Eb","Ab","Db","Gb","Cb"]);

KEY_TRIADS = [
  ['C','Dm','Em','F','G','Am','Bdim  (x2343x)'],
  ['G','Am','Bm','C','D','Em','F#dim (xx421x)'],
  ['D','Em','F#m','G','A','Bm','C#dim (xxxo2o)'],
  ['A','Bm','C#m','D','E','F#m','G#dim (xxx13o)'],
  ['E','F#m','G#m','A','B','C#m','D#dim (xxx242)'],
  ['B','C#m','D#m','E','F#','G#m','A#dim (x1232x)'],
  ['F#','G#m','A#m','B','C#','D#m','E#dim (1231xx)'],
  ['Gb','Abm','Bbm','Cb','Db','Ebm','Fdim  (xx31ox)'],
  ['Db','Ebm','Fm','Gb','Ab','Bbm','Cdim  (x3454x)'],
  ['Ab','Bbm','Cm','Db','Eb','Fm','Gdim  (xx532x)'],
  ['Eb','Fm','Gm','Ab','Bb','Cm','Ddim  (xxo1x1)'],
  ['Bb','Cm','Dm','Eb','F','Gm','Adim  (xo121x)'],
  ['F','Gm','Am','Bb','C','Dm','Edim  (o12oxx)']
];

const voicings_library = {
  "C":  [ [null, 3, 2, 0, 1, 0], [null, 3, 5, 5, 5, 3] ],
  "Dm": [ [null, null, 0, 2, 3, 1], [null, 5, 7, 7, 6, 5] ],
};

// Auto sharps/flats from scale root
function autoUseFlats(key) {
  if (FLAT_KEYS.has(key)) return true;
  if (SHARP_KEYS.has(key)) return false;
  if (key.includes("b")) return true;
  if (key.includes("#")) return false;
  return false;
}

// Build notes from root + intervals (internal sharp names)
function getNotes(root, intervals) {
  const rootIndex = NOTES_SHARP.indexOf(root);
  if (rootIndex === -1) return [];
  return intervals.map(i => NOTES_SHARP[(rootIndex + i) % 12]);
}

// Utility: note at string/fret
function noteAt(openNote, fret) {
  const idx = NOTES_SHARP.indexOf(openNote);
  if (idx === -1) return openNote;
  return NOTES_SHARP[(idx + fret) % 12];
}

// Display mapping (useFlats decided by app)
function DisplayNote(note, useFlats) {
  const i = NOTES_SHARP.indexOf(note);
  if (i === -1) return note;
  return useFlats ? NOTES_FLAT[i] : NOTES_SHARP[i];
}

// Fretboard class
class Fretboard_00 {
  constructor(canvas, frets=13, strings=["E","A","D","G","B","E"]) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
    this.strings = strings.slice(); // low→high
    this.frets = frets;
    this.showScale = true;
    this.showChord = true;
    this.stringsReversed = false;
    this.jazzNotation = false; // toggle this from UI later
  }
  
  reverseStrings(reverse) {
    this.stringsReversed = reverse;
    // this is counting on consistent state unless I save a baseline strings
    // I.e. if somehow the check box and string state got backwards it stay that way until it messed up again. Note: String is initially forward.
    this.strings.reverse();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  
  setTuning(setup) {
    this.strings = setup.slice();
  }
  
  setNotation(jazz) {
    this.jazzNotation = jazz;
  }
  
  hideScale(hide) {
    this.showScale = !hide;
  }
  
  hideChord(hide) {
    this.showChord = !hide;
  }

  drawBoard(reverse, meta = {}) {
    const ctx = this.ctx;
    const h = this.height / (this.strings.length + 1);
    
    // Meta defaults
    const {
      fretover = false,
    } = meta;

    ctx.strokeStyle = "#666";
    ctx.lineWidth = 3;
    
    // Frets (vertical)
    for (let f = 0; f <= this.frets; f++) {
      const x = 50 + (f * 60);
      ctx.beginPath();
      if (fretover) {
        ctx.moveTo(x, h * 0.5);
        ctx.lineTo(x, h * (this.strings.length + 0.5));
      } else {
        ctx.moveTo(x, h);
        ctx.lineTo(x, h * this.strings.length);
      }
      ctx.stroke();
      
      if (this.strings.length >= 4) {
        // Fretboard position markers (3, 5, 7, 12)
        const markerFrets = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
        if (markerFrets.includes(f)) {
          const dotX = x + 35; // center between frets
          const midY = (h + h * this.strings.length) / 2;

          ctx.fillStyle = "#000"; // black, unobtrusive

          if (f === 12 || f === 24) {
            // double dot at 12th fret
            ctx.beginPath();
            ctx.arc(dotX, midY - h * 1, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(dotX, midY + h * 1, 12, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // single dot
            ctx.beginPath();
            ctx.arc(dotX, midY, 12, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
    
    // Nut
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 6;
    ctx.beginPath();
    if (fretover) {
      ctx.moveTo(50 + 60, h * 0.5);
      ctx.lineTo(50 + 60, h * (this.strings.length + 0.5));
    } else {
      ctx.moveTo(50 + 60, h);
      ctx.lineTo(50 + 60, h * this.strings.length);
    }
    ctx.stroke();
        
    // Strings (horizontal)
    let lineWidth = reverse ? 1 : 6;
    for (let s = 0; s < this.strings.length; s++) {
      const y = h * (s + 1);
      
      if (lineWidth > 2 ) {
        ctx.strokeStyle="#a70";
      } else {
        ctx.strokeStyle="#555";
      }
      //console.log("Line width:", ctx.lineWidth, lineWidth);
      ctx.lineWidth = reverse ? lineWidth++ : lineWidth--;
      
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(this.width - 20, y);
      ctx.stroke();
    }
  }

  // Plot a set of notes (scale or chord)
  plotNotes(noteSet, color, useFlats, meta = {}) {
    const ctx = this.ctx;
    const h = this.height / (this.strings.length + 1);

    // Meta defaults
    const {
      alpha = 0.7,
      radius = 13,
      border = false,
      highlightRoot = false,
      rootNote = null,
      rootColor = "#fff",
      rootRadius = 22,
      rootLineWidth = 3
    } = meta;

    ctx.globalAlpha = alpha;

    for (let s = 0; s < this.strings.length; s++) {
      const open = this.strings[s];

      for (let f = 0; f <= this.frets; f++) {
        const raw = noteAt(open, f);
        if (!noteSet.includes(raw)) continue;

        const disp = DisplayNote(raw, useFlats);

        const x = 50 + f * 60 + 30;
        const y = h * (s + 1);

        // Base filled circle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Optional border ring
        if (border) {
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Root highlighting
        if (highlightRoot && raw === rootNote) {
          ctx.strokeStyle = rootColor;
          ctx.lineWidth = rootLineWidth;
          ctx.beginPath();
          ctx.arc(x, y, rootRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = "#000";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const label = this.jazzNotation
          ? jazzDegree(rootNote, raw)
          : disp;

        ctx.fillText(label, x, y);
      }
    }

    ctx.globalAlpha = 1.0;
  }
  
  // Plot a fixed chord voicing like [null,3,2,0,1,0]
  plotVoicing(voicing, color, useFlats, meta = {}) {
    if (this.stringsReversed) voicing.reverse();
    const ctx = this.ctx;
    const h = this.height / (this.strings.length + 1);

    const {
      highlightRoot = false,
      rootNote = null,
      rootColor = "#fff",
      rootRadius = 22,
      alpha = 0.95,
      radius = 14
    } = meta;

    ctx.globalAlpha = alpha;

    for (let s = 0; s < this.strings.length; s++) {
      const fret = voicing[s];
      if (fret == null) continue;

      const raw = noteAt(this.strings[s], fret);
      const disp = DisplayNote(raw, useFlats);

      const x = 50 + fret * 60 + 30;
      const y = h * (s + 1);

      // Base circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Root highlight
      if (highlightRoot && raw === rootNote) {
        ctx.strokeStyle = rootColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, rootRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = "#000";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = this.jazzNotation
        ? jazzDegree(rootNote, raw)
        : disp;

      ctx.fillText(label, x, y);
    }

    ctx.globalAlpha = 1.0;
  };

  draw(scaleNotes, chordNotes, useFlats) { // draw/render example
    this.clear();
    this.drawBoard(this.reverseStrings);

    // Scale first (lighter)
    if (scaleNotes && scaleNotes.length) {
      if (this.showScale) this.plotNotes(scaleNotes, "#3af", useFlats, 0.6, 11);
    }

    // Chord on top (stronger)
    if (chordNotes && chordNotes.length) {
      if (this.showChord) this.plotNotes(chordNotes, "#f60", useFlats, 0.7, 14);
    }
  }
}

// Fretboard class
class Fretboard {
  constructor(canvas, frets = 13, strings = ["E","A","D","G","B","E"]) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;

    // Canonical tuning: always low → high, never mutated
    this.baseStrings = strings.slice();

    this.frets = frets;
    this.showScale = true;
    this.showChord = true;
    this.stringsReversed = false;
    this.jazzNotation = false;
  }

  // Visual flip only; does not mutate tuning
  reverseStrings(reverse) {
    this.stringsReversed = reverse;
  }

  // Change tuning (still stored low → high)
  setTuning(setup) {
    this.baseStrings = setup.slice();
  }

  setNotation(jazz) {
    this.jazzNotation = jazz;
  }

  hideScale(hide) {
    this.showScale = !hide;
  }

  hideChord(hide) {
    this.showChord = !hide;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  // Map logical string index (0 = low) to visual index
  mapStringIndex(index) {
    if (!this.stringsReversed) return index;
    return this.baseStrings.length - 1 - index;
  }

  // Get the open note for a logical string index
  getStringAt(index) {
    return this.baseStrings[index];
  }

  drawBoard(reverseVisual, meta = {}) {
    //console.log("reverseVisual", reverseVisual);
    const ctx = this.ctx;
    const stringCount = this.baseStrings.length;
    const h = this.height / (stringCount + 1);

    const { fretover = false } = meta;

    ctx.strokeStyle = "#666";
    ctx.lineWidth = 3;

    // Frets (vertical)
    for (let f = 0; f <= this.frets; f++) {
      const x = 50 + f * 60;
      ctx.beginPath();
      if (fretover) {
        ctx.moveTo(x, h * 0.5);
        ctx.lineTo(x, h * (stringCount + 0.5));
      } else {
        ctx.moveTo(x, h);
        ctx.lineTo(x, h * stringCount);
      }
      ctx.stroke();

      if (stringCount >= 4) {
        const markerFrets = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
        if (markerFrets.includes(f)) {
          const dotX = x + 35;
          const midY = (h + h * stringCount) / 2;

          ctx.fillStyle = "#000";

          if (f === 12 || f === 24) {
            ctx.beginPath();
            ctx.arc(dotX, midY - h * 1, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(dotX, midY + h * 1, 12, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(dotX, midY, 12, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // Nut
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 6;
    ctx.beginPath();
    if (fretover) {
      ctx.moveTo(50 + 60, h * 0.5);
      ctx.lineTo(50 + 60, h * (stringCount + 0.5));
    } else {
      ctx.moveTo(50 + 60, h);
      ctx.lineTo(50 + 60, h * stringCount);
    }
    ctx.stroke();

    // Strings (horizontal, visual order via mapStringIndex)
    /*
    let lineWidth = this.stringsReversed ? 1 : 6;
    console.log("stringsReversed", this.stringsReversed)
    for (let s = 0; s < stringCount; s++) {
      const visualIndex = this.mapStringIndex(s);
      const y = h * (visualIndex + 1);

      ctx.strokeStyle = lineWidth > 2 ? "#a70" : "#555";
      ctx.lineWidth = lineWidth;
      console.log("lineWidth", lineWidth, visualIndex, ctx.strokeStyle)

      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(this.width - 20, y);
      ctx.stroke();

      // thickness progression
      if (this.stringsReversed) {
        lineWidth++;   // thin → thick as you go down
      } else {
        lineWidth--;   // thick → thin as you go up
      }
    }
    */
    
    // Strings (horizontal)
    let lineWidth = this.stringsReversed ? 1 : 6;
    for (let s = 0; s < stringCount; s++) {
      const y = h * (s + 1);
      
      if (lineWidth > 2 ) {
        ctx.strokeStyle="#a70";
      } else {
        ctx.strokeStyle="#555";
      }
      //console.log("Line width:", ctx.lineWidth, lineWidth);
      ctx.lineWidth = this.stringsReversed ? lineWidth++ : lineWidth--;
      
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(this.width - 20, y);
      ctx.stroke();
    }


  }

  // Plot a set of notes (scale or chord)
  plotNotes(noteSet, color, useFlats, meta = {}) {
    const ctx = this.ctx;
    const stringCount = this.baseStrings.length;
    const h = this.height / (stringCount + 1);

    const {
      alpha = 0.7,
      radius = 13,
      border = false,
      highlightRoot = false,
      rootNote = null,
      rootColor = "#fff",
      rootRadius = 22,
      rootLineWidth = 3
    } = meta;

    ctx.globalAlpha = alpha;

    for (let s = 0; s < stringCount; s++) {
      const open = this.getStringAt(s);
      const visualIndex = this.mapStringIndex(s);

      for (let f = 0; f <= this.frets; f++) {
        const raw = noteAt(open, f);
        if (!noteSet.includes(raw)) continue;

        const disp = DisplayNote(raw, useFlats);

        const x = 50 + f * 60 + 30;
        const y = h * (visualIndex + 1);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        if (border) {
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (highlightRoot && raw === rootNote) {
          ctx.strokeStyle = rootColor;
          ctx.lineWidth = rootLineWidth;
          ctx.beginPath();
          ctx.arc(x, y, rootRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = "#000";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const label = this.jazzNotation
          ? jazzDegree(rootNote, raw)
          : disp;

        ctx.fillText(label, x, y);
      }
    }

    ctx.globalAlpha = 1.0;
  }

  // Plot a fixed chord voicing like [null,3,2,0,1,0] (always low→high)
  plotVoicing(voicing, color, useFlats, meta = {}) {
    const ctx = this.ctx;
    const stringCount = this.baseStrings.length;
    const h = this.height / (stringCount + 1);

    const {
      highlightRoot = false,
      rootNote = null,
      rootColor = "#fff",
      rootRadius = 22,
      alpha = 0.95,
      radius = 14
    } = meta;

    ctx.globalAlpha = alpha;

    for (let s = 0; s < stringCount; s++) {
      const fret = voicing[s];
      if (fret == null) continue;

      const open = this.getStringAt(s);
      const raw = noteAt(open, fret);
      const disp = DisplayNote(raw, useFlats);

      const visualIndex = this.mapStringIndex(s);
      const x = 50 + fret * 60 + 30;
      const y = h * (visualIndex + 1);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (highlightRoot && raw === rootNote) {
        ctx.strokeStyle = rootColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, rootRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = "#000";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = this.jazzNotation
        ? jazzDegree(rootNote, raw)
        : disp;

      ctx.fillText(label, x, y);
    }

    ctx.globalAlpha = 1.0;
  }

  // Example draw wrapper (you’re mostly using update() instead)
  draw(scaleNotes, chordNotes, useFlats) {
    this.clear();
    this.drawBoard(this.stringsReversed);

    if (scaleNotes && scaleNotes.length && this.showScale) {
      this.plotNotes(scaleNotes, "#3af", useFlats, { alpha: 0.6, radius: 11 });
    }

    if (chordNotes && chordNotes.length && this.showChord) {
      this.plotNotes(chordNotes, "#f60", useFlats, { alpha: 0.7, radius: 14 });
    }
  }
}

function jazzDegree(root, note) {
  const rootIndex = NOTES_SHARP.indexOf(root);
  const noteIndex = NOTES_SHARP.indexOf(note);
  if (rootIndex === -1 || noteIndex === -1) return note;

  const interval = (noteIndex - rootIndex + 12) % 12;

  switch (interval) {
    case 0:  return "1";
    case 1:  return "b2";
    case 2:  return "2";
    case 3:  return "b3";
    case 4:  return "3";
    case 5:  return "4";
    case 6:  return "#4";
    case 7:  return "5";
    case 8:  return "b6";
    case 9:  return "6";
    case 10: return "b7";
    case 11: return "7";
  }
}

