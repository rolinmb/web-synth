"use strict";
var _a, _b, _c;
var audioCtx = undefined;
var ctxGain = undefined;
var distortion = undefined;
var muted = false;
var distorting = false;
var c0 = { name: 'C4', frequency: 261.63, oscillator: undefined };
var cs0 = { name: 'C#4/Db4', frequency: 277.18, oscillator: undefined };
var d0 = { name: 'D4', frequency: 293.66, oscillator: undefined };
var ds0 = { name: 'D#4/Eb4', frequency: 311.13, oscillator: undefined };
var e0 = { name: 'E4', frequency: 329.63, oscillator: undefined };
var f0 = { name: 'F4', frequency: 349.23, oscillator: undefined };
var fs0 = { name: 'F#4/Gb4', frequency: 369.99, oscillator: undefined };
var g0 = { name: 'G4', frequency: 392.0, oscillator: undefined };
var gs0 = { name: 'G#4/Ab4', frequency: 415.3, oscillator: undefined };
var a0 = { name: 'A4', frequency: 440.0, oscillator: undefined };
var as0 = { name: 'A#4/Bb4', frequency: 466.16, oscillator: undefined };
var b0 = { name: 'B4', frequency: 493.88, oscillator: undefined };
var c1 = { name: 'C5', frequency: 523.25, oscillator: undefined };
var cs1 = { name: 'C#5/Db5', frequency: 554.37, oscillator: undefined };
var d1 = { name: 'D5', frequency: 587.33, oscillator: undefined };
var ds1 = { name: 'D#5/Eb5', frequency: 622.25, oscillator: undefined };
var e1 = { name: 'E5', frequency: 659.25, oscillator: undefined };
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
            if (distorting) {
                osc.connect(ctxGain).connect(distortion).connect(audioCtx.destination);
            }
            else {
                osc.connect(ctxGain).connect(audioCtx.destination);
            }
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
function handleOscTypeClick() {
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
(_a = document.getElementById('gain-slider')) === null || _a === void 0 ? void 0 : _a.addEventListener('input', function () {
    let slider = document.getElementById('gain-slider');
    let val = slider.valueAsNumber;
    ctxGain === null || ctxGain === void 0 ? void 0 : ctxGain.gain.setValueAtTime(val, (audioCtx === null || audioCtx === void 0 ? void 0 : audioCtx.currentTime) || 0);
    document.getElementById("gain-view").innerHTML = val.toString();
});
(_b = document.getElementById('distortion-on-off')) === null || _b === void 0 ? void 0 : _b.addEventListener('change', function () {
    var _a, _b, _c, _d;
    distorting = !distorting;
    for (const key in noteMap) {
        if (((_a = noteMap[key]) === null || _a === void 0 ? void 0 : _a.oscillator) !== undefined) {
            if (distorting) {
                (_b = noteMap[key].oscillator) === null || _b === void 0 ? void 0 : _b.connect(distortion).connect(audioCtx.destination);
            }
            else {
                (_c = noteMap[key].oscillator) === null || _c === void 0 ? void 0 : _c.disconnect(distortion);
                (_d = noteMap[key].oscillator) === null || _d === void 0 ? void 0 : _d.connect(audioCtx.destination);
            }
        }
    }
});
function getDistortionCurve(amount) {
    const k = typeof amount === "number" ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; i++) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
}
(_c = document.getElementById('distortion-amount-slider')) === null || _c === void 0 ? void 0 : _c.addEventListener('input', function () {
    let slider = document.getElementById('distortion-amount-slider');
    let val = slider.valueAsNumber;
    distortion.curve = getDistortionCurve(val);
    document.getElementById("distortion-amount-view").innerHTML = val.toString();
});
window.addEventListener('load', function () {
    try {
        audioCtx = new AudioContext();
        ctxGain = audioCtx.createGain();
        let gainSlider = document.getElementById('gain-slider');
        gainSlider.value = String(0.05);
        distortion = audioCtx.createWaveShaper();
        distortion.curve = getDistortionCurve(400);
        distortion.oversample = "2x";
        let distortionAmntSlider = document.getElementById('distortion-amount-slider');
        distortionAmntSlider.value = String(400);
        document.getElementById('distortion-on-off-view').innerHTML = "Off";
    }
    catch (err) {
        alert("The JavaScript Web Audio API is not supported by this browser.");
    }
}, false);
