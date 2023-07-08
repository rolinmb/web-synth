"use strict";
var audioCtx = undefined;
var ctxGain = undefined;
var muted = false;
var c0 = { name: 'C0', frequency: 261.63, oscillator: undefined };
var cs0 = { name: 'C#0/Db0', frequency: 277.18, oscillator: undefined };
var d0 = { name: 'D0', frequency: 293.66, oscillator: undefined };
var ds0 = { name: 'D#0/Eb0', frequency: 311.13, oscillator: undefined };
var e0 = { name: 'E0', frequency: 329.63, oscillator: undefined };
var f0 = { name: 'F0', frequency: 349.23, oscillator: undefined };
var fs0 = { name: 'F#0/Gb0', frequency: 369.99, oscillator: undefined };
var g0 = { name: 'G0', frequency: 392.0, oscillator: undefined };
var gs0 = { name: 'G#0/Ab0', frequency: 415.3, oscillator: undefined };
var a0 = { name: 'A0', frequency: 440.0, oscillator: undefined };
var as0 = { name: 'A#0/Bb0', frequency: 466.16, oscillator: undefined };
var b0 = { name: 'B0', frequency: 493.88, oscillator: undefined };
var c1 = { name: 'C1', frequency: 523.25, oscillator: undefined };
var cs1 = { name: 'C#1/Db1', frequency: 554.37, oscillator: undefined };
var d1 = { name: 'D1', frequency: 587.33, oscillator: undefined };
var ds1 = { name: 'D#1/Eb1', frequency: 622.25, oscillator: undefined };
var e1 = { name: 'E1', frequency: 659.25, oscillator: undefined };
const noteMap = {
    'Q': c0,
    '2': cs0,
    'W': d0,
    '3': ds0,
    'E': e0,
    'R': f0,
    '5': fs0,
    'T': g0,
    '6': gs0,
    'Y': a0,
    '7': as0,
    'U': b0,
    'I': c1,
    '9': cs1,
    'O': d1,
    '0': ds1,
    'P': e1
};
var pressedKeyMap = {};
var pressedNoteMap = {};
document.onkeydown = (e) => {
    let keyStr = String(e.key).toUpperCase();
    pressedKeyMap[keyStr] = true;
    document.getElementById("key-view").innerHTML = JSON.stringify(pressedKeyMap);
    if (keyStr in noteMap) {
        let noteStr = noteMap[keyStr].name;
        if (!pressedNoteMap[noteStr]) {
            pressedNoteMap[noteStr] = true;
            let osc = audioCtx.createOscillator();
            const selectElement = document.getElementById("waveform-select");
            osc.type = selectElement.value;
            osc.frequency.setValueAtTime(noteMap[keyStr].frequency, audioCtx.currentTime);
            osc.connect(ctxGain).connect(audioCtx.destination);
            if (muted) {
                osc.start();
            }
            noteMap[keyStr].oscillator = osc;
        }
    }
    document.getElementById("pressed-view").innerHTML = JSON.stringify(pressedNoteMap);
};
document.onkeyup = (e) => {
    var _a;
    let keyStr = String(e.key).toUpperCase();
    pressedKeyMap[keyStr] = false;
    document.getElementById("key-view").innerHTML = JSON.stringify(pressedKeyMap);
    if (keyStr in noteMap) {
        let noteStr = noteMap[keyStr].name;
        pressedNoteMap[noteStr] = false;
        try {
            (_a = noteMap[keyStr].oscillator) === null || _a === void 0 ? void 0 : _a.stop();
        }
        catch (_b) { }
        noteMap[keyStr].oscillator = undefined;
    }
    document.getElementById("pressed-view").innerHTML = JSON.stringify(pressedNoteMap);
};
function handleClick() {
    muted = !muted;
    if (muted) {
        for (const key in noteMap) {
            noteMap[key].oscillator = undefined;
        }
        document.getElementById("start-stop").innerHTML = "Mute Synthesizer";
        document.getElementById("top-header").innerHTML = "In-Browser Synthesizer (UNMUTED; PRESS ANY KEY TO PLAY)";
    }
    else {
        for (const key in noteMap) {
            if (noteMap[key].oscillator) {
                noteMap[key].oscillator.stop();
            }
            noteMap[key].oscillator = undefined;
        }
        document.getElementById("start-stop").innerHTML = "Unmute Synthesizer";
        document.getElementById("top-header").innerHTML = "In-Browser Synthesizer (CURRENTLY MUTED)";
    }
}
window.addEventListener('load', () => {
    try {
        audioCtx = new AudioContext();
        ctxGain = audioCtx.createGain();
        ctxGain.connect(audioCtx.destination);
    }
    catch (err) {
        alert("The JavaScript Web Audio API is not supported by this browser.");
    }
}, false);
