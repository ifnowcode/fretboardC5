// chordDictionary.js

// Standard tuning
//const STANDARD_TUNING = ["E","A","D","G","B","E"];

// Normalize flats to sharps
function normalizeToSharp(note) {
  const i = NOTES_FLAT.indexOf(note);
  return i !== -1 ? NOTES_SHARP[i] : note;
}

// Transpose a voicing template from C to any root
function transposeVoicing(frets, semitones) {
  // First apply the raw transposition (no wrapping yet)
  const shifted = frets.map(f => {
    if (f == null) return null;   // mute stays mute
    //if (f === 0) return 0;        // open strings stay open
    return f + semitones;
  });

  // Determine the lowest fretted note
  const used = shifted.filter(f => f !== null && f !== 0);
  if (used.length === 0) return shifted;

  const minFret = Math.min(...used);

  // If the lowest fret is 12 or above, shift the entire voicing down 12
  if (minFret >= 12) {
    return shifted.map(f => {
      if (f == null) return null;
      if (f === 0) return 0;
      return f - 12;
    });
  }

  // Otherwise return as-is
  return shifted;
}


// ------------------------------------------------------------
// CHORD VOICING TEMPLATES (ROOT = C)
// ------------------------------------------------------------
const DICT_TEMPLATES = {
  maj: [
    { name: "C open", frets: [null,3,2,0,1,0] },
    { name: "C triad (C-shape)", frets: [3,3,2,0,1,0] },
    { name: "C A-shape barre", frets: [null,3,5,5,5,3] },
    { name: "C triad (G-shape)", frets: [8,7,5,5,5,8] },
    { name: "C E-shape barre", frets: [8,10,10,9,8,8] },
    { name: "C E-shape barre", frets: [null,null,10,12,13,12] },
  ],

  m: [
    { name: "Cm triad", frets: [null,3,5,5,4,3] },
    { name: "Cm barre (A-shape)", frets: [3,3,5,5,4,3] },
    { name: "Cm barre (E-shape)", frets: [8,10,10,8,8,8] },
  ],

  dim: [
    { name: "Cdim triad", frets: [null,3,4,2,4,2] }
  ],

  aug: [
    { name: "Caug triad", frets: [null,3,2,1,1,0] }
  ],

  "7": [
    { name: "C7 open", frets: [null,3,2,3,1,0] },
    { name: "C7 barre", frets: [8,10,8,9,8,8] },
    { name: "C7 shell", frets: [null,3,2,3,null,null] }
  ],

  maj7: [
    { name: "Cmaj7 open", frets: [null,3,2,0,0,0] },
    { name: "Cmaj7 barre", frets: [8,10,9,9,8,8] }
  ],

  min7: [
    { name: "Cm7 barre", frets: [8,10,8,8,8,8] },
    { name: "Cm7 shell", frets: [null,3,1,3,null,null] }
  ],

  m7b5: [
    { name: "Cm7b5", frets: [null,3,4,3,4,3] },
    { name: "Cm7b5", frets: [null,null,10,11,11,11] },
  ],

  dim7: [
    { name: "Cdim7", frets: [null,3,4,2,4,2] }
  ],

  sus2: [
    { name: "Csus2", frets: [null,3,0,0,1,3] }
  ],

  sus4: [
    { name: "Csus4", frets: [null,3,3,0,1,1] }
  ],

  "7sus4": [
    { name: "C7sus4", frets: [null,3,3,3,1,1] }
  ],

  add9: [
    { name: "Cadd9", frets: [null,3,2,0,3,0] }
  ],

  add11: [
    { name: "Cadd11", frets: [null,3,2,0,1,1] }
  ]
};

// ------------------------------------------------------------
// getDictionaryChords(root, chordNotes, options)
// ------------------------------------------------------------
function getDictionaryChords(root, chordNotes, tuning, reverse, options = {}) {
  const {
    chordType = "maj",
    maxResults = 50
  } = options;
  
  console.log("Reversed", reverse);
  const rootSharp = normalizeToSharp(root);
  const templates = DICT_TEMPLATES[chordType === "" ? "maj" : chordType ];
  if (!templates) return [];

  const semitones = NOTES_SHARP.indexOf(root); // C=0, C#=1, etc.
  const results = [];

  for (const tpl of templates) {
    const frets = transposeVoicing(tpl.frets, semitones);
    //if (reverse) frets.reverse();
    console.log("FRETS:", frets);
    const notes = frets.map((f, s) =>
      f == null ? null : noteAt(tuning[s], f)
    );

    const used = frets.filter(f => f !== null);
    const minFret = Math.min(...used);
    const maxFret = Math.max(...used);

    results.push({
      frets,
      notes,
      minFret,
      maxFret,
      name: tpl.name.replace("C", root)
    });

    if (results.length >= maxResults) break;
  }

  return results;
}
