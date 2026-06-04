// voicingGenerator.js

// ------------------------------------------------------------
// Canonical note system (must match your engine)
// ------------------------------------------------------------
//const NOTES_SHARP = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

// Standard tuning (low → high)
//const STANDARD_TUNING = ["E","A","D","G","B","E"];

// ------------------------------------------------------------
// Utility: build all candidate frets per string for a chord
// Each entry: [null, ...fretsThatAreChordTones]
// ------------------------------------------------------------
function buildStringOptions(tuning, chordNotes, minFret, maxFret, reverse) {
  const options = [];
  
  for (let s = 0; s < tuning.length; s++) {
    const open = tuning[s];
    const frets = [null]; // null = mute

    for (let f = minFret; f <= maxFret; f++) {
      const n = noteAt(open, f);
      if (chordNotes.includes(n)) {
        frets.push(f);
      }
    }

    options.push(frets);
  }

  return options;
}

// ------------------------------------------------------------
// Utility: cartesian product of arrays
// ------------------------------------------------------------
function cartesianProduct(arrays) {
  return arrays.reduce(
    (acc, curr) =>
      acc.flatMap(a => curr.map(b => [...a, b])),
    [[]]
  );
}

// ------------------------------------------------------------
// Constraints / pruning
// ------------------------------------------------------------

// At least N non-muted strings
function hasMinNotes(voicing, minNotes) {
  return voicing.filter(f => f !== null).length >= minNotes;
}

// Contains the root somewhere
function containsRoot(voicing, tuning, root) {
  for (let s = 0; s < tuning.length; s++) {
    const f = voicing[s];
    if (f == null) continue;
    const n = noteAt(tuning[s], f);
    if (n === root) return true;
  }
  return false;
}

// Fret span within limit
function withinSpan(voicing, maxSpan) {
  const used = voicing.filter(f => f !== null);
  if (!used.length) return false;
  const minF = Math.min(...used);
  const maxF = Math.max(...used);
  return (maxF - minF) <= maxSpan;
}

// Optional: require at least one note at or below some fret (avoid super high-only shapes)
function hasLowAnchor(voicing, maxAnchorFret) {
  const used = voicing.filter(f => f !== null);
  if (!used.length) return false;
  return Math.min(...used) <= maxAnchorFret;
}

// Optional: avoid "floating single note" voicings (e.g., only one string played)
function notTooSparse(voicing, maxMutedGap = 3) {
  // Simple heuristic: avoid voicings where only 1 string is played
  const count = voicing.filter(f => f !== null).length;
  return count > 1;
}

function rootIsBass(voicing, tuning, root) {
  let lowestString = null;

  for (let s = 0; s < tuning.length; s++) {
    const f = voicing[s];
    if (f == null) continue;

    const n = noteAt(tuning[s], f);
    lowestString = n;
    break;
  }

  return lowestString === root;
}

function noSkippedStrings(voicing) {
  let foundPlayed = false;

  for (let s = 0; s < voicing.length; s++) {
    const f = voicing[s];

    if (f !== null) {
      foundPlayed = true;
    } else if (foundPlayed) {
      // Found a mute AFTER a played string → skip
      return false;
    }
  }

  return true;
}

function containsAllChordTones(voicing, tuning, chordNotes) {
  const found = new Set();

  for (let s = 0; s < tuning.length; s++) {
    const f = voicing[s];
    if (f == null) continue;

    const n = noteAt(tuning[s], f);
    if (chordNotes.includes(n)) {
      found.add(n);
    }
  }

  return chordNotes.every(n => found.has(n));
}


// ------------------------------------------------------------
// Main generator (export)
// ------------------------------------------------------------
function generateChordVoicings(root, chordNotes, tuning, reverse, options = {}) {
  const {
    minFret = 0,
    maxFret = 12,
    maxSpan = 4,
    minNotes = 3,
    maxResults = 200
  } = options;

  // 1. Build candidate frets per string
  const stringOptions = buildStringOptions(tuning, chordNotes, minFret, maxFret, reverse);
  console.log("stringOptions", stringOptions);

  // 2. Cartesian product → all raw voicings
  const rawVoicings = cartesianProduct(stringOptions);

  const results = [];

  console.log("Raw Voice count:", rawVoicings.length);

  // 3. Prune
  for (const voicing of rawVoicings) {
    // Contains root
    if (!containsRoot(voicing, tuning, root)) continue;
    // Span constraint
    if (!withinSpan(voicing, maxSpan)) continue;
    // Enough notes
    if (!hasMinNotes(voicing, minNotes)) continue;
    // Root must be lowest played note
    if (!rootIsBass(voicing, tuning, root)) continue;
    // Low anchor (avoid only super high shapes)
    if (!hasLowAnchor(voicing, maxFret)) continue;
    // Avoid trivial/silly shapes
    if (!notTooSparse(voicing)) continue;
    // No skipped strings
    if (!noSkippedStrings(voicing)) continue;
    // Must contain ALL chord tones at least once
    if (!containsAllChordTones(voicing, tuning, chordNotes)) continue;
    //continue;
    // 4. Build metadata
    const used = voicing.filter(f => f !== null);
    const minF = Math.min(...used);
    const maxF = Math.max(...used);

    const notes = voicing.map((f, s) =>
      f == null ? null : noteAt(tuning[s], f)
    );
    
    results.push({
      frets: voicing,
      notes,
      minFret: minF,
      maxFret: maxF
    });

    if (results.length >= maxResults) break;
  }

  // of we didn't find anything relax the rules and try again
  if (!results.length) {
    console.log("Found no qualifying voices, lowering the bar...");
    for (const voicing of rawVoicings) {
      if (!containsRoot(voicing, tuning, root)) continue;
      //if (!rootIsBass(voicing, tuning, root)) continue;
      if (!withinSpan(voicing, maxSpan)) continue;
      if (!hasMinNotes(voicing, 2)) continue;
      if (!notTooSparse(voicing)) continue;
      //if (!hasLowAnchor(voicing, maxFret)) continue;

      // 4. Build metadata
      const used = voicing.filter(f => f !== null);
      const minF = Math.min(...used);
      const maxF = Math.max(...used);

      const notes = voicing.map((f, s) =>
        f == null ? null : noteAt(tuning[s], f)
      );

      results.push({
        frets: voicing,
        notes,
        minFret: minF,
        maxFret: maxF
      });

      if (results.length >= maxResults) break;
    }

  }

  // 5. Sort by:
  // - lowest fret
  // - then by span
  results.sort((a, b) => {
    if (a.minFret !== b.minFret) return a.minFret - b.minFret;
    const spanA = a.maxFret - a.minFret;
    const spanB = b.maxFret - b.minFret;
    return spanA - spanB;
  });
  
  return results;
}
