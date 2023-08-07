var audioCtx: AudioContext | undefined = undefined;
var ctxGain: GainNode | undefined = undefined;
var distortion: WaveShaperNode | undefined = undefined;
var muted: boolean = false;

type Note = {
    name: string;
    frequency: number;
    oscillator: OscillatorNode | undefined;
}

var c0: Note = { name: 'C4', frequency: 261.63, oscillator: undefined };
var cs0: Note = { name: 'C#4/Db4', frequency: 277.18, oscillator: undefined };
var d0: Note = { name: 'D4', frequency: 293.66, oscillator: undefined };
var ds0: Note = { name: 'D#4/Eb4', frequency: 311.13, oscillator: undefined };
var e0: Note = { name: 'E4', frequency: 329.63, oscillator: undefined };
var f0: Note = { name: 'F4', frequency: 349.23, oscillator: undefined };
var fs0: Note = { name: 'F#4/Gb4', frequency: 369.99, oscillator: undefined };
var g0: Note = { name: 'G4', frequency: 392.0, oscillator: undefined };
var gs0: Note = { name: 'G#4/Ab4', frequency: 415.3, oscillator: undefined };
var a0: Note = { name: 'A4', frequency: 440.0, oscillator: undefined };
var as0: Note = { name: 'A#4/Bb4', frequency: 466.16, oscillator: undefined };
var b0: Note = { name: 'B4', frequency: 493.88, oscillator: undefined };
var c1: Note = { name: 'C5', frequency: 523.25, oscillator: undefined };
var cs1: Note = { name: 'C#5/Db5', frequency: 554.37, oscillator: undefined };
var d1: Note = { name: 'D5', frequency: 587.33, oscillator: undefined };
var ds1: Note = { name: 'D#5/Eb5', frequency: 622.25, oscillator: undefined };
var e1: Note = { name: 'E5', frequency: 659.25, oscillator: undefined };

interface NoteMap {
    [key: string]: Note;
}

const noteMap: NoteMap = {
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
}

interface keyMap {
    [key: string]: boolean;
}

var pressedKeyMap: keyMap = {};
var pressedNoteMap: keyMap = {};

document.onkeydown = (e) => {
    let keyStr: string = String(e.key).toUpperCase();
    pressedKeyMap[keyStr] = true;
    document.getElementById("key-view")!.innerHTML = JSON.stringify(pressedKeyMap);
    if (keyStr in noteMap) {
        let noteStr: string = noteMap[keyStr].name;
        if (!pressedNoteMap[noteStr]) {
            pressedNoteMap[noteStr] = true;
            let osc: OscillatorNode = audioCtx!.createOscillator();
            const selectElement = <HTMLSelectElement>document.getElementById("waveform-select")!;
            osc.type = <OscillatorType>selectElement.value;
            osc.frequency.setValueAtTime(noteMap[keyStr].frequency, audioCtx!.currentTime);
            osc.connect(ctxGain!).connect(audioCtx!.destination);
            const distOnOff = <HTMLInputElement>document.getElementById('distortion-on-off');
            if (distOnOff.checked) {
                osc.connect(distortion!).connect(audioCtx!.destination);
            }
            if (muted) {
                osc.start();
            }
            noteMap[keyStr].oscillator = osc;
        }
    }
    document.getElementById("pressed-view")!.innerHTML = JSON.stringify(pressedNoteMap);
}

document.onkeyup = (e) => {
    let keyStr: string = String(e.key).toUpperCase();
    pressedKeyMap[keyStr] = false;
    document.getElementById("key-view")!.innerHTML = JSON.stringify(pressedKeyMap);
    if (keyStr in noteMap) {
        let noteStr: string = noteMap[keyStr].name;
        pressedNoteMap[noteStr] = false;
        try {
            noteMap[keyStr].oscillator?.stop();
        } catch {}
        noteMap[keyStr].oscillator = undefined;
    }
    document.getElementById("pressed-view")!.innerHTML = JSON.stringify(pressedNoteMap);
}

function handleClick(): void {
    muted = !muted;
    if (muted) {
        for (const key in noteMap) {
            noteMap[key].oscillator = undefined;
        }
        document.getElementById("start-stop")!.innerHTML = "Mute Synthesizer";
        document.getElementById("top-header")!.innerHTML = "In-Browser Synthesizer (UNMUTED; PRESS ANY KEY TO PLAY)";
    } else {
        for (const key in noteMap) {
            if (noteMap[key].oscillator) {
                noteMap[key].oscillator!.stop();
            }
            noteMap[key].oscillator = undefined;
        }
        document.getElementById("start-stop")!.innerHTML = "Unmute Synthesizer";
        document.getElementById("top-header")!.innerHTML = "In-Browser Synthesizer (CURRENTLY MUTED)";
    }
}

document.getElementById('gain-slider')?.addEventListener('input', function() {
    let slider = <HTMLInputElement>document.getElementById('gain-slider');
    let val: number = slider.valueAsNumber;
    ctxGain?.gain.setValueAtTime(val, audioCtx?.currentTime || 0);
    document.getElementById("gain-view")!.innerHTML = val.toString();
});

document.getElementById('distortion-on-off')?.addEventListener('change', function() {
    const distOnOff = <HTMLInputElement>document.getElementById('distortion-on-off');
    const isDistortionOn: boolean = distOnOff.checked;

    for (const key in noteMap) {
        if (noteMap[key]?.oscillator !== undefined) {
            if (isDistortionOn) {
                noteMap[key].oscillator?.connect(distortion!).connect(audioCtx!.destination);
            } else {
                noteMap[key].oscillator?.disconnect(distortion!);
            }
        }
    }
    /*
    if (!distOnOff.checked) { // Distortion Turned On
        distOnOff.checked = true;
        for (const key in noteMap) {
            if (noteMap[key]?.oscillator !== undefined) {
                noteMap[key].oscillator?.connect(distortion!).connect(audioCtx!.destination);
            }
        }
    } else {
        distOnOff.checked = false;
        for (const key in noteMap) {
            if (noteMap[key]?.oscillator !== undefined) {
                noteMap[key].oscillator?.disconnect(distortion!);
            }
        }
    } */
});

function getDistortionCurve(amount?: number): Float32Array {
    const k: number = typeof amount === "number" ? amount : 50;
    const n_samples: number = 44100;
    const curve: Float32Array = new Float32Array(n_samples);
    const deg: number = Math.PI / 180;
    for (let i = 0; i < n_samples; i++) {
        const x: number = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
}

document.getElementById('distortion-amount-slider')?.addEventListener('input', function() {
    let slider = <HTMLInputElement>document.getElementById('distortion-amount-slider');
    let val: number = slider.valueAsNumber;
    distortion!.curve = getDistortionCurve(val);
    document.getElementById("distortion-amount-view")!.innerHTML = val.toString();
});

window.addEventListener('load', function() {
    try {
        audioCtx = new AudioContext();
        ctxGain = audioCtx.createGain();
        ctxGain.connect(audioCtx.destination);
        let gainSlider = <HTMLInputElement>document.getElementById('gain-slider');
        gainSlider.value = String(0.05);
        distortion = audioCtx.createWaveShaper();
        distortion.curve = getDistortionCurve(400);
        distortion.oversample = <OverSampleType>"2x";
        distortion.connect(audioCtx.destination);
        let distortionAmntSlider = <HTMLInputElement>document.getElementById('distortion-amount-slider');
        distortionAmntSlider.value = String(400);
        document.getElementById('distortion-on-off-view')!.innerHTML = "Off";
    } catch (err) {
        alert("The JavaScript Web Audio API is not supported by this browser.");
    }
}, false);