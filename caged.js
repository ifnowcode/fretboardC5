// ------------------------------------------------------------
// CAGED SHAPES (relative fret patterns, 6→1)
// null = unused string
// 0 = open in shape
// ------------------------------------------------------------
const CAGED_SHAPES = [
  { name: "C", pattern: [null, 3, 2, 0, 1, 0] },
  { name: "A", pattern: [null, 0, 2, 2, 2, 0] },
  { name: "G", pattern: [3, 2, 0, 0, 0, 3] },
  { name: "E", pattern: [0, 2, 2, 1, 0, 0] },
  { name: "D", pattern: [null, null, 0, 2, 3, 2] }
];

function alignPatternToStrings(pattern, strings, flipped) {
  // If strings are reversed, reverse the pattern too
  if (flipped) {
    return [...pattern].reverse();
  }
  return pattern;
}

// ------------------------------------------------------------
// Compute notes for a shape at a given offset
// ------------------------------------------------------------
function notesForShapeAtOffset(strings, shape, offset, flipped) {
  const frets = [];
  const notes = [];
  
  const pattern = alignPatternToStrings(shape.pattern, strings, flipped);

  for (let s = 0; s < strings.length; s++) {
    const rel = pattern[s];
    if (rel == null) {
      frets.push(null);
      notes.push(null);
      continue;
    }

    const absFret = rel + offset;
    frets.push(absFret);

    const raw = noteAt(strings[s], absFret);
    notes.push(raw);
  }

  return { frets, notes };
}

// ------------------------------------------------------------
// Resolve CAGED shapes for a chord root + chord notes
// ------------------------------------------------------------
function resolveCAGEDShapes(strings, chordRoot, chordNotes, flipped, maxFrets = 15) {
  const results = [];

  for (const shape of CAGED_SHAPES) {
    for (let offset = -5; offset <= maxFrets; offset++) {
      const { frets, notes } = notesForShapeAtOffset(strings, shape, offset, flipped);

      // Check bounds
      const used = frets.filter(f => f != null);
      if (!used.length) continue;
      if (Math.min(...used) < 0 || Math.max(...used) > maxFrets) continue;

      // Must contain root
      if (!notes.includes(chordRoot)) continue;

      // All notes must be in chord
      if (!notes.every(n => n == null || chordNotes.includes(n))) continue;

      const minFret = Math.min(...used);
      const maxFret = Math.max(...used);

      results.push({
        name: shape.name,
        frets,
        minFret,
        maxFret
      });
    }
  }

  // Keep first instance of each shape (C, A, G, E, D)
  const seen = new Set();
  const filtered = [];

  for (const r of results.sort((a,b)=>a.minFret-b.minFret)) {
    if (!seen.has(r.name)) {
      seen.add(r.name);
      filtered.push(r);
    }
  }

  return filtered;
}

// ------------------------------------------------------------
// Draw CAGED outlines + labels
// ------------------------------------------------------------
function drawCAGEDOverlay(fb, shapes, color="#ff0") {
  const ctx = fb.ctx;
  const h = fb.height / (fb.strings.length + 1);

  for (const shape of shapes) {
    const { minFret, maxFret, frets, name } = shape;
    color = getRandomColor();
    // Compute bounding box
    let minString = Infinity;
    let maxString = -Infinity;

    for (let s = 0; s < frets.length; s++) {
      if (frets[s] != null) {
        minString = Math.min(minString, s);
        maxString = Math.max(maxString, s);
      }
    }

    const x1 = 50 + minFret * 60;
    const x2 = 50 + maxFret * 60 + 60;
    const y1 = h * (minString + 1) - 25;
    const y2 = h * (maxString + 1) + 25;

    // Outline
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 6]);
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    ctx.setLineDash([]);

    // Label (centered)
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    
    ctx.globalAlpha = 0.5;

    ctx.fillStyle = color;
    ctx.font = "bold 72px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name, cx, cy);
    
    ctx.globalAlpha = 1.0;
  }
}
