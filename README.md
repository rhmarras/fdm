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
- Offline-compatible [embedded and regular version]

## Development
1. Clone repository
2. Open `index.html` or `single.html` (for embedded) in a modern browser
3. No additional dependencies required

## Sharing Patterns
Pattern URL parameter
- base64 encoded
- contains tracks and positional info as well as kit, tempo and time signature
- example:
  {"timeSig":"3","tempo":"120","sequence":{"Kick":[1,false,false,false,false,false,false,false,null,false],"Snare":[false,false,false,false,1,false,false,false,1],"HiHat":[1,false,false,false,1,false,false,false,1,false],"HiHat Open":[false,false,false,false,false,false,false,false,false],"Ride":[false,false,false,false,false,false,false,false],"Tom 1":[false,false,false,false,false,false,false,false],"Tom 2":[false,false,false,false,false,false,false,false],"Floor Tom":[false,false,false,false,false,false,false,false]}}

## License
Apache v2.0 license
