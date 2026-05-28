# cat-CRANE

A small mobile-first browser game about smooth crane operation. A helmeted cat stands on a hanging steel beam and points ahead while you carry the load across a wide industrial yard without letting it swing too far.

## Play

Open `index.html` in a browser, or publish the repository with GitHub Pages.

The title screen offers a notch-operation tutorial and stage select. The game currently uses 10 playable stages, all available from the start. Clearing every stage unlocks the ending.

The crane starts with a steel beam already hanging from the hook. Press a direction only while you want the crane to move that way, then release to coast. Keep the load steady while moving right toward a faraway goal. The camera follows the trolley through a factory and port-side backdrop. If the swing angle becomes too large, the steel beam and cat are thrown off and the run is over.

Controls:

- Right / Left: accelerate the trolley horizontally.
- Up / Down: raise or lower the steel beam.
- Releasing every direction coasts.
- Keyboard: arrow keys or `W`, `A`, `S`, `D`.

## Android

The Android wrapper uses Capacitor.

- `npm run prepare:web` copies the browser game into `www/`.
- `npm run sync:android` updates the Android project after game changes.
- `npm run build:android:debug` creates a local debug APK.
- `npm run build:android:bundle` creates a release AAB for Play Console signing setup.
- `npm run open:android` opens the Android project in Android Studio.

## Files

- `index.html` - game shell and controls.
- `styles.css` - responsive mobile layout.
- `main.js` - canvas game loop, pendulum swing physics, goal logic, and drawing.
- `capacitor.config.json` - Android app id, app name, and web asset path.
- `.github/workflows/deploy-pages.yml` - GitHub Pages deployment workflow.
