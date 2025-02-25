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
const failedSamples = [];
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
        if (buffer) {
            sampleCache.set(name, buffer);
        } else {
            failedSamples.push(name);
        }
    }
}

function serializePattern() {
    const timeSig = document.getElementById('timeSig').value;
    const tempo = document.getElementById('tempo').value;
    const kit = document.getElementById('kit').value;

    // Debugging logs in serializePattern
    console.log('Serialize Pattern - Time Sig:', timeSig, 'Tempo:', tempo, 'Kit:', kit);

    const parts = [timeSig, tempo, kit];

    instruments.forEach(instrument => {
        const instrumentPattern = sequence[instrument]
            .map(val => val ? (val === 2 ? '2' : '1') : '0')
            .join('');
        console.log('Serialize Pattern - Instrument:', instrument, 'Pattern:', instrumentPattern, 'Length:', instrumentPattern.length);
        parts.push(instrumentPattern);
    });

    return parts.join('|');
}

function deserializePattern(patternString) {
    try {
        const parts = patternString.split('|');
        if (parts.length !== 3 + instruments.length) {
            console.error('Invalid pattern format: Incorrect number of parts');
            return false;
        }

        const [timeSig, tempo, kit, ...instrumentPatterns] = parts;

        if (!['2', '3', '4', '5'].includes(timeSig)) {
            console.error('Invalid time signature:', timeSig);
            return false;
        }
        if (isNaN(parseInt(tempo, 10)) || parseInt(tempo, 10) <= 0) {
            console.error('Invalid tempo:', tempo);
            return false;
        }
        if (!['webaudio', '808'].includes(kit)) {
            console.error('Invalid kit:', kit);
            return false;
        }


        document.getElementById('timeSig').value = timeSig;
        document.getElementById('tempo').value = tempo;
        document.getElementById('kit').value = kit;
        updateGridLayout();


        instruments.forEach((instrument, index) => {
            const pattern = instrumentPatterns[index];
            if (pattern.length !== steps) {
                console.error(`Pattern length mismatch for ${instrument}: Expected ${steps}, got ${pattern.length}`);
                throw new Error(`Pattern length mismatch for ${instrument}: Expected ${steps}, got ${pattern.length}`);
            }
            sequence[instrument] = pattern.split('').map(p => {
                switch (p) {
                    case '1': return 1;
                    case '2': return 2;
                    case '0': return false;
                    default:
                        console.error('Invalid pattern character:', p);
                        return false;
                }
            });
        });

        // Update UI controls
        document.getElementById('timeSig').value = timeSig;
        document.getElementById('tempo').value = tempo;
        document.getElementById('kit').value = kit;

        console.log('Final sequence:', sequence);
        return true;
    } catch (e) {
        console.error('Pattern parsing error:', e);
        return false;
    }
}

function updateShare() {
    const encoded = serializePattern();
    document.getElementById('shareUrl').value = `${location.href.split('?')[0]}?p=${encoded}`;
}

const timeSignatures = {
    2: 8,    // 2/4
    3: 12,   // 3/4
    4: 16,   // 4/4
    5: 20,   // 5/4
};

