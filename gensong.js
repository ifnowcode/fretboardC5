// gensong.js
// Simple song generator ported from Python into a JS class-based module.

class GenSong {
  keys = [
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
  constructor() {
    this.chords = [1,2,3,4,5,6];
    this.weightedChords = [0,0,0,0,0,1,1,2,2,3,3,3,4,4,4,4,5,5,5,6];
    this.weightedKeyIndices = [0,0,0,0,1,1,1,2,2,3,3,4,4,5,5,6,7,8,9,10,11,11,12,12,12];

    this.notes = [];
    this.keyChords = [];
  }

  // helper: random choice from array
  _choice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // main API: returns a string with all the text that would have been printed
  // amount is optional; if omitted, behaves like original (3–12 random)
  random(amount = null) {
    this.clear();
    // amount of chords
    if (amount == null) {
      amount = Math.floor(Math.random() * (12 - 3 + 1)) + 3; // 3–12
    } else {
      amount = parseInt(amount, 10);
      if (amount < 3) amount = 3;
    }

    // pick key index (weighted)
    const keyIndex = this._choice(this.weightedKeyIndices);
    this.keyChords = this.keys[keyIndex];

    this.generateChords(amount);
  }
  
  inKeyOf(keyName, amount = null) {
    this.clear();

    // Normalize input (e.g., "db" → "Db")
    keyName = String(keyName).trim();
    keyName = keyName[0].toUpperCase() + keyName.slice(1);

    // Find the key index
    const keyIndex = this.keys.findIndex(k => k[0] === keyName);
    if (keyIndex === -1) {
      throw new Error(`GenSong.inKeyOf(): Unknown key '${keyName}'`);
    }

    this.keyChords = this.keys[keyIndex];

    // Determine amount of chords
    if (amount == null) {
      amount = Math.floor(Math.random() * (12 - 3 + 1)) + 3; // 3–12
    } else {
      amount = parseInt(amount, 10);
      if (amount < 3) amount = 3;
    }

    this.generateChords(amount);
  }
  
  generateChords_00(amount) {
    // First chord
    const first = this._choice(this.chords);
    this.notes.push(first);

    // Middle chords (no immediate repeats)
    for (let i = 0; i < amount - 1; i++) {
      let chord = this._choice(this.chords);
      while (chord === this.notes[i]) {
        chord = this._choice(this.chords);
      }
      this.notes.push(chord);
    }

    // Last chord different from first
    let last = this._choice(this.chords);
    while (last === first) {
      last = this._choice(this.chords);
    }
    this.notes.push(last);
  }
  
  generateChords(amount) {
    this.notes = [];

    // First chord
    const first = this._choice(this.chords);
    this.notes.push(first);

    // Middle chords (no immediate repeats)
    for (let i = 0; i < amount - 1; i++) {
      const prev = this.notes[i];
      // allow repeats on 0 in random draw
      if (Math.floor(Math.random() * 2) == 0) {
        this.notes.push(this._choice(this.chords));
      } else {
        // Build a candidate list excluding the previous chord
        const candidates = this.chords.filter(c => c !== prev);
        // Choose from the filtered list
        this.notes.push(this._choice(candidates));
      }
    }

    // Last chord (must differ from first)
    const lastCandidates = this.chords.filter(c => c !== first);
    this.notes.push(this._choice(lastCandidates));
  }

  song() {
    // --- Build output text ---
    let out = [];
    //out.push("");
    out.push(`In the Key of ${this.keyChords[0]}`);
    out.push("");
    out.push(JSON.stringify(this.notes));
    out.push("");

    // Jazz notation (degree + relative minor)
    let jazzLine = [];
    for (let note of this.notes) {
      let relminor = note + 2;
      if (relminor === 8) relminor = 1;
      jazzLine.push(`${note}[${relminor}]`.padEnd(6, " "));
    }
    out.push("Jazz Notation: " + jazzLine.join(" "));
    out.push("");

    // Generated chords in generated key by chord
    const keyLabel = `In Key of ${this.keyChords[0]} ${this.keyChords[0].length === 1 ? " " : ""}:`;
    let chordLine = [keyLabel];
    for (let note of this.notes) {
      chordLine.push(this.keyChords[note - 1].padEnd(6, " "));
    }
    out.push(chordLine.join(" "));
    out.push("");
    out.push("or relative minor[*], modal perhaps...");
    out.push("");
    
    return out.join("\n");
  }
  
  allKeys() {
    let out = [];
    // Generated chords in all keys
    for (let k of this.keys) {
      const label = `In Key of ${k[0]}${k[0].length === 1 ? " " : ""}:`;
      let line = [label];
      for (let note of this.notes) {
        line.push(k[note - 1].padEnd(6, " "));
      }
      out.push(line.join(" "));
    }
    
    return out.join("\n");
  }
  
  keyRef() {
    let out = [];
    out.push("Circle Of 5ths");
    let posLine = ["Position    :"];
    for (let i = 1; i <= 7; i++) {
      posLine.push(String(i).padEnd(6, " "));
    }
    out.push(posLine.join(" "));
    //console.log("Keys", this.keys);
    for (let k of this.keys) {
      const label = `Key of ${k[0]}${k[0].length === 1 ? "    :" : "   :"}`;
      let line = [label];
      for (let note of k) {
        line.push(note.padEnd(6, " "));
      }
      out.push(line.join(" "));
    }
    
    return out.join("\n");
  }
  
  clear(name = "gensong") {
    this.notes = [];
    this.keyChords = [];
    localStorage.removeItem(name);
  }
  
  empty() {
    if (this.notes.length && this.keyChords.length) {
      return false;
    } else if (this.notes.length || this.keyChords.length) {
      console.error("Invalid state", this.notes.length, this.keyChords.length);
      this.clear();
    }
    return true;
  }
  
  save(name = "gensong") {
    if (this.empty()) {
      console.warn("GenSong.save(): nothing to save");
      return false;
    }

    const payload = {
      notes: this.notes,
      keyChords: this.keyChords
    };

    try {
      localStorage.setItem(name, JSON.stringify(payload));
      return true;
    } catch (err) {
      console.error("GenSong.save(): failed", err);
      return false;
    }
  }

  load(name = "gensong") {
    const raw = localStorage.getItem(name);
    if (!raw) {
      console.warn(`GenSong.load(): no saved data under '${name}'`);
      return false;
    }

    try {
      const payload = JSON.parse(raw);

      // Validate structure
      if (!Array.isArray(payload.notes) || !Array.isArray(payload.keyChords)) {
        console.error("GenSong.load(): invalid payload", payload);
        return false;
      }

      this.notes = payload.notes;
      this.keyChords = payload.keyChords;
      return true;

    } catch (err) {
      console.error("GenSong.load(): parse error", err);
      return false;
    }
  }

}
