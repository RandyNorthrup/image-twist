# Image Twist

Image Twist is a zero-dependency browser app for turning a loaded image into playful generated variations. It is not a manual image editor: there are no sliders, layers, masks, crop tools, or per-effect tuning controls.

## Current Behavior

1. The app starts with a generated sample image.
2. A user can load a local image with the file picker or drag/drop.
3. Loaded images are shown as `Original` first. No twist is applied automatically on load.
4. The dropdown chooses which named twist recipe will run.
5. The `Twist` button applies the selected dropdown recipe.
6. `Auto Party` repeatedly runs random twist recipes.
7. Changing the dropdown while `Auto Party` is active turns `Auto Party` off.
8. `Download PNG` exports the currently visible canvas.

## Twist Recipes

There are 25 recipes:

- Candy Portal
- Glitch Carnival
- Comic Blast
- Arcade Night
- Heatwave Poster
- Pixel Popcorn
- Mirror Maze
- ASCII Dream
- Retro Booth
- Mosaic Party
- Kaleido Soda
- Prism Rain
- Sticker Bomb
- VHS Ghost
- Solar Flare
- Blueprint Beam
- Bubble Wrap
- Paint Splash
- Slice Shuffle
- Dream Bloom
- Xerox Jam
- Glass Blocks
- Rainbow Tunnel
- Poster Punch
- Frosted Lens

Recipes combine hidden effects such as glitch shifts, neon edge detection, swirl warping, comic posterizing, pixel blocks, halftone dots, ASCII texture, mirror folds, mosaic tiles, kaleidoscope slices, prism bands, stickers, light leaks, blueprint edges, bubbles, glass blocks, scanlines, bursts, paint splats, bloom, noise, and confetti.

## Technical Notes

- Local image loading uses the browser File API through a file input and drag/drop events.
- Image decoding uses `createImageBitmap` when available, with an `Image` object fallback.
- Images are drawn to a 2D canvas with `drawImage`.
- The loaded source image data is stored so each twist can be generated from the original source rather than stacking on top of the previous twist.
- Pixel-based effects use `getImageData`, `ImageData`, and `putImageData`.
- The app does not depend on `CanvasRenderingContext2D.filter` for its core effects.
- PNG export uses `HTMLCanvasElement.toBlob`.

## Run

Open `index.html` in a browser. No build step or package install is required.
