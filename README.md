# fdm - Free Drum Machine

Take your grooves everywhere with fdm, a powerful and intuitive web-based drum machine!

## Features

-   **Interactive Drum Pattern Sequencer:** Create intricate rhythms by clicking on a grid to activate or deactivate drum hits.
-   **Accent Notes:** Add emphasis to your beats by creating accent notes with Shift-click.
-   **Multiple Time Signatures:** Experiment with different rhythmic feels using 2/4, 3/4, 4/4, and 5/4 time signatures.
-   **Two Sound Kits:** Choose between a classic Web Audio sound set or the iconic TR-808 kit.
-   **Tempo Control:** Adjust the playback speed using the manual tempo control, or use the tap tempo feature to match your groove.
-   **Pattern Sharing via URL:** Easily share your creations with others using a unique, URL-encoded representation of your drum pattern.
-   **Dark Theme:** Enjoy a sleek, modern dark theme for a visually comfortable experience.
-   **Responsive Design:** Works flawlessly on various screen sizes, from desktop computers to mobile phones.
-   **Offline-Compatible:** Use the embedded or regular versions, even without an internet connection.
- **Drum row enable/disable:** you can disable some drum rows, if needed.
- **Storage and File support:** there is a support for storage and file operations.

## Usage

1.  **Create Patterns:** Click on individual grid cells within a drum row to activate or deactivate a beat for that drum sound.
    -   **Single Click:** Activates a regular note.
    -   **Shift-Click:** Activates an accent note (louder hit).
2.  **Playback Control:** Use the "Play" and "Stop" buttons to start and stop the drum loop.
3.  **Tempo Adjustment:**
    -   **Manual:** Set the beats per minute (BPM) using the tempo control.
    -   **Tap Tempo:** Tap a button to set the tempo by measuring your taps.
4.  **Time Signature:** Select the desired time signature (2/4, 3/4, 4/4, 5/4) from the dropdown menu.
5.  **Sound Kit:** Choose your preferred drum kit (Web Audio or TR-808).
6. **Drum Row Enable/Disable:** You can disable some drum rows, if needed, to mute the sound.
7.  **Share Patterns:** Click share button to generate a URL that contains your pattern settings. Share that URL with others.

## Technical Details

-   **Web Audio API:** Utilizes the Web Audio API for precise sound generation and manipulation.
-   **Vanilla JavaScript:** The application is built using vanilla JavaScript, with no external frameworks.
-   **CSS Grid:** Leverages CSS Grid for a flexible and responsive layout.
-   **CSS Variables:** Employs CSS variables for a consistent and maintainable dark theme.
-   **Modular CSS:** Uses well-structured CSS with clear class names for easy customization.
-   **Responsive Design:** Designed to be responsive and adapt to different screen sizes.
-   **Offline-Compatibility:** Can be used offline, in the embedded or regular version.

## Development

1.  **Clone Repository:** `git clone [repository URL]`
2.  **Open in Browser:** Open `index.html` (full version) or `single.html` (embedded version) in a modern web browser.
3.  **No Dependencies:** No external dependencies or build steps are required.

## Sharing Patterns

-   **Pattern URL Parameter:** The drum pattern, tempo, time signature and kit are encoded in the URL.
    -   **Encoding:** The pattern data is encoded using Base64.
    -   **Content:** The encoded data contains the following information:
        -   `timeSig`: Time signature (e.g., "3" for 3/4).
        -   `tempo`: Tempo in beats per minute (BPM).
        -   `sequence`: An object containing the drum tracks (e.g., "Kick", "Snare", "HiHat") and their pattern data. Each track contains an array of note states.
            -   `1`: Regular note.
            -   `2`: Accent note.
            -   `false`: Inactive.
            -   `null`: inactive.
    -   **Example:**
        ```json
        {"timeSig":"3","tempo":"120","sequence":{"Kick":[1,false,false,false,false,false,false,false,null,false],"Snare":[false,false,false,false,1,false,false,false,1],"HiHat":[1,false,false,false,1,false,false,false,1,false],"HiHat Open":[false,false,false,false,false,false,false,false,false],"Ride":[false,false,false,false,false,false,false,false],"Tom 1":[false,false,false,false,false,false,false,false],"Tom 2":[false,false,false,false,false,false,false,false],"Floor Tom":[false,false,false,false,false,false,false,false]}}
        ```
- Url encoded data may contain more than one item.

## License

Apache v2.0 License
