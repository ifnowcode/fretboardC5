// app.js
//let gentext = "";
// Circle of Fifths for scale dropdown
const CIRCLE_OF_FIFTHS = [
  "C","G","D","A","E","B","F#","Gb","Db","Ab","Eb","Bb","F"
];

// Keys typically spelled with sharps vs flats
const SHARP_KEYS = new Set(["C","G","D","A","E","B","F#","C#"]);
const FLAT_KEYS  = new Set(["F","Bb","Eb","Ab","Db","Gb","Cb"]);

// Internal canonical notes (must match fretboard.js)
const NOTES_SHARP = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

keytriads = [
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

voicings = {
  "C":  [[null, 3, 2, 0, 1, 0], [null, 3, 5, 5, 5, 3]],
  "Dm": [[null, 0, 2, 3, 1], [null, 5, 7, 7, 6, 5] ],
};

// Intervals
const SCALE_INTERVALS_SIMPLE = {
  major:      [0,2,4,5,7,9,11],
  minor:      [0,2,3,5,7,8,10],
  pentMajor:  [0,2,4,7,9],
  pentMinor:  [0,3,5,7,10]
};

const CHORD_INTERVALS_SIMPLE = {
  maj:  [0,4,7],
  min:  [0,3,7],
  dom7: [0,4,7,10],
  maj7: [0,4,7,11],
  min7: [0,3,7,10]
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

// Populate dropdowns
function populateScaleDropdown(sel) {
  sel.innerHTML = "";
  CIRCLE_OF_FIFTHS.forEach(n => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    sel.appendChild(opt);
  });
}

function populateChordDropdown(sel) {
  const list = [
    "C",
    "C#","Db",
    "D",
    "D#","Eb",
    "E",
    "F",
    "F#","Gb",
    "G",
    "G#","Ab",
    "A",
    "A#","Bb",
    "B"
  ];
  sel.innerHTML = "";
  list.forEach(n => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    sel.appendChild(opt);
  });
}

// Map chord root selection to internal sharp name
function normalizeRootToSharp(root) {
  // If already sharp or natural and exists, use directly
  if (NOTES_SHARP.includes(root)) return root;

  // If flat, map via NOTES_FLAT index
  const flatIdx = FB_NOTES_FLAT.indexOf(root);
  if (flatIdx !== -1) return FB_NOTES_SHARP[flatIdx];

  // Fallback: return as-is
  return root;
}

// Init
const outputDiv = document.getElementById("output");
function textout(msg) {
  outputDiv.textContent = msg == null ? "" : String(msg);
}
function htmlout(html) {
  outputDiv.innerHTML = html == null ? "" : String(html);
}
  