function updateGridLayout() {
    const grid = document.getElementById('grid');
    const beatNumbers = document.querySelector('.beat-numbers');
    const timeSig = parseInt(document.getElementById('timeSig').value);
    steps = timeSignatures[timeSig];
    
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
    steps = timeSignatures[timeSig];

    // Initialize sequence if it doesn't exist
    if (!sequence || Object.keys(sequence).length === 0) {
        sequence = {};
        instruments.forEach(instrument => {
            sequence[instrument] = new Array(steps).fill(false);
        });
    }

    instruments.forEach(instrument => {
        // Ensure sequence exists for this instrument
        if (!sequence[instrument]) {
            sequence[instrument] = new Array(steps).fill(false);
        }
        // Adjust sequence length if needed
        if (sequence[instrument].length !== steps) {
            sequence[instrument] = sequence[instrument].slice(0, steps);
            while (sequence[instrument].length < steps) {
                sequence[instrument].push(false);
            }
        }

        // Create row
        const row = document.createElement('div');
        row.className = failedSamples.includes(instrument) ? 'drum-row drum-row-disabled' : 'drum-row';
        
        const label = document.createElement('div');
        label.className = 'row-label';
        label.textContent = instrument;
        row.appendChild(label);

        // Create cells
        for (let step = 0; step < steps; step++) {
            const cell = document.createElement('button');
            cell.className = 'pattern-cell';
            if (failedSamples.includes(instrument)) {
                cell.disabled = true;
            }
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
        // WebAudio Kit - Uses pre-loaded audio samples
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
        // 808 Kit - Uses synthesized sounds
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

// Add Local Storage Functions
function saveToLocalStorage(name) {
    const pattern = serializePattern();
    const savedPatterns = JSON.parse(localStorage.getItem('drumPatterns') || '{}');
    savedPatterns[name] = pattern;
    localStorage.setItem('drumPatterns', JSON.stringify(savedPatterns));
    updateSavedPatternslist();
}

function loadFromLocalStorage(name) {
    const savedPatterns = JSON.parse(localStorage.getItem('drumPatterns') || '{}');
    const pattern = savedPatterns[name];
    if (pattern && deserializePattern(pattern)) {
        createGrid();
        
        // Update tempo if playing
        if (isPlaying) {
            clearInterval(intervalId);
            play();
        }

        return true;
    }
    return false;
}

function updateSavedPatternslist() {
    const select = document.getElementById('savedPatterns');
    const savedPatterns = JSON.parse(localStorage.getItem('drumPatterns') || '{}');
    select.innerHTML = '<option value="">Load saved pattern...</option>';
    Object.keys(savedPatterns).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

// File Storage Functions
function exportToFile() {
    const pattern = serializePattern();
    const blob = new Blob([pattern], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drum-pattern.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function deleteFromLocalStorage(name) {
    const savedPatterns = JSON.parse(localStorage.getItem('drumPatterns') || '{}');
    delete savedPatterns[name];
    localStorage.setItem('drumPatterns', JSON.stringify(savedPatterns));
    updateSavedPatternslist();
}

function importFromFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const pattern = e.target.result.trim();
        if (deserializePattern(pattern)) {
            createGrid();
        } else {
            alert('Invalid pattern file');
        }
    };
    reader.readAsText(file);
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

document.getElementById('clear').onclick = () => {
    clearGrid();
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

document.getElementById('savePattern').onclick = () => {
    const name = prompt('Enter pattern name:');
    if (name) saveToLocalStorage(name);
};

document.getElementById('savedPatterns').onchange = (e) => {
    if (e.target.value) loadFromLocalStorage(e.target.value);
};

document.getElementById('exportPattern').onclick = exportToFile;

document.getElementById('deletePattern').onclick = () => {
    const name = document.getElementById('savedPatterns').value;
    if (name && confirm(`Are you sure you want to delete "${name}"?`)) {
        deleteFromLocalStorage(name);
    }
};

document.getElementById('importPattern').onchange = (e) => {
    if (e.target.files.length > 0) {
        importFromFile(e.target.files[0]);
    }
};

// Initialize
initAudio();
let initialPattern = null;

// Store URL pattern first
const urlParams = new URLSearchParams(location.search);
const patternCode = urlParams.get('p');
if (patternCode) {
    initialPattern = patternCode;
}

// Initialize samples and then apply pattern
initSamples().then(() => {
    if (initialPattern) {
        if (deserializePattern(initialPattern)) {
            createGrid();
        }
    } else {
        createGrid();
    }
    updateGridLayout(); // Add this line to ensure steps is updated
    updateSavedPatternslist();
}).catch(error => {
    console.error('Error initializing samples:', error);
    // Still create grid even if samples fail to load
    if (initialPattern) {
        if (deserializePattern(initialPattern)) {
            createGrid();
        }
    } else {
        createGrid();
    }
    updateGridLayout(); // Add this line to ensure steps is updated
    updateSavedPatternslist();
});

function clearGrid() {
    instruments.forEach(instrument => {
        sequence[instrument] = new Array(steps).fill(false);
    });
    createGrid();
    updateShare();
}
