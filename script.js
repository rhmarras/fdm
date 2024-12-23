const instruments = [
    'Kick', 'Snare', 'HiHat', 'HiHat Open',
    'Ride', 'Tom 1', 'Tom 2', 'Floor Tom'
];

const samples = {
    'Kick': 'bass.mp3',
    'Snare': 'snare-drum.mp3',
    'HiHat': 'hihat.mp3',
    'HiHat Open': 'hihat-open.mp3',
    'HiHat Foot': 'hihat-foot.mp3',
    'Ride': 'ride.mp3',
    'Tom 1': 'tom1.mp3',
    'Tom 2': 'tom2.mp3',
    'Floor Tom': 'floor-tom.mp3'
};

let audioCtx;
const sampleCache = new Map();
let sequence = {};
let isPlaying = false;
let currentStep = 0;
let steps = 16;
let intervalId = null;
let lastTap = 0;
let tapCount = 0;
let tapTimes = [];

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

async function loadSample(url) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        return audioBuffer;
    } catch (error) {
        console.error('Error loading sample:', url, error);
        return null;
    }
}

async function initSamples() {
    if (!audioCtx) initAudio();
    for (const [name, url] of Object.entries(samples)) {
        const buffer = await loadSample(url);
        if (buffer) sampleCache.set(name, buffer);
    }
}

function serializePattern() {
    const timeSig = document.getElementById('timeSig').value;
    const tempo = document.getElementById('tempo').value;
    const kit = document.getElementById('kit').value;
    
    // Create a compact representation
    const parts = [timeSig, tempo, kit];
    
    // Serialize sequence more compactly
    instruments.forEach(instrument => {
        const instrumentPattern = sequence[instrument]
            .map(val => val ? (val === 2 ? '2' : '1') : '0')
            .join('');
        parts.push(instrumentPattern);
    });
    
    return parts.join('|');
}

function deserializePattern(encoded) {
    try {
        const parts = encoded.split('|');
        if (parts.length < 3 + instruments.length) return false;
        
        document.getElementById('timeSig').value = parts[0];
        document.getElementById('tempo').value = parts[1];
        document.getElementById('kit').value = parts[2];
        
        // Reconstruct sequence
        instruments.forEach((instrument, index) => {
            sequence[instrument] = parts[index + 3]
                .split('')
                .map(char => {
                    if (char === '0') return false;
                    return char === '2' ? 2 : 1;
                });
        });
        
        return true;
    } catch (e) {
        console.error('Invalid pattern', e);
        return false;
    }
}

function updateShare() {
    const encoded = serializePattern();
    document.getElementById('shareUrl').value = `${location.href.split('?')[0]}?p=${encoded}`;
}

function updateGridLayout() {
    const grid = document.getElementById('grid');
    const beatNumbers = document.querySelector('.beat-numbers');
    const timeSig = parseInt(document.getElementById('timeSig').value);
    const timeSignatures = {
        2: 8,    // 2/4
        3: 12,   // 3/4
        4: 16,   // 4/4
        5: 20,   // 5/4
    };
    steps = timeSignatures[timeSig] || timeSig * 4;
    
    const gridTemplateColumns = `120px repeat(${steps}, 1fr)`;
    grid.style.minWidth = 'min-content';
    beatNumbers.style.gridTemplateColumns = gridTemplateColumns;
    
    document.querySelectorAll('.drum-row').forEach(row => {
        row.style.gridTemplateColumns = gridTemplateColumns;
    });
    
    // Update beat numbers
    const beatNumbersContainer = document.querySelector('.beat-numbers');
    beatNumbersContainer.innerHTML = '<div></div>';
    for (let i = 1; i <= steps; i++) {
        const beatNumber = document.createElement('div');
        beatNumber.className = 'beat-number';
        beatNumber.textContent = i;
        beatNumbersContainer.appendChild(beatNumber);
    }
}

function createGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    const timeSig = parseInt(document.getElementById('timeSig').value);
    steps = timeSig * 4;

    instruments.forEach(instrument => {
        sequence[instrument] = sequence[instrument] || new Array(steps).fill(false);
        if (sequence[instrument].length !== steps) {
            sequence[instrument] = sequence[instrument].slice(0, steps);
        }
        
        const row = document.createElement('div');
        row.className = 'drum-row';
        
        const label = document.createElement('div');
        label.className = 'row-label';
        label.textContent = instrument;
        row.appendChild(label);

        for (let step = 0; step < steps; step++) {
            const cell = document.createElement('button');
            cell.className = 'pattern-cell';
            if (sequence[instrument][step]) {
                cell.classList.add(sequence[instrument][step] === 2 ? 'accent' : 'active');
            }
            cell.onclick = (e) => toggleCell(instrument, step, cell, e.shiftKey);
            row.appendChild(cell);
        }
        grid.appendChild(row);
    });

    updateGridLayout();
    updateShare();
}

function toggleCell(instrument, step, cell, accent) {
    if (!sequence[instrument][step]) {
        sequence[instrument][step] = accent ? 2 : 1;
        cell.classList.add(accent ? 'accent' : 'active');
    } else if (sequence[instrument][step] === 1 && accent) {
        sequence[instrument][step] = 2;
        cell.classList.remove('active');
        cell.classList.add('accent');
    } else {
        sequence[instrument][step] = false;
        cell.classList.remove('active', 'accent');
    }
    updateShare();
    
    const velocity = sequence[instrument][step] === 2 ? 1.5 : 1;
    if (sequence[instrument][step]) createSound(instrument, velocity);
}