window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("fretboard");
 
  const scaleRootSel = document.getElementById("scaleRootSel");
  const scaleTypeSel = document.getElementById("scaleTypeSel");
  const chordRootSel = document.getElementById("chordRootSel");
  const chordTypeSel = document.getElementById("chordTypeSel");
  const hideScale = document.getElementById("hideScale");
  const hideChord = document.getElementById("hideChord");
  const flipStrings  = document.getElementById("flipStrings");
  const showScale  = document.getElementById("showScale");
  const tuningSel  = document.getElementById("tuning");
  const showCaged  = document.getElementById("showCaged");
  const showVoice  = document.getElementById("showVoice");

  populateScaleDropdown(scaleRootSel);
  populateChordDropdown(chordRootSel);

  scaleRootSel.value = "C";
  chordRootSel.value = "C";
  
  const fb = new Fretboard(canvas, 15, FB_TUNINGS[tuningSel.value]);

  function update() {
    const scaleRoot = scaleRootSel.value;
    //console.log("Scale Root:", scaleRoot);
    const scaleType = scaleTypeSel.value;
    const chordRootSelVal = chordRootSel.value;
    const chordType = chordTypeSel.value;
 
    const useFlats = autoUseFlats(scaleRoot);

    // Normalize roots to internal sharp names
    const scaleRootSharp = normalizeRootToSharp(scaleRoot);
    const chordRootSharp = normalizeRootToSharp(chordRootSelVal);

    const scaleIntervals = FB_MODES[scaleType] || FB_MODES.major;
    const chordIntervals = FB_CHORD_INTERVALS[chordType] || FB_CHORD_INTERVALS.maj;

    const scaleNotes = getNotes(scaleRootSharp, scaleIntervals);
    const chordNotes = getNotes(chordRootSharp, chordIntervals);

    fb.clear();
    fb.drawBoard(flipStrings.checked, { fretover: true });
    
    console.log("Intervals", chordIntervals, ", Notes", chordNotes, );
    
    //fb.draw(scaleNotes, chordNotes, useFlats);   
      
    if (showVoice.checked) {
      /*
      const openC = [null, 3, 2, 0, 1, 0]; // x32010

      fb.plotVoicing(openC, "#f60", useFlats, {
        highlightRoot: true,
        rootNote: "C",
        rootColor: "#fff",
        rootRadius: 26
      });
      */
      // Generate voicings
      const voicings = generateChordVoicings(chordRootSharp, chordNotes, fb.strings, {
        minFret: 0,
        maxFret: 15,
        maxSpan: 3,
        minNotes: chordIntervals.length,
        maxResults: 50
      });
      
      console.log("Found", voicings.length, " voicings");
      
      if (true) {
        // Pick one to plot (e.g., first)
        const v = voicings[0];
        
        fb.plotVoicing(v.frets, getRandomColor(), useFlats, {
          highlightRoot: true,
          rootNote: chordRootSharp,
          rootColor: "#fff",
          rootRadius: 26
        });
      } else {
        for (const v of voicings) {
          fb.plotVoicing(v.frets, getRandomColor(), useFlats, {
            highlightRoot: true,
            rootNote: chordRootSharp,
            rootColor: "#fff",
            rootRadius: 26,
            alpha: 0.4,
          });
        }
      }
    } else {

      if (!hideScale.checked) {
        fb.plotNotes(scaleNotes, "#0af", useFlats, { //#3af
          highlightRoot: showScale.checked,
          rootNote: scaleRootSharp,
          rootColor: "#0f0",
          rootRadius: 22,
          alpha: showScale.checked ? 1.0 : 0.5,
          border: false,
        });
      }
      if (!hideChord.checked) {
        fb.plotNotes(chordNotes, showScale.checked ? "#ff0" : "#f60", useFlats, {
          highlightRoot: !showScale.checked,
          rootNote: chordRootSharp,
          rootColor: "#fff",
          rootRadius: 24,
          alpha: showScale.checked ? 0.33 : 1.0,
          border: true,
        });
      }
    }
    
    if (showCaged.checked) {
      const shapes = resolveCAGEDShapes(fb.strings, chordRootSharp, chordNotes, flipStrings.checked, fb.frets);
      drawCAGEDOverlay(fb, shapes);
    }
    
    const keytriadIndex = Object.fromEntries(
      keytriads.map((row, i) => [row[0], i])
    );
    const idx = keytriadIndex[scaleRoot];
    const triads = keytriads[idx];
    
    textout(
    //`Chord: ${fbDisplayNote(chordRootSel.value, useFlats.checked)} ${chordTypeSel.value}\n` +
    //`Scale: ${fbDisplayNote(scaleRootSel.value, useFlats.checked)} ${scaleTypeSel.value}\n` +
    //`Tuning: ${tuningSel.value}\n\n` +
    `${triads}`
   
  );
  }
  
  // chord types
  FB_CHORD_INTERVAL_ORDER.forEach(c => {
    chordTypeSel.add(new Option(c, c));
  });

  // scale modes
  Object.keys(FB_MODES).forEach(m =>
    scaleTypeSel.add(new Option(m,m))
  );

  Object.keys(FB_TUNINGS).forEach(t =>
    tuningSel.add(new Option(t,t))
  );

  scaleRootSel.addEventListener("change", update);
  scaleTypeSel.addEventListener("change", update);
  chordRootSel.addEventListener("change", update);
  chordTypeSel.addEventListener("change", update);
  showScale.addEventListener("change", update);
  showCaged.addEventListener("change", update);
  showVoice.addEventListener("change", update);
  hideScale.addEventListener("change", (e) => {
    //console.log("Hide Scale", hideScale.checked);
    fb.hideScale(hideScale.checked);
    update();
  });
  hideChord.addEventListener("change", (e) => {
    //console.log("Hide Chord", hideChord.checked);
    fb.hideChord(hideChord.checked);
    update();
  });
  flipStrings.addEventListener("change", (e) => {
    fb.reverse(flipStrings.checked);
    update();
  });
  tuningSel.addEventListener("change", (e) => {
    fb.tuning(FB_TUNINGS[tuningSel.value]);
    update();
  });
  
  update();
});
