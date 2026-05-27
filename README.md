# cat-CRANE

A small mobile-first browser game about smooth crane operation. A helmeted cat stands on a hanging steel beam and points ahead while you carry the load across a wide industrial yard without letting it swing too far.

## Play

Open `index.html` in a browser, or publish the repository with GitHub Pages.

The title screen offers a notch-operation tutorial and stage select. Stage 1 is currently playable, while stages 2-20 are placeholders for future production.

The crane starts with a steel beam already hanging from the hook. Press a direction only while you want the crane to move that way, then release to coast. Keep the load steady while moving right toward a faraway goal. The camera follows the trolley through a factory and port-side backdrop. If the swing angle becomes too large, the steel beam and cat are thrown off and the run is over.

Controls:

- Right / Left: accelerate the trolley horizontally.
- Up / Down: raise or lower the steel beam.
- Releasing every direction coasts.
- Keyboard: arrow keys or `W`, `A`, `S`, `D`.

## Files

- `index.html` - game shell and controls.
- `styles.css` - responsive mobile layout.
- `main.js` - canvas game loop, pendulum swing physics, goal logic, and drawing.
- `.github/workflows/deploy-pages.yml` - GitHub Pages deployment workflow.
