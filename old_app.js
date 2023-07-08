var audioCtx;
var ctxGain;
var pressedKeyMap = {};
var pressedNoteMap = {};
var muted = false;

const noteMap = {
    'Q': { "note": 'C0', "frequency": 261.63, "oscillator": null },
    '2': { "note": 'C#0/Db0', "frequency": 277.18, "oscillator": null },
    'W': { "note": 'D0', "frequency": 293.66, "oscillator": null },
    '3': { "note": 'D#0/Eb0', "frequency": 311.13, "oscillator": null },
    'E': { "note": 'E0', "frequency": 329.63, "oscillator": null },
    'R': { "note": 'F0', "frequency": 349.23, "oscillator": null },
    '5': { "note": 'F#0/Gb0', "frequency": 369.99, "oscillator": null },
    'T': { "note": 'G0', "frequency": 392.0, "oscillator": null },
    '6': { "note": 'G#0/Ab0', "frequency": 415.3, "oscillator": null },
    'Y': { "note": 'A0', "frequency": 440.0, "oscillator": null },
    '7': { "note": 'A#0/Bb0', "frequency": 466.16, "oscillator": null },
    'U': { "note": 'B0', "frequency": 493.88, "oscillator": null },
    'I': { "note": 'C1', "frequency": 523.25, "oscillator": null },
    '9': { "note": 'C#1/Db1', "frequency": 554.37, "oscillator": null },
    'O': { "note": 'D1', "frequency": 587.33, "oscillator": null },
    '0': { "note": 'D#1/Eb1', "frequency": 622.25, "oscillator": null },
    'P': { "note": 'E1', "frequency": 659.25, "oscillator": null }
};

document.onkeydown = (e) => {
    pressedKeyMap[String(e.key).toUpperCase()] = true;
    document.getElementById("key-view").innerHTML = JSON.stringify(pressedKeyMap);
    if (String(e.key).toUpperCase() in noteMap) {
        let note = noteMap[String(e.key).toUpperCase()]["note"];
        if (!pressedNoteMap[String(note)]) {
            pressedNoteMap[String(note)] = true;
            let osc = audioCtx.createOscillator();
            osc.type = document.getElementById("waveform-select").value;
            osc.frequency.setValueAtTime(noteMap[String(e.key).toUpperCase()]["frequency"], audioCtx.currentTime);
            osc.connect(audioCtx.destination);
            osc.connect(ctxGain).connect(audioCtx.destination);
            if (muted) {
                osc.start();
            }
            noteMap[String(e.key).toUpperCase()]["oscillator"] = osc;
        }
    }
    document.getElementById("pressed-view").innerHTML = JSON.stringify(pressedNoteMap);
};

document.onkeyup = (e) => {
    pressedKeyMap[String(e.key).toUpperCase()] = false;
    document.getElementById("key-view").innerHTML = JSON.stringify(pressedKeyMap);
    if (String(e.key).toUpperCase() in noteMap) {
        let note = noteMap[String(e.key).toUpperCase()]["note"];
        pressedNoteMap[String(note)] = false;
        try {
            noteMap[String(e.key).toUpperCase()]["oscillator"].stop();
        } catch {}
        noteMap[String(e.key).toUpperCase()]["oscillator"] = null;
    }
    document.getElementById("pressed-view").innerHTML = JSON.stringify(pressedNoteMap);
};

document.getElementById("start-stop").onclick = () => {
    muted = !muted; // Initialized to false
    if (muted) {
        for (const key in noteMap) {
            noteMap[key]["oscillator"] = null;
        }
        document.getElementById("start-stop").innerHTML = "Mute Synthesizer";
        document.getElementById("top-header").innerHTML = "In-Browser Synthesizer (UNMUTED)";
    } else {
        for (const key in noteMap) {
            if (noteMap[key]["oscillator"]){
                try {
                    noteMap[key]["oscillator"].stop();
                } catch {
                    return;
                }
            }
            noteMap[key]["oscillator"] = null;
        }
        document.getElementById("start-stop").innerHTML = "Unmute Synthesizer";
        document.getElementById("top-header").innerHTML = "In-Browser Synthesizer (CURRENTLY MUTED)";
    }
};
/*
document.getElementById("gain-slider").oninput = () => {
    document.getElementById("gain-view").innerHTML = document.getElementById("gain-slider").value;
    ctxGain.gain.setValueAtTime(document.getElementById("gain-slider").value, audioCtx.currentTime);
};
*/
window.addEventListener('load', () => {
    try {
        audioCtx = new AudioContext();
        ctxGain = audioCtx.createGain();
        ctxGain.connect(audioCtx.destination);
    } catch (err) {
        alert("The JavaScript Web Audio API is not supported by this browser.");
    }
}, false);