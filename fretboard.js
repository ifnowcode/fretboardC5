
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

const FB_CHORD_INTERVALS = {
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

const FB_CHORD_INTERVAL_ORDER = [
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

const FB_MODES = {
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

const FB_TUNINGS = {
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
const FB_NOTES_SHARP = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const FB_NOTES_FLAT  = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];

// Standard tuning (low to high)
//const FB_TUNING = ["E","A","D","G","B","E"];
//const FB_FRETS = 15;

// Utility: note at string/fret
function noteAt(openNote, fret) {
  const idx = FB_NOTES_SHARP.indexOf(openNote);
  if (idx === -1) return openNote;
  return FB_NOTES_SHARP[(idx + fret) % 12];
}

// Display mapping (useFlats decided by app)
function fbDisplayNote(note, useFlats) {
  const i = FB_NOTES_SHARP.indexOf(note);
  if (i === -1) return note;
  return useFlats ? FB_NOTES_FLAT[i] : FB_NOTES_SHARP[i];
}

// Fretboard class
class Fretboard {
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
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  
  tuning(setup) {
    this.strings = setup.slice();
  }
  
  reverse(reverse) {
    this.stringsReversed = reverse;
    // this is counting on consitent state unless I save a baseline strings
    // I.e. if somehow the check box and string state got backwards it stay that way until it messed up again. Note: String is initially forward.
    this.strings.reverse();
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

        const disp = fbDisplayNote(raw, useFlats);

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
        ctx.fillText(disp, x, y);
      }
    }

    ctx.globalAlpha = 1.0;
  }
  
  // Plot a fixed chord voicing like [null,3,2,0,1,0]
  plotVoicing = function(voicing, color, useFlats, meta = {}) {
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
      const disp = fbDisplayNote(raw, useFlats);

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
      ctx.fillText(disp, x, y);
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