function createSound(type, velocity) {
    if (!audioCtx) initAudio();
    
    const kit = document.getElementById('kit').value;
    
    if (kit === 'webaudio') {
        if (sampleCache.has(type)) {
            const source = audioCtx.createBufferSource();
            const gain = audioCtx.createGain();
            source.buffer = sampleCache.get(type);
            gain.gain.value = velocity;
            source.connect(gain);
            gain.connect(audioCtx.destination);
            source.start();
            return;
        }

        // Fallback synthesis
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        switch(type) {
            case 'Kick':
                osc.frequency.setValueAtTime(150, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
                gain.gain.setValueAtTime(velocity, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
                break;
            case 'Snare':
                osc.frequency.setValueAtTime(250, audioCtx.currentTime);
                gain.gain.setValueAtTime(velocity * 0.8, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
                break;
            default:
                osc.frequency.setValueAtTime(200, audioCtx.currentTime);
                gain.gain.setValueAtTime(velocity * 0.5, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        }
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    } else if (kit === '808') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        switch(type) {
            case 'Kick':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(120, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.1);
                gain.gain.setValueAtTime(velocity, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
                break;
            case 'Snare':
                const noise = audioCtx.createBufferSource();
                const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.1, audioCtx.sampleRate);
                const output = noiseBuffer.getChannelData(0);
                for (let i = 0; i < noiseBuffer.length; i++) {
                    output[i] = Math.random() * 2 - 1;
                }
                noise.buffer = noiseBuffer;
                const noiseGain = audioCtx.createGain();
                noiseGain.gain.setValueAtTime(velocity * 0.8, audioCtx.currentTime);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
                noise.connect(noiseGain);
                noiseGain.connect(audioCtx.destination);
                noise.start();
                
                osc.frequency.setValueAtTime(180, audioCtx.currentTime);
                gain.gain.setValueAtTime(velocity * 0.5, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
                break;
            case 'HiHat':
            case 'HiHat Open':
                const filterFreq = type === 'HiHat' ? 8000 : 6000;
                const decayTime = type === 'HiHat' ? 0.1 : 0.3;
                osc.type = 'square';
                osc.frequency.setValueAtTime(filterFreq, audioCtx.currentTime);
                gain.gain.setValueAtTime(velocity * 0.3, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + decayTime);
                break;
            default:
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, audioCtx.currentTime);
                gain.gain.setValueAtTime(velocity * 0.5, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        }
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    }
}

function play() {
    const tempo = document.getElementById('tempo').value;
    const stepTime = (60 / tempo) * 1000 / 4;
    
    intervalId = setInterval(() => {
        if (!isPlaying) return;

        document.querySelectorAll('.pattern-cell').forEach(cell => {
            cell.style.background = '';
        });

        const currentCells = document.querySelectorAll(`.drum-row .pattern-cell:nth-child(${currentStep + 2})`);
        currentCells.forEach((cell, i) => {
            const instrument = instruments[i];
            cell.style.background = '#444';
            
            if (sequence[instrument][currentStep]) {
                const velocity = sequence[instrument][currentStep] === 2 ? 1.5 : 1;
                createSound(instrument, velocity);
            }
        });

        currentStep = (currentStep + 1) % steps;
    }, stepTime);
}

function handleTap() {
    const now = Date.now();
    if (lastTap === 0) {
        lastTap = now;
        tapCount = 1;
        tapTimes = [now];
        return;
    }

    const tapInterval = now - lastTap;
    if (tapInterval > 2000) {
        // Reset if more than 2 seconds between taps
        tapCount = 1;
        tapTimes = [now];
    } else {
        tapCount++;
        tapTimes.push(now);
        if (tapTimes.length > 4) tapTimes.shift();
    }

    lastTap = now;

    if (tapCount >= 4) {
        // Calculate average interval
        let totalInterval = 0;
        for (let i = 1; i < tapTimes.length; i++) {
            totalInterval += tapTimes[i] - tapTimes[i-1];
        }
        const avgInterval = totalInterval / (tapTimes.length - 1);
        const bpm = Math.round(60000 / avgInterval);
        
        // Clamp BPM between 40 and 240
        const clampedBpm = Math.min(Math.max(bpm, 40), 240);
        document.getElementById('tempo').value = clampedBpm;
        
        if (isPlaying) {
            clearInterval(intervalId);
            play();
        }
        updateShare();
    }
}

// Event Listeners
document.getElementById('play').onclick = () => {
    if (!isPlaying) {
        isPlaying = true;
        currentStep = 0;
        play();
    }
};

document.getElementById('stop').onclick = () => {
    isPlaying = false;
    clearInterval(intervalId);
    currentStep = 0;
    document.querySelectorAll('.pattern-cell').forEach(cell => {
        cell.style.background = '';
    });
};

document.getElementById('tempo').onchange = e => {
    const value = Math.min(Math.max(e.target.value, 40), 240);
    e.target.value = value;
    if (isPlaying) {
        clearInterval(intervalId);
        play();
    }
    updateShare();
};

document.getElementById('tapTempo').onclick = handleTap;

document.getElementById('timeSig').onchange = () => {
    createGrid();
    if (isPlaying) {
        clearInterval(intervalId);
        currentStep = 0;
        play();
    }
};

document.getElementById('kit').onchange = () => {
    updateShare();
};

// Initialize
initAudio();
initSamples().then(() => {
    // Check for pattern in URL on initial load
    const urlParams = new URLSearchParams(location.search);
    const patternCode = urlParams.get('p');
    
    if (patternCode) {
        deserializePattern(patternCode);
    }
    
    createGrid();
});