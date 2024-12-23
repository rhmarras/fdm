# fdm
Free Drum Machine - Take your grooves everywhere!

## Features
- Interactive drum pattern sequencer
- Multiple time signatures (2/4, 3/4, 4/4, 5/4)
- Two sound kits (Web Audio and TR-808)
- Tempo control with tap tempo
- Pattern sharing via URL

## Usage
1. Click grid cells to create patterns
    - Single click: Activate note
    - Shift-click: Create accent note
2. Use play/stop buttons to control playback
3. Adjust tempo manually or use tap tempo
4. Select time signature and sound kit
5. Share patterns using the generated URL

## Technical Details
- Web Audio API for sound generation
- Vanilla JavaScript implementation
- Responsive design
- Offline-compatible

## Development
1. Clone repository
2. Open `index.html` in a modern browser
3. No additional dependencies required

## Sharing Patterns
Pattern URL format: `?p=timeSig|tempo|instrument_patterns`
- First value: Time signature
- Second value: Tempo
- Subsequent values: Instrument note patterns (0=off, 1=on, 2=accent)

## License
MIT License