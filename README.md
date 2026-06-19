# Image Twist

Image Twist is a local browser app for applying visual twist effects to an image and exporting the result as a PNG.

## Features

- Built-in sample image on first load.
- Local image upload with file picker or drag and drop.
- `Original` state before any effect is applied.
- 110 selectable single-effect twists.
- Immediate effect application from the `Choose twist` dropdown.
- `Twist` button for applying a selected effect or choosing a different random effect.
- `Strength` slider from near-original to full effect.
- `Auto Party` mode for cycling through random effects.
- PNG export from the current canvas.
- Browser-only image processing; selected images stay local.

## Twist Library

The twist library contains 110 effects across these effect families:

- Color and tone
- Gradient maps
- Channel effects
- Posterize and threshold effects
- Blur, sharpen, edge, and convolution filters
- Geometry distortions
- Light and surface overlays
- Texture, pattern, and dither effects

Example effects include `Cyanotype`, `Emboss`, `Water Ripple`, `Ordered Dither`, and `CRT Mask`.

## Setup

No install or build step is required.

1. Download or clone this folder.
2. Open `index.html` in a modern browser.
3. Use the app locally.

## How To Use

1. Open `index.html`.
2. Use the sample image, drop an image onto `Drop image`, or choose an image file.
3. Pick an effect from `Choose twist`, or press `Twist` for a random effect.
4. Move `Strength` left for a result closer to `Original`, or right for the full effect.
5. Press `Auto Party` to cycle through random effects.
6. Press `Download PNG` to save the current image.

## Controls

- `Choose twist`: applies the selected effect immediately.
- `Twist`: applies the selected effect, or chooses a different random effect when the selected effect is already visible.
- `Strength`: adjusts the current effect from near-original to full effect.
- `Auto Party`: starts or stops random effect cycling.
- `Download PNG`: saves the visible canvas as a PNG.

## Notes

- Effects always render from the original source image.
- The dropdown starts on `Original`.
- `Strength` changes are live for the current effect.
