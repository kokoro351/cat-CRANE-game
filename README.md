# cat-CRANE

A small mobile-first browser game about smooth crane operation. Carry the cat to the goal without letting the load swing too far.

## Play

Open `index.html` in a browser, or publish the repository with GitHub Pages.

The crane starts with a cat already hanging from the hook. Press a direction only while you want the crane to move that way, then release to coast. Keep the load steady while moving right toward the goal. If the swing angle becomes too large, the cat falls and the run is over.

Controls:

- Right / Left: accelerate the trolley horizontally.
- Up / Down: raise or lower the hanging cat.
- Releasing every direction coasts.
- Keyboard: arrow keys or `W`, `A`, `S`, `D`.

## Files

- `index.html` - game shell and controls.
- `styles.css` - responsive mobile layout.
- `main.js` - canvas game loop, pendulum swing physics, goal logic, and drawing.
- `.github/workflows/deploy-pages.yml` - GitHub Pages deployment workflow.
