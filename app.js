// app.js
//let gentext = "";


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

function populateVoiceDropdown(sel, voicings) {
  sel.innerHTML = "";
  voicings.forEach((n, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = n.frets;
    sel.appendChild(opt);
  });
}

let voicings =  null;
function updateVoicings(strings) {
  //const scaleRoot = scaleRootSel.value;
  //console.log("Scale Root:", scaleRoot);
  //const scaleType = scaleTypeSel.value;
  const chordRootSelVal = chordRootSel.value;
  const chordType = chordTypeSel.value;

  //const useFlats = autoUseFlats(scaleRoot);

  // Normalize roots to internal sharp names
  //const scaleRootSharp = normalizeRootToSharp(scaleRoot);
  const chordRootSharp = normalizeRootToSharp(chordRootSelVal);

  //const scaleIntervals = MODES[scaleType] || MODES.major;
  const chordIntervals = CHORD_INTERVALS[chordType] || CHORD_INTERVALS.maj;

  //const scaleNotes = getNotes(scaleRootSharp, scaleIntervals);
  const chordNotes = getNotes(chordRootSharp, chordIntervals);
    
  // Generate voicings
  voicings = generateChordVoicings(chordRootSharp, chordNotes, strings, {
    minFret: 0,
    maxFret: 15,
    maxSpan: 3,
    minNotes: chordIntervals.length,
    maxResults: 50
  });
  
  console.log("Found", voicings.length, " voicings");
  
  populateVoiceDropdown(chordVoiceSel, voicings);
}

// Map chord root selection to internal sharp name
function normalizeRootToSharp(root) {
  // If already sharp or natural and exists, use directly
  if (NOTES_SHARP.includes(root)) return root;

  // If flat, map via NOTES_FLAT index
  const flatIdx = NOTES_FLAT.indexOf(root);
  if (flatIdx !== -1) return NOTES_SHARP[flatIdx];

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
 
  const scaleRootSel  = document.getElementById("scaleRootSel");
  const scaleTypeSel  = document.getElementById("scaleTypeSel");
  const chordRootSel  = document.getElementById("chordRootSel");
  const chordTypeSel  = document.getElementById("chordTypeSel");
  const hideScale     = document.getElementById("hideScale");
  const hideChord     = document.getElementById("hideChord");
  const flipStrings   = document.getElementById("flipStrings");
  const showScale     = document.getElementById("showScale");
  const tuningSel     = document.getElementById("tuning");
  const showCaged     = document.getElementById("showCaged");
  const showVoice     = document.getElementById("showVoice");
  const chordVoiceSel = document.getElementById("chordVoiceSel");
  const jazzNotation  = document.getElementById("jazzNotation");

  populateScaleDropdown(scaleRootSel);
  populateChordDropdown(chordRootSel);

  scaleRootSel.value = "C";
  chordRootSel.value = "C";
  
  const fb = new Fretboard(canvas, 15, TUNINGS[tuningSel.value]);
  updateVoicings(fb.strings);

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

    const scaleIntervals = MODES[scaleType] || MODES.major;
    const chordIntervals = CHORD_INTERVALS[chordType] || CHORD_INTERVALS.maj;

    const scaleNotes = getNotes(scaleRootSharp, scaleIntervals);
    const chordNotes = getNotes(chordRootSharp, chordIntervals);
    
    fb.clear();
    fb.drawBoard(flipStrings.checked, { fretover: true });
    
    console.log("Intervals", chordIntervals, ", Notes", chordNotes, );
    
    //fb.draw(scaleNotes, chordNotes, useFlats);   

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
      
      if (true && (voicings && voicings.length)) {
        // Pick one to plot (e.g., first)
        const v = voicings[chordVoiceSel.value];
        //console.log("Chord Voice Select:", chordVoiceSel.value);
        fb.plotVoicing(v.frets, getRandomColor(), useFlats, {
          highlightRoot: true,
          rootNote: chordRootSharp,
          rootColor: "#fff",
          rootRadius: 26
        });
      } else if (voicings) {
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
      KEY_TRIADS.map((row, i) => [row[0], i])
    );
    const idx = keytriadIndex[scaleRoot];
    const triads = KEY_TRIADS[idx];
    
    textout(
    //`Chord: ${fbDisplayNote(chordRootSel.value, useFlats.checked)} ${chordTypeSel.value}\n` +
    //`Scale: ${fbDisplayNote(scaleRootSel.value, useFlats.checked)} ${scaleTypeSel.value}\n` +
    //`Tuning: ${tuningSel.value}\n\n` +
    `${triads}`
   
  );
  }
  
  // chord types
  CHORD_INTERVAL_ORDER.forEach(c => {
    chordTypeSel.add(new Option(c, c));
  });

  // scale modes
  Object.keys(MODES).forEach(m =>
    scaleTypeSel.add(new Option(m,m))
  );

  Object.keys(TUNINGS).forEach(t =>
    tuningSel.add(new Option(t,t))
  );

  scaleRootSel.addEventListener("change", update);
  scaleTypeSel.addEventListener("change", update);
  //chordRootSel.addEventListener("change", update);
  //chordTypeSel.addEventListener("change", update);
  showScale.addEventListener("change", update);
  showCaged.addEventListener("change", update);
  showVoice.addEventListener("change", update);
  chordVoiceSel.addEventListener("change", update);
  hideScale.addEventListener("change", (e) => {
    //console.log("Hide Scale", hideScale.checked);
    fb.hideScale(hideScale.checked);
    update();
  });
  chordRootSel.addEventListener("change", (e) => {
    updateVoicings(fb.strings);
    update();
  });
  chordTypeSel.addEventListener("change", (e) => {
    updateVoicings(fb.strings);
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
    fb.tuning(TUNINGS[tuningSel.value]);
    update();
  });
  jazzNotation.addEventListener("change", (e) => {
    fb.notation(jazzNotation.checked);
    update();
  });
  
  update();
});
