# cat-CRANE

A small mobile-first browser game about smooth crane operation. Carry the cat to the goal without letting the load swing too far.

## Play

Open `index.html` in a browser, or publish the repository with GitHub Pages.

The crane starts with a cat already hanging from the hook. Use short acceleration notches, coast, and brake timing to keep the load steady while moving right. If the swing angle becomes too large, the cat falls and the run is over.

Controls:

- Notch: accelerate the crane to the right.
- Coast: stop powering and let the crane settle.
- Brake: slow the crane down.
- Keyboard: `Space`, `ArrowRight`, or `D` for Notch. `ArrowDown` or `S` for Brake.

## Files

- `index.html` - game shell and controls.
- `styles.css` - responsive mobile layout.
- `main.js` - canvas game loop, pendulum swing physics, goal logic, and drawing.
- `.github/workflows/deploy-pages.yml` - GitHub Pages deployment workflow.
