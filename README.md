# Image Twist

Image Twist is a browser app for turning an image into generated visual twists. Load an image, choose a twist, adjust strength, and download the result as a PNG.

## Features

- Starts with a built-in sample image so the app is usable immediately.
- Loads local images with file picker or drag and drop.
- Shows loaded images as `Original` first before applying effects.
- Offers 125 named twist recipes.
- Applies dropdown selections immediately.
- Keeps `Twist` from repeating the same visible recipe.
- Adjusts twist strength live with a smooth slider.
- Runs `Auto Party` to cycle through random twist recipes.
- Exports the current canvas as a PNG.
- Runs entirely in the browser with no upload step.

## Twist Library

Image Twist includes 25 base recipe families, each with four extra variants:

- `Neon Edge + Chroma Wave`
- `Prism Bands + Light Leaks`
- `Pixel Blocks + Noise Snow`
- `Mirror Fold + Burst Rays`

Recipe names describe the effect chain, such as `Duotone Swirl Confetti`, `Comic Halftone Burst`, or `Glass Blocks Soft Bloom Bubbles`.

## Setup

No install is required.

1. Download or clone this folder.
2. Open `index.html` in a modern browser.
3. Use the app locally.

## How To Use

1. Open `index.html`.
2. Use the sample image, drop an image onto `Drop image`, or choose an image file.
3. Pick a twist from `Choose twist`.
4. Move the `Strength` slider to reduce or increase the current twist.
5. Press `Twist` to jump to another twist.
6. Press `Auto Party` to cycle through random twists.
7. Press `Download PNG` to save the visible result.

## Controls

- `Choose twist`: applies the selected recipe immediately.
- `Twist`: applies the selected recipe, or chooses a different one if it is already showing.
- `Strength`: adjusts the current twist live while keeping the same random seed for smoother changes.
- `Auto Party`: repeatedly applies random recipes until turned off.
- `Download PNG`: saves the current canvas.

## Notes

- Images stay local in the browser.
- Each twist is generated from the original image, not stacked on top of the previous twist.
- The dropdown shows `Original` before any twist is selected.
