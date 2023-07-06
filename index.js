var audioCtx;
var synth = {};
var pressedKeyMap = {};
var pressedNoteMap = {};

const noteMap = {
    'Q': { "note": 'C0', "frequency": 261.63 },
    '2': { "note": 'C#0/Db0', "frequency": 277.18 },
    'W': { "note": 'D0', "frequency": 293.66 },
    '3': { "note": 'D#0/Eb0', "frequency": 311.13 },
    'E': { "note": 'E0', "frequency": 329.63 },
    'R': { "note": 'F0', "frequency": 349.23 },
    '5': { "note": 'F#0/Gb0', "frequency": 369.99 },
    'T': { "note": 'G0', "frequency": 392.0 },
    '6': { "note": 'G#0/Ab0', "frequency": 415.3 },
    'Y': { "note": 'A0', "frequency": 440.0 },
    '7': { "note": 'A#0/Bb0', "frequency": 466.16 },
    'U': { "note": 'B0', "frequency": 493.88 },
    'I': { "note": 'C1', "frequency": 523.25 },
    '9': { "note": 'C#1/Db1', "frequency": 554.37 },
    'O': { "note": 'D1', "frequency": 587.33 },
    '0': { "note": 'D#1/Eb1', "frequency": 622.25 },
    'P': { "note": 'E1', "frequency": 659.25 }
};

document.onkeydown = (e) => {
    pressedKeyMap[String(e.key).toUpperCase()] = true;
    document.getElementById("key-view").innerHTML = JSON.stringify(pressedKeyMap);
    if (String(e.key).toUpperCase() in noteMap) {
        let note = noteMap[String(e.key).toUpperCase()]["note"];
        pressedNoteMap[String(note)] = true;
        let osc = audioCtx.createOscillator();
        osc.type = "square";
        osc.frequency.setValueAtTime(noteMap[String(e.key).toUpperCase()]["frequency"], audioCtx.currentTime);
        osc.connect(audioCtx.destination);
        osc.start();
        synth[String(note)] = osc;
    }
    document.getElementById("pressed-view").innerHTML = JSON.stringify(pressedNoteMap);
}

document.onkeyup = (e) => {
    pressedKeyMap[String(e.key).toUpperCase()] = false;
    document.getElementById("key-view").innerHTML = JSON.stringify(pressedKeyMap);
    if (String(e.key).toUpperCase() in noteMap) {
        let note = noteMap[String(e.key).toUpperCase()]["note"];
        pressedNoteMap[String(note)] = false;
        synth[String(note)].stop();
        synth[String(note)] = null;
    }
    document.getElementById("pressed-view").innerHTML = JSON.stringify(pressedNoteMap);

}

window.addEventListener('load', () => {
    try {
        audioCtx = new AudioContext();
    } catch (err) {
        alert('The JavaScript Web Audio API is not supported by this browser.');
    }
}, false);