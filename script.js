const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const refs = {
  imageInput: document.querySelector("#imageInput"),
  dropZone: document.querySelector("#dropZone"),
  recipeName: document.querySelector("#recipeName"),
  twistSelect: document.querySelector("#twistSelect"),
  statusLine: document.querySelector("#statusLine"),
  twistAgain: document.querySelector("#twistAgain"),
  autoParty: document.querySelector("#autoParty"),
  downloadImage: document.querySelector("#downloadImage"),
  strengthInput: document.querySelector("#strengthInput"),
};

const MAX_SIDE = 2100;
const STRENGTH_MIN = 0;
const STRENGTH_MAX = 100;
const MIN_EFFECT_BLEND = 0.02;
const TRANSFORM_AMOUNT_FLOOR = 0.2;
const TRANSFORM_AMOUNT_JITTER = 0.08;
const TWIST_PLACEHOLDER_VALUE = "";
const TWIST_PLACEHOLDER_LABEL = "Original";

const state = {
  source: null,
  fileName: "image-twist",
  currentRecipe: null,
  autoTimer: null,
  isRendering: false,
  seed: 1,
  strength: 1,
  strengthFrame: null,
  queuedStrengthRender: false,
};

const RECIPE_TITLE_MAX_SIZE = 36;
const RECIPE_TITLE_MIN_SIZE = 15;

const effectCatalog = [
  { id: "color-pop", name: "Color Pop", accent: "#ff6fbc", amount: 0.86, type: "direct", handler: popColor },
  { id: "duotone", name: "Duotone", accent: "#40c9c6", amount: 0.9, type: "direct", handler: duotone },
  { id: "heat-map", name: "Heat Map", accent: "#ff6f59", amount: 0.9, type: "direct", handler: heatMap },
  { id: "old-photo", name: "Old Photo", accent: "#c59b62", amount: 0.88, type: "direct", handler: oldPhoto },
  { id: "night-vision", name: "Night Vision", accent: "#29ff72", amount: 0.86, type: "direct", handler: nightVision },
  { id: "comic", name: "Comic", accent: "#ffd447", amount: 0.82, type: "direct", handler: comic },
  { id: "neon-edge", name: "Neon Edge", accent: "#40c9c6", amount: 0.82, type: "direct", handler: neonEdge },
  { id: "glitch", name: "Glitch", accent: "#ff6f59", amount: 0.74, type: "direct", handler: glitch },
  { id: "pixel-blocks", name: "Pixel Blocks", accent: "#c7f464", amount: 0.78, type: "direct", handler: pixelate },
  { id: "halftone", name: "Halftone", accent: "#ffd447", amount: 0.68, type: "direct", handler: halftone },
  { id: "ascii-art", name: "ASCII Art", accent: "#c7f464", amount: 0.72, type: "direct", handler: ascii },
  { id: "mirror-fold", name: "Mirror Fold", accent: "#7c65ff", amount: 0.7, type: "direct", handler: mirrorFold },
  { id: "swirl", name: "Swirl", accent: "#7c65ff", amount: 0.72, type: "direct", handler: swirl },
  { id: "mosaic", name: "Mosaic", accent: "#40c9c6", amount: 0.76, type: "direct", handler: mosaic },
  { id: "kaleidoscope", name: "Kaleidoscope", accent: "#7c65ff", amount: 0.76, type: "direct", handler: kaleidoscope },
  { id: "prism-bands", name: "Prism Bands", accent: "#ff9de2", amount: 0.76, type: "direct", handler: prismBands },
  { id: "chroma-wave", name: "Chroma Wave", accent: "#40c9c6", amount: 0.78, type: "direct", handler: chromaWave },
  { id: "rainbow-bands", name: "Rainbow Bands", accent: "#ff6fbc", amount: 0.82, type: "direct", handler: rainbowBands },
  { id: "light-leaks", name: "Light Leaks", accent: "#ff9de2", amount: 0.76, type: "direct", handler: lightLeaks },
  { id: "stickers", name: "Stickers", accent: "#ffd447", amount: 0.76, type: "direct", handler: stickers },
  { id: "ghost-trail", name: "Ghost Trail", accent: "#ff6f59", amount: 0.72, type: "direct", handler: ghostTrail },
  { id: "solarize", name: "Solarize", accent: "#ffb000", amount: 0.82, type: "direct", handler: solarize },
  { id: "blueprint", name: "Blueprint", accent: "#2f80ed", amount: 0.82, type: "direct", handler: blueprint },
  { id: "grid-overlay", name: "Grid Overlay", accent: "#fffdf7", amount: 0.64, type: "direct", handler: gridOverlay },
  { id: "glass-blocks", name: "Glass Blocks", accent: "#9ee8ff", amount: 0.72, type: "direct", handler: glassBlocks },
  { id: "bubbles", name: "Bubbles", accent: "#40c9c6", amount: 0.78, type: "direct", handler: bubbles },
  { id: "paint-splats", name: "Paint Splats", accent: "#ff6f59", amount: 0.78, type: "direct", handler: paintSplats },
  { id: "slice-shuffle", name: "Slice Shuffle", accent: "#c7f464", amount: 0.78, type: "direct", handler: sliceShuffle },
  { id: "soft-bloom", name: "Soft Bloom", accent: "#ff9de2", amount: 0.76, type: "direct", handler: softBloom },
  { id: "xerox", name: "Xerox", accent: "#17191c", amount: 0.82, type: "direct", handler: xerox },
  { id: "noise-snow", name: "Noise Snow", accent: "#fffdf7", amount: 0.7, type: "direct", handler: noiseSnow },
  { id: "poster-punch", name: "Poster Punch", accent: "#ff6f59", amount: 0.78, type: "direct", handler: posterPunch },
  { id: "confetti", name: "Confetti", accent: "#ffd447", amount: 0.78, type: "direct", handler: confetti },
  { id: "burst-rays", name: "Burst Rays", accent: "#ffb000", amount: 0.72, type: "direct", handler: burst },
  { id: "scanlines", name: "Scanlines", accent: "#40c9c6", amount: 0.8, type: "direct", handler: scanlines },
  { id: "grayscale", name: "Grayscale", accent: "#d8d8d8", amount: 1, type: "tone", mode: "grayscale" },
  { id: "monochrome-contrast", name: "Monochrome Contrast", accent: "#17191c", amount: 0.92, type: "tone", mode: "monochromeContrast" },
  { id: "high-key-wash", name: "High Key Wash", accent: "#fffdf7", amount: 0.76, type: "tone", mode: "highKey" },
  { id: "low-key-crush", name: "Low Key Crush", accent: "#17191c", amount: 0.78, type: "tone", mode: "lowKey" },
  { id: "invert", name: "Invert", accent: "#7c65ff", amount: 0.9, type: "tone", mode: "invert" },
  { id: "sepia-tone", name: "Sepia Tone", accent: "#c59b62", amount: 0.84, type: "tone", mode: "sepia" },
  { id: "cyanotype", name: "Cyanotype", accent: "#2f80ed", amount: 0.86, type: "tone", mode: "cyanotype" },
  { id: "tritone-pop", name: "Tritone Pop", accent: "#ff6fbc", amount: 0.84, type: "tone", mode: "tritone" },
  { id: "bleach-bypass", name: "Bleach Bypass", accent: "#fffdf7", amount: 0.78, type: "tone", mode: "bleach" },
  { id: "cross-process", name: "Cross Process", accent: "#c7f464", amount: 0.8, type: "tone", mode: "cross" },
  { id: "infrared-glow", name: "Infrared Glow", accent: "#ff6fbc", amount: 0.82, type: "tone", mode: "infrared" },
  { id: "lomo-vignette", name: "Lomo Vignette", accent: "#ff6f59", amount: 0.78, type: "tone", mode: "lomo" },
  { id: "split-tone", name: "Split Tone", accent: "#40c9c6", amount: 0.8, type: "tone", mode: "split" },
  { id: "sunset-gradient", name: "Sunset Gradient", accent: "#ff6f59", amount: 0.84, type: "gradient", colors: [[28, 18, 76], [255, 111, 89], [255, 212, 71]] },
  { id: "ice-gradient", name: "Ice Gradient", accent: "#9ee8ff", amount: 0.84, type: "gradient", colors: [[10, 28, 74], [64, 201, 198], [255, 253, 247]] },
  { id: "forest-gradient", name: "Forest Gradient", accent: "#66d47e", amount: 0.82, type: "gradient", colors: [[10, 36, 22], [61, 124, 52], [199, 244, 100]] },
  { id: "lava-gradient", name: "Lava Gradient", accent: "#ff6f59", amount: 0.86, type: "gradient", colors: [[18, 8, 12], [172, 28, 34], [255, 180, 0]] },
  { id: "violet-gold-map", name: "Violet Gold Map", accent: "#ffd447", amount: 0.82, type: "gradient", colors: [[36, 20, 70], [124, 101, 255], [255, 212, 71]] },
  { id: "teal-orange-map", name: "Teal Orange Map", accent: "#40c9c6", amount: 0.82, type: "gradient", colors: [[12, 58, 62], [64, 201, 198], [255, 111, 89]] },
  { id: "red-channel", name: "Red Channel", accent: "#ff6f59", amount: 0.92, type: "channel", mode: "red" },
  { id: "green-channel", name: "Green Channel", accent: "#29ff72", amount: 0.92, type: "channel", mode: "green" },
  { id: "blue-channel", name: "Blue Channel", accent: "#2f80ed", amount: 0.92, type: "channel", mode: "blue" },
  { id: "channel-swap", name: "Channel Swap", accent: "#7c65ff", amount: 0.9, type: "channel", mode: "swap" },
  { id: "channel-rotate", name: "Channel Rotate", accent: "#ff6fbc", amount: 0.88, type: "channel", mode: "rotate" },
  { id: "saturation-crush", name: "Saturation Crush", accent: "#d8d8d8", amount: 0.82, type: "tone", mode: "saturationCrush" },
  { id: "saturation-boost", name: "Saturation Boost", accent: "#c7f464", amount: 0.82, type: "tone", mode: "saturationBoost" },
  { id: "posterize-three", name: "Posterize Three", accent: "#ff6f59", amount: 0.86, type: "poster", levels: 3 },
  { id: "posterize-six", name: "Posterize Six", accent: "#ffd447", amount: 0.82, type: "poster", levels: 6 },
  { id: "binary-threshold", name: "Binary Threshold", accent: "#17191c", amount: 0.9, type: "threshold", mode: "binary" },
  { id: "inverse-threshold", name: "Inverse Threshold", accent: "#fffdf7", amount: 0.9, type: "threshold", mode: "inverse" },
  { id: "shadow-threshold", name: "Shadow Threshold", accent: "#2f80ed", amount: 0.82, type: "threshold", mode: "shadow" },
  { id: "highlight-threshold", name: "Highlight Threshold", accent: "#ffd447", amount: 0.82, type: "threshold", mode: "highlight" },
  { id: "duo-ink", name: "Duo Ink", accent: "#40c9c6", amount: 0.86, type: "tone", mode: "duoInk" },
  { id: "gaussian-soft", name: "Gaussian Soft", accent: "#ff9de2", amount: 0.72, type: "kernel", mode: "gaussianSoft" },
  { id: "box-blur", name: "Box Blur", accent: "#9ee8ff", amount: 0.68, type: "kernel", mode: "boxBlur" },
  { id: "sharpen", name: "Sharpen", accent: "#fffdf7", amount: 0.74, type: "kernel", mode: "sharpen" },
  { id: "unsharp-mask", name: "Unsharp Mask", accent: "#c7f464", amount: 0.74, type: "kernel", mode: "unsharp" },
  { id: "emboss", name: "Emboss", accent: "#c59b62", amount: 0.82, type: "kernel", mode: "emboss" },
  { id: "contour", name: "Contour", accent: "#17191c", amount: 0.82, type: "kernel", mode: "contour" },
  { id: "find-edges", name: "Find Edges", accent: "#40c9c6", amount: 0.86, type: "kernel", mode: "findEdges" },
  { id: "edge-enhance", name: "Edge Enhance", accent: "#ffd447", amount: 0.78, type: "kernel", mode: "edgeEnhance" },
  { id: "laplace-lines", name: "Laplace Lines", accent: "#fffdf7", amount: 0.82, type: "kernel", mode: "laplace" },
  { id: "detail-crisp", name: "Detail Crisp", accent: "#c7f464", amount: 0.76, type: "kernel", mode: "detail" },
  { id: "smooth", name: "Smooth", accent: "#9ee8ff", amount: 0.72, type: "kernel", mode: "smooth" },
  { id: "smooth-more", name: "Smooth More", accent: "#9ee8ff", amount: 0.82, type: "kernel", mode: "smoothMore" },
  { id: "charcoal-sketch", name: "Charcoal Sketch", accent: "#17191c", amount: 0.86, type: "kernel", mode: "charcoal" },
  { id: "pencil-sketch", name: "Pencil Sketch", accent: "#d8d8d8", amount: 0.82, type: "kernel", mode: "pencil" },
  { id: "wave-horizontal", name: "Wave Horizontal", accent: "#40c9c6", amount: 0.78, type: "geometry", mode: "waveHorizontal" },
  { id: "wave-vertical", name: "Wave Vertical", accent: "#40c9c6", amount: 0.78, type: "geometry", mode: "waveVertical" },
  { id: "ripple", name: "Ripple", accent: "#9ee8ff", amount: 0.76, type: "geometry", mode: "ripple" },
  { id: "water-ripple", name: "Water Ripple", accent: "#2f80ed", amount: 0.76, type: "geometry", mode: "waterRipple" },
  { id: "pinch", name: "Pinch", accent: "#7c65ff", amount: 0.76, type: "geometry", mode: "pinch" },
  { id: "bulge", name: "Bulge", accent: "#ff6fbc", amount: 0.76, type: "geometry", mode: "bulge" },
  { id: "fisheye", name: "Fisheye", accent: "#ffd447", amount: 0.78, type: "geometry", mode: "fisheye" },
  { id: "barrel-distort", name: "Barrel Distort", accent: "#c59b62", amount: 0.74, type: "geometry", mode: "barrel" },
  { id: "diagonal-shear", name: "Diagonal Shear", accent: "#c7f464", amount: 0.7, type: "geometry", mode: "diagonalShear" },
  { id: "zigzag", name: "Zigzag", accent: "#ff6f59", amount: 0.78, type: "geometry", mode: "zigzag" },
  { id: "tunnel-warp", name: "Tunnel Warp", accent: "#7c65ff", amount: 0.78, type: "geometry", mode: "tunnel" },
  { id: "spiral-warp", name: "Spiral Warp", accent: "#ff6fbc", amount: 0.78, type: "geometry", mode: "spiral" },
  { id: "lens-refraction", name: "Lens Refraction", accent: "#9ee8ff", amount: 0.74, type: "geometry", mode: "lensRefraction" },
  { id: "broken-glass", name: "Broken Glass", accent: "#fffdf7", amount: 0.76, type: "geometry", mode: "brokenGlass" },
  { id: "film-grain", name: "Film Grain", accent: "#c59b62", amount: 0.78, type: "overlay", mode: "filmGrain" },
  { id: "dust-scratches", name: "Dust Scratches", accent: "#fffdf7", amount: 0.78, type: "overlay", mode: "dustScratches" },
  { id: "paper-fiber", name: "Paper Fiber", accent: "#fffdf7", amount: 0.72, type: "overlay", mode: "paperFiber" },
  { id: "canvas-weave", name: "Canvas Weave", accent: "#c59b62", amount: 0.72, type: "pattern", mode: "canvasWeave" },
  { id: "crosshatch", name: "Crosshatch", accent: "#17191c", amount: 0.76, type: "pattern", mode: "crosshatch" },
  { id: "benday-dots", name: "Benday Dots", accent: "#ffd447", amount: 0.74, type: "pattern", mode: "bendayDots" },
  { id: "newsprint-dots", name: "Newsprint Dots", accent: "#17191c", amount: 0.74, type: "pattern", mode: "newsprintDots" },
  { id: "crt-mask", name: "CRT Mask", accent: "#40c9c6", amount: 0.8, type: "pattern", mode: "crtMask" },
  { id: "lcd-stripes", name: "LCD Stripes", accent: "#2f80ed", amount: 0.78, type: "pattern", mode: "lcdStripes" },
  { id: "ordered-dither", name: "Ordered Dither", accent: "#17191c", amount: 0.86, type: "dither", mode: "ordered" },
  { id: "stipple", name: "Stipple", accent: "#fffdf7", amount: 0.76, type: "pattern", mode: "stipple" },
  { id: "rain-streaks", name: "Rain Streaks", accent: "#9ee8ff", amount: 0.74, type: "overlay", mode: "rainStreaks" },
  { id: "sparkle", name: "Sparkle", accent: "#ffd447", amount: 0.76, type: "overlay", mode: "sparkle" },
  { id: "vignette-frame", name: "Vignette Frame", accent: "#17191c", amount: 0.78, type: "overlay", mode: "vignetteFrame" },
];

const recipes = effectCatalog.map(({ id, name, accent, amount }) => ({
  id,
  name,
  accent,
  steps: [[id, amount]],
}));

const transforms = Object.fromEntries(effectCatalog.map((effect) => [
  effect.id,
  (imageData, amount, random) => applyCatalogEffect(imageData, amount, random, effect),
]));

init();

function init() {
  populateTwistSelect();
  bindEvents();
  setStrengthFromSlider(false);
  loadSample();
}

function populateTwistSelect() {
  refs.twistSelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = TWIST_PLACEHOLDER_VALUE;
  placeholder.textContent = TWIST_PLACEHOLDER_LABEL;
  placeholder.disabled = true;
  placeholder.selected = true;
  refs.twistSelect.append(placeholder);

  recipes.forEach((recipe) => {
    const option = document.createElement("option");
    option.value = recipe.id;
    option.textContent = recipe.name;
    refs.twistSelect.append(option);
  });

  resetTwistSelect();
}

function bindEvents() {
  refs.imageInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) {
      loadFile(file);
    }
  });

  refs.twistSelect.addEventListener("change", () => {
    stopAutoParty();
    runSelectedTwist();
  });

  refs.twistAgain.addEventListener("click", () => runChosenTwist());
  refs.downloadImage.addEventListener("click", downloadImage);
  refs.autoParty.addEventListener("click", toggleAutoParty);
  refs.strengthInput.addEventListener("input", () => setStrengthFromSlider());

  ["dragenter", "dragover"].forEach((eventName) => {
    refs.dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      refs.dropZone.classList.add("is-dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    refs.dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      refs.dropZone.classList.remove("is-dragging");
    });
  });

  refs.dropZone.addEventListener("drop", (event) => {
    const file = [...event.dataTransfer.files].find((item) => item.type.startsWith("image/"));
    if (file) {
      loadFile(file);
    }
  });
}

async function loadFile(file) {
  if (!file.type.startsWith("image/")) {
    setStatus("Pick an image file");
    return;
  }

  try {
    setStatus("Loading image...");
    const bitmap = await decodeImage(file);
    setSourceFromDrawable(bitmap, sanitizeName(file.name));
    if (typeof bitmap.close === "function") {
      bitmap.close();
    }
    showOriginal();
  } catch (error) {
    console.error(error);
    setStatus("Could not load that image");
  }
}

async function decodeImage(file) {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      return await createImageBitmap(file);
    }
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image decode failed"));
    };
    image.src = url;
  });
}

function setSourceFromDrawable(drawable, fileName) {
  const { width, height } = fitInside(drawable.width, drawable.height, MAX_SIDE);
  canvas.width = width;
  canvas.height = height;
  canvas.style.setProperty("--canvas-ratio", `${width} / ${height}`);

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(drawable, 0, 0, width, height);

  state.source = ctx.getImageData(0, 0, width, height);
  state.fileName = fileName || "image-twist";
  state.currentRecipe = null;
  document.documentElement.style.setProperty("--accent", "#40c9c6");
  resetTwistSelect();
  setRecipeName("Original");
}

function loadSample() {
  const sample = document.createElement("canvas");
  sample.width = 1200;
  sample.height = 800;
  const sampleCtx = sample.getContext("2d");

  const sky = sampleCtx.createLinearGradient(0, 0, sample.width, sample.height);
  sky.addColorStop(0, "#40c9c6");
  sky.addColorStop(0.42, "#fff3b0");
  sky.addColorStop(1, "#ff6f59");
  sampleCtx.fillStyle = sky;
  sampleCtx.fillRect(0, 0, sample.width, sample.height);

  sampleCtx.fillStyle = "rgba(255, 255, 255, 0.76)";
  for (let i = 0; i < 26; i += 1) {
    const x = 80 + ((i * 157) % sample.width);
    const y = 70 + ((i * 89) % 330);
    const radius = 18 + ((i * 11) % 44);
    sampleCtx.beginPath();
    sampleCtx.arc(x, y, radius, 0, Math.PI * 2);
    sampleCtx.fill();
  }

  sampleCtx.fillStyle = "#17191c";
  sampleCtx.beginPath();
  sampleCtx.moveTo(0, 660);
  sampleCtx.bezierCurveTo(210, 510, 390, 790, 580, 620);
  sampleCtx.bezierCurveTo(790, 430, 930, 690, 1200, 530);
  sampleCtx.lineTo(1200, 800);
  sampleCtx.lineTo(0, 800);
  sampleCtx.closePath();
  sampleCtx.fill();

  sampleCtx.fillStyle = "#c7f464";
  sampleCtx.beginPath();
  sampleCtx.arc(906, 212, 118, 0, Math.PI * 2);
  sampleCtx.fill();

  sampleCtx.fillStyle = "#fffdf7";
  sampleCtx.font = "900 118px Arial, sans-serif";
  sampleCtx.fillText("TWIST", 82, 610);
  sampleCtx.fillStyle = "#ff6f59";
  sampleCtx.font = "800 44px Arial, sans-serif";
  sampleCtx.fillText("automatic sample", 92, 670);

  sampleCtx.lineWidth = 16;
  sampleCtx.strokeStyle = "#fffdf7";
  sampleCtx.strokeRect(62, 54, sample.width - 124, sample.height - 108);

  setSourceFromDrawable(sample, "image-twist-sample");
  showOriginal();
}

function runChosenTwist() {
  const selectedRecipe = recipes.find((item) => item.id === refs.twistSelect.value);
  const recipe = selectedRecipe === state.currentRecipe ? pickRecipe() : selectedRecipe || pickRecipe();
  runTwist(recipe);
}

function runSelectedTwist() {
  const selectedRecipe = recipes.find((item) => item.id === refs.twistSelect.value);
  if (selectedRecipe) {
    runTwist(selectedRecipe);
  }
}

function runRandomTwist() {
  runTwist(pickRecipe());
}

function runTwist(recipe, options = {}) {
  if (!state.source || state.isRendering || !recipe) {
    return;
  }

  const isLiveRender = options.live === true;
  state.isRendering = true;
  state.currentRecipe = recipe;
  if (!options.preserveSeed) {
    state.seed = Math.floor(Math.random() * 1000000) + 1;
  }
  document.documentElement.style.setProperty("--accent", recipe.accent);
  setRecipeName(recipe.name);
  refs.twistSelect.value = recipe.id;
  if (!isLiveRender) {
    refs.twistAgain.disabled = true;
    refs.twistSelect.disabled = true;
    refs.downloadImage.disabled = true;
    refs.strengthInput.disabled = true;
    document.body.classList.add("is-twisting");
    setStatus("Twisting...");
  }

  requestAnimationFrame(() => {
    try {
      const random = createRandom(state.seed);
      let working = cloneImageData(state.source);

      recipe.steps.forEach(([stepName, baseAmount], index) => {
        const transform = transforms[stepName];
        const amount = scaledEffectAmount(baseAmount, random);
        working = transform(working, amount, random, index);
      });

      working = blendImageData(state.source, working, effectBlendAmount());
      ctx.putImageData(working, 0, 0);
      setStatus(`${recipe.name} - ${canvas.width} x ${canvas.height}`);
    } catch (error) {
      console.error(error);
      setStatus("Twist failed");
    } finally {
      state.isRendering = false;
      if (!isLiveRender) {
        refs.twistAgain.disabled = false;
        refs.twistSelect.disabled = false;
        refs.downloadImage.disabled = false;
        refs.strengthInput.disabled = false;
        window.setTimeout(() => document.body.classList.remove("is-twisting"), 380);
      }
      if (state.queuedStrengthRender) {
        scheduleStrengthRender();
      }
    }
  });
}

function showOriginal() {
  if (!state.source) {
    return;
  }

  ctx.putImageData(state.source, 0, 0);
  state.currentRecipe = null;
  resetTwistSelect();
  setRecipeName("Original");
  setStatus(`Original - ${canvas.width} x ${canvas.height}`);
}

function resetTwistSelect() {
  refs.twistSelect.value = TWIST_PLACEHOLDER_VALUE;
}

function setRecipeName(name) {
  refs.recipeName.textContent = name;
  fitRecipeName();
  window.setTimeout(fitRecipeName, 0);
}

function fitRecipeName() {
  const textLength = refs.recipeName.textContent.length;
  let fontSize = Math.max(RECIPE_TITLE_MIN_SIZE, Math.min(RECIPE_TITLE_MAX_SIZE, 39 - textLength * 0.45));
  refs.recipeName.style.setProperty("--recipe-title-size", `${fontSize}px`);

  if (typeof refs.recipeName.getBoundingClientRect !== "function") {
    return;
  }

  const panel = refs.recipeName.closest?.(".twist-readout");
  const panelHeight = panel?.getBoundingClientRect().height || 156;
  const gridHeight = refs.recipeName.clientHeight || panelHeight - 86;
  const availableHeight = Math.max(34, Math.min(panelHeight - 86, gridHeight));

  while (fontSize > RECIPE_TITLE_MIN_SIZE && refs.recipeName.scrollHeight > availableHeight) {
    fontSize -= 1;
    refs.recipeName.style.setProperty("--recipe-title-size", `${fontSize}px`);
  }
}

function setStrengthFromSlider(shouldRender = true) {
  const rawPercent = refs.strengthInput.value === "" ? 100 : Number(refs.strengthInput.value);
  const percent = clampNumber(rawPercent, STRENGTH_MIN, STRENGTH_MAX);
  state.strength = percent / 100;
  refs.strengthInput.value = String(percent);
  refs.strengthInput.style.setProperty("--strength-fill", `${(percent / STRENGTH_MAX) * 100}%`);
  refs.strengthInput.setAttribute("aria-valuetext", `${percent}% intensity`);

  if (shouldRender) {
    scheduleStrengthRender();
  }
}

function scheduleStrengthRender() {
  if (!state.source || !state.currentRecipe) {
    return;
  }

  state.queuedStrengthRender = true;
  if (state.strengthFrame) {
    return;
  }

  state.strengthFrame = requestAnimationFrame(flushStrengthRender);
}

function flushStrengthRender() {
  state.strengthFrame = null;
  if (!state.queuedStrengthRender || !state.currentRecipe) {
    return;
  }

  if (state.isRendering) {
    state.strengthFrame = requestAnimationFrame(flushStrengthRender);
    return;
  }

  state.queuedStrengthRender = false;
  runTwist(state.currentRecipe, { live: true, preserveSeed: true });
}

function scaledEffectAmount(baseAmount, random) {
  const intensity = clampUnit(state.strength);
  const amountScale = TRANSFORM_AMOUNT_FLOOR + intensity * (1 - TRANSFORM_AMOUNT_FLOOR);
  const jitter = (random() - 0.5) * TRANSFORM_AMOUNT_JITTER * intensity;
  return clampUnit(baseAmount * amountScale + jitter);
}

function effectBlendAmount() {
  const intensity = clampUnit(state.strength);
  return intensity === 0 ? MIN_EFFECT_BLEND : intensity;
}

function pickRecipe() {
  if (recipes.length === 1) {
    return recipes[0];
  }

  let recipe = recipes[Math.floor(Math.random() * recipes.length)];
  while (recipe === state.currentRecipe) {
    recipe = recipes[Math.floor(Math.random() * recipes.length)];
  }
  return recipe;
}

function toggleAutoParty() {
  if (state.autoTimer) {
    stopAutoParty();
    return;
  }

  runRandomTwist();
  state.autoTimer = window.setInterval(runRandomTwist, 3200);
  refs.autoParty.textContent = "Party On";
  refs.autoParty.setAttribute("aria-pressed", "true");
}

function stopAutoParty() {
  if (!state.autoTimer) {
    return;
  }

  window.clearInterval(state.autoTimer);
  state.autoTimer = null;
  refs.autoParty.textContent = "Auto Party";
  refs.autoParty.setAttribute("aria-pressed", "false");
}

function fitInside(width, height, maxSide) {
  const largest = Math.max(width, height);
  if (largest <= maxSide) {
    return { width, height, scaled: false };
  }

  const scale = maxSide / largest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scaled: true,
  };
}

function popColor(imageData, amount) {
  return mapPixels(imageData, (r, g, b, a, x, y, width) => {
    const contrast = 1 + amount * 0.55;
    const saturation = 1 + amount * 1.25;
    let rgb = adjustContrast(r, g, b, contrast);
    rgb = saturate(rgb[0], rgb[1], rgb[2], saturation);
    const lift = Math.sin((x / width) * Math.PI) * amount * 16;
    return [clamp(rgb[0] + lift), clamp(rgb[1] + lift * 0.7), clamp(rgb[2] + lift * 0.4), a];
  });
}

function duotone(imageData, amount) {
  const low = [22, 24, 28];
  const mid = [255, 111, 188];
  const high = [89, 240, 255];

  return mapPixels(imageData, (r, g, b, a, x, y, width, height) => {
    const lum = luminance(r, g, b) / 255;
    const tone = lum < 0.5
      ? mixRgb(low, mid, lum * 2)
      : mixRgb(mid, high, (lum - 0.5) * 2);
    const sweep = (Math.sin((x / width + y / height) * Math.PI * 2) + 1) * 0.5;
    tone[0] = clamp(tone[0] + sweep * amount * 24);
    tone[1] = clamp(tone[1] + (1 - sweep) * amount * 18);
    return blendRgb([r, g, b], tone, 0.35 + amount * 0.62).concat(a);
  });
}

function heatMap(imageData, amount) {
  return mapPixels(imageData, (r, g, b, a) => {
    const lum = luminance(r, g, b) / 255;
    const mapped = gradientMap(lum, [
      [31, 25, 102],
      [37, 115, 219],
      [38, 231, 203],
      [255, 243, 101],
      [255, 77, 46],
    ]);
    return blendRgb([r, g, b], mapped, 0.35 + amount * 0.65).concat(a);
  });
}

function oldPhoto(imageData, amount) {
  return mapPixels(imageData, (r, g, b, a, x, y, width, height) => {
    const sepia = [
      clamp(r * 0.393 + g * 0.769 + b * 0.189),
      clamp(r * 0.349 + g * 0.686 + b * 0.168),
      clamp(r * 0.272 + g * 0.534 + b * 0.131),
    ];
    const grain = pseudoNoise(x, y) * amount * 34;
    const vignette = vignetteFactor(x, y, width, height, 0.22 + amount * 0.42);
    const mixed = blendRgb([r, g, b], sepia, 0.25 + amount * 0.65);
    return [
      clamp(mixed[0] * vignette + grain),
      clamp(mixed[1] * vignette + grain * 0.86),
      clamp(mixed[2] * vignette + grain * 0.56),
      a,
    ];
  });
}

function nightVision(imageData, amount) {
  return mapPixels(imageData, (r, g, b, a, x, y, width, height) => {
    const lum = luminance(r, g, b);
    const scanline = y % Math.max(3, Math.round(9 - amount * 5)) === 0 ? 0.72 : 1;
    const vignette = vignetteFactor(x, y, width, height, 0.2 + amount * 0.45);
    return [
      clamp(lum * 0.12 * vignette),
      clamp((lum * (1.05 + amount * 0.85) + 18) * scanline * vignette),
      clamp(lum * 0.22 * vignette),
      a,
    ];
  });
}

function comic(imageData, amount) {
  const src = imageData.data;
  const out = cloneImageData(imageData);
  const data = out.data;
  const width = imageData.width;
  const height = imageData.height;
  const levels = Math.max(3, Math.round(8 - amount * 4));

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      data[index] = posterize(src[index], levels);
      data[index + 1] = posterize(src[index + 1], levels);
      data[index + 2] = posterize(src[index + 2], levels);

      const edge = edgeAmount(src, x, y, width, height);
      if (edge > 32 - amount * 18) {
        const ink = 1 - Math.min(1, (edge - 12) / 110);
        data[index] = data[index] * ink;
        data[index + 1] = data[index + 1] * ink;
        data[index + 2] = data[index + 2] * ink;
      }
    }
  }

  return out;
}

function neonEdge(imageData, amount) {
  const src = imageData.data;
  const out = cloneImageData(imageData);
  const data = out.data;
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const edge = Math.min(255, edgeAmount(src, x, y, width, height) * (1 + amount * 2.2));
      data[index] = clamp(data[index] * (0.45 + amount * 0.1) + edge * 0.95);
      data[index + 1] = clamp(data[index + 1] * (0.48 + amount * 0.12) + edge * 0.85);
      data[index + 2] = clamp(data[index + 2] * (0.58 + amount * 0.16) + edge * 1.2);
    }
  }

  return out;
}

function glitch(imageData, amount) {
  const src = imageData.data;
  const out = cloneImageData(imageData);
  const data = out.data;
  const width = imageData.width;
  const height = imageData.height;
  const shift = Math.round(4 + amount * 36);
  const bandHeight = Math.max(10, Math.round(44 - amount * 22));

  for (let y = 0; y < height; y += 1) {
    const bandOffset = Math.sin(y * 0.035) * shift + (Math.floor(y / bandHeight) % 2 === 0 ? shift : -shift);
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const red = sampleIndex(Math.round(x + bandOffset), y, width, height);
      const blue = sampleIndex(Math.round(x - bandOffset), y, width, height);
      data[index] = src[red];
      data[index + 1] = src[index + 1];
      data[index + 2] = src[blue + 2];

      if ((y + Math.floor(amount * 20)) % Math.max(3, Math.round(11 - amount * 7)) === 0) {
        data[index] = clamp(data[index] + 36 * amount);
        data[index + 1] = clamp(data[index + 1] + 12 * amount);
      }
    }
  }

  return out;
}

function pixelate(imageData, amount) {
  const width = imageData.width;
  const height = imageData.height;
  const block = Math.max(3, Math.round(4 + amount * 34));
  const smallWidth = Math.max(1, Math.ceil(width / block));
  const smallHeight = Math.max(1, Math.ceil(height / block));
  const input = canvasFromImageData(imageData);
  const tiny = document.createElement("canvas");
  tiny.width = smallWidth;
  tiny.height = smallHeight;
  const tinyCtx = tiny.getContext("2d");
  tinyCtx.imageSmoothingEnabled = false;
  tinyCtx.drawImage(input, 0, 0, smallWidth, smallHeight);

  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  outputCtx.imageSmoothingEnabled = false;
  outputCtx.drawImage(tiny, 0, 0, width, height);
  return outputCtx.getImageData(0, 0, width, height);
}

function halftone(imageData, amount) {
  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  const cell = Math.max(6, Math.round(20 - amount * 12));

  outputCtx.fillStyle = "#fffdf7";
  outputCtx.fillRect(0, 0, width, height);

  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      const index = sampleIndex(x + cell / 2, y + cell / 2, width, height);
      const r = src[index];
      const g = src[index + 1];
      const b = src[index + 2];
      const lum = luminance(r, g, b) / 255;
      const radius = (1 - lum) * cell * (0.2 + amount * 0.42);
      outputCtx.fillStyle = `rgb(${Math.round(r * 0.45)}, ${Math.round(g * 0.45)}, ${Math.round(b * 0.45)})`;
      outputCtx.beginPath();
      outputCtx.arc(x + cell / 2, y + cell / 2, radius, 0, Math.PI * 2);
      outputCtx.fill();
    }
  }

  return outputCtx.getImageData(0, 0, width, height);
}

function ascii(imageData, amount) {
  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  const chars = " .:-=+*#%@";
  const cell = Math.max(7, Math.round(18 - amount * 8));

  outputCtx.fillStyle = "#17191c";
  outputCtx.fillRect(0, 0, width, height);
  outputCtx.font = `${cell}px Consolas, "Courier New", monospace`;
  outputCtx.textBaseline = "top";

  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      const index = sampleIndex(x, y, width, height);
      const lum = luminance(src[index], src[index + 1], src[index + 2]) / 255;
      const char = chars[Math.min(chars.length - 1, Math.round(lum * (chars.length - 1)))];
      outputCtx.fillStyle = `rgb(${clamp(src[index] + 40)}, ${clamp(src[index + 1] + 60)}, ${clamp(src[index + 2] + 30)})`;
      outputCtx.fillText(char, x, y);
    }
  }

  return outputCtx.getImageData(0, 0, width, height);
}

function mirrorFold(imageData, amount) {
  const out = new ImageData(imageData.width, imageData.height);
  const width = imageData.width;
  const height = imageData.height;
  const folds = Math.max(2, Math.round(2 + amount * 6));

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = x / width;
      const ny = y / height;
      const foldedX = mirrorUnit((nx * folds) % 1);
      const foldedY = mirrorUnit((ny * folds) % 1);
      const sx = Math.round(foldedX * (width - 1));
      const sy = Math.round(foldedY * (height - 1));
      copyPixel(imageData.data, out.data, sampleIndex(sx, sy, width, height), (y * width + x) * 4);
    }
  }

  return out;
}

function swirl(imageData, amount) {
  const out = new ImageData(imageData.width, imageData.height);
  const width = imageData.width;
  const height = imageData.height;
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.hypot(cx, cy);
  const twist = amount * 5.5;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      const radius = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx) + twist * (1 - radius / maxRadius);
      const sx = Math.round(cx + Math.cos(angle) * radius);
      const sy = Math.round(cy + Math.sin(angle) * radius);
      copyPixel(imageData.data, out.data, sampleIndex(sx, sy, width, height), (y * width + x) * 4);
    }
  }

  return out;
}

function mosaic(imageData, amount) {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  const cell = Math.max(10, Math.round(42 - amount * 28));

  outputCtx.fillStyle = "#17191c";
  outputCtx.fillRect(0, 0, width, height);

  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      const sampleStep = Math.max(1, Math.floor(cell / 5));

      for (let yy = y; yy < Math.min(height, y + cell); yy += sampleStep) {
        for (let xx = x; xx < Math.min(width, x + cell); xx += sampleStep) {
          const index = sampleIndex(xx, yy, width, height);
          r += data[index];
          g += data[index + 1];
          b += data[index + 2];
          count += 1;
        }
      }

      outputCtx.fillStyle = `rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`;
      outputCtx.fillRect(x + 1, y + 1, Math.max(1, cell - 2), Math.max(1, cell - 2));
    }
  }

  return outputCtx.getImageData(0, 0, width, height);
}

function kaleidoscope(imageData, amount) {
  const out = new ImageData(imageData.width, imageData.height);
  const width = imageData.width;
  const height = imageData.height;
  const cx = width / 2;
  const cy = height / 2;
  const slices = Math.max(5, Math.round(6 + amount * 12));
  const sliceAngle = (Math.PI * 2) / slices;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      const radius = Math.hypot(dx, dy);
      let angle = Math.atan2(dy, dx);
      angle = ((angle % sliceAngle) + sliceAngle) % sliceAngle;
      if (angle > sliceAngle / 2) {
        angle = sliceAngle - angle;
      }
      angle += amount * 0.65;

      const sx = Math.round(cx + Math.cos(angle) * radius);
      const sy = Math.round(cy + Math.sin(angle) * radius);
      copyPixel(imageData.data, out.data, sampleIndex(sx, sy, width, height), (y * width + x) * 4);
    }
  }

  return out;
}

function prismBands(imageData, amount, random) {
  const output = canvasFromImageData(imageData);
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  const width = imageData.width;
  const height = imageData.height;
  const colors = ["#ff6f59", "#40c9c6", "#c7f464", "#7c65ff", "#fffdf7"];
  const bands = Math.round(8 + amount * 16);

  outputCtx.save();
  outputCtx.globalCompositeOperation = "screen";
  outputCtx.globalAlpha = 0.16 + amount * 0.22;
  for (let i = 0; i < bands; i += 1) {
    const y = random() * height;
    const bandHeight = 10 + random() * height * 0.08 * amount;
    const gradient = outputCtx.createLinearGradient(0, y, width, y + bandHeight);
    gradient.addColorStop(0, colors[i % colors.length]);
    gradient.addColorStop(1, colors[(i + 2) % colors.length]);
    outputCtx.fillStyle = gradient;
    outputCtx.fillRect(0, y, width, bandHeight);
  }
  outputCtx.restore();

  return outputCtx.getImageData(0, 0, width, height);
}

function chromaWave(imageData, amount) {
  const out = cloneImageData(imageData);
  const src = imageData.data;
  const data = out.data;
  const width = imageData.width;
  const height = imageData.height;
  const maxShift = 5 + amount * 38;

  for (let y = 0; y < height; y += 1) {
    const wave = Math.sin(y * (0.018 + amount * 0.02)) * maxShift;
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const red = sampleIndex(x + wave, y, width, height);
      const green = sampleIndex(x + Math.sin((x + y) * 0.014) * maxShift * 0.35, y, width, height);
      const blue = sampleIndex(x - wave, y, width, height);
      data[index] = src[red];
      data[index + 1] = src[green + 1];
      data[index + 2] = src[blue + 2];
    }
  }

  return out;
}

function rainbowBands(imageData, amount) {
  return mapPixels(imageData, (r, g, b, a, x, y, width, height) => {
    const stripe = (Math.sin((x / width) * Math.PI * 8 + (y / height) * Math.PI * 5) + 1) * 0.5;
    const color = gradientMap(stripe, [
      [255, 111, 89],
      [255, 212, 71],
      [199, 244, 100],
      [64, 201, 198],
      [124, 101, 255],
      [255, 111, 188],
    ]);
    return blendRgb([r, g, b], color, 0.2 + amount * 0.42).concat(a);
  });
}

function lightLeaks(imageData, amount, random) {
  const output = canvasFromImageData(imageData);
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  const width = imageData.width;
  const height = imageData.height;
  const count = Math.round(3 + amount * 5);

  outputCtx.save();
  outputCtx.globalCompositeOperation = "screen";
  for (let i = 0; i < count; i += 1) {
    const x = random() * width;
    const y = random() * height;
    const radius = Math.max(width, height) * (0.16 + random() * 0.28);
    const gradient = outputCtx.createRadialGradient(x, y, 0, x, y, radius);
    const hue = random() > 0.5 ? "255, 111, 89" : "255, 230, 130";
    gradient.addColorStop(0, `rgba(${hue}, ${0.28 + amount * 0.28})`);
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    outputCtx.fillStyle = gradient;
    outputCtx.fillRect(0, 0, width, height);
  }
  outputCtx.restore();

  return outputCtx.getImageData(0, 0, width, height);
}

function stickers(imageData, amount, random) {
  const output = canvasFromImageData(imageData);
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  const width = imageData.width;
  const height = imageData.height;
  const count = Math.round(12 + amount * 30);
  const colors = ["#ff6f59", "#40c9c6", "#c7f464", "#7c65ff", "#fffdf7"];

  for (let i = 0; i < count; i += 1) {
    const x = random() * width;
    const y = random() * height;
    const size = 16 + random() * Math.min(width, height) * 0.06 * amount;
    outputCtx.save();
    outputCtx.translate(x, y);
    outputCtx.rotate((random() - 0.5) * Math.PI);
    outputCtx.lineWidth = Math.max(2, size * 0.08);
    outputCtx.strokeStyle = "#17191c";
    outputCtx.fillStyle = colors[Math.floor(random() * colors.length)];

    if (random() > 0.5) {
      drawStar(outputCtx, 0, 0, size * 0.55, size * 0.24, 5);
    } else if (random() > 0.5) {
      outputCtx.beginPath();
      outputCtx.rect(-size / 2, -size / 2, size, size);
      outputCtx.fill();
      outputCtx.stroke();
    } else {
      outputCtx.beginPath();
      outputCtx.arc(0, 0, size * 0.48, 0, Math.PI * 2);
      outputCtx.fill();
      outputCtx.stroke();
    }
    outputCtx.restore();
  }

  return outputCtx.getImageData(0, 0, width, height);
}

function ghostTrail(imageData, amount) {
  const input = canvasFromImageData(imageData);
  const output = canvasFromImageData(imageData);
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  const width = imageData.width;
  const height = imageData.height;
  const shift = Math.round(12 + amount * 55);

  outputCtx.save();
  outputCtx.globalCompositeOperation = "screen";
  outputCtx.globalAlpha = 0.24 + amount * 0.16;
  outputCtx.drawImage(input, -shift, 0, width, height);
  outputCtx.drawImage(input, shift * 0.6, 0, width, height);
  outputCtx.globalCompositeOperation = "multiply";
  outputCtx.globalAlpha = 0.12 + amount * 0.12;
  outputCtx.drawImage(input, 0, shift * 0.32, width, height);
  outputCtx.restore();

  return outputCtx.getImageData(0, 0, width, height);
}

function solarize(imageData, amount) {
  return mapPixels(imageData, (r, g, b, a) => {
    const solar = [
      r > 128 ? 255 - r : r * 1.28,
      g > 128 ? 255 - g : g * 1.18,
      b > 128 ? 255 - b : b * 1.38,
    ];
    const warmed = [clamp(solar[0] + 55 * amount), clamp(solar[1] + 18 * amount), clamp(solar[2] - 16 * amount)];
    return blendRgb([r, g, b], warmed, 0.45 + amount * 0.48).concat(a);
  });
}

function blueprint(imageData, amount) {
  const src = imageData.data;
  const out = new ImageData(imageData.width, imageData.height);
  const data = out.data;
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const edge = Math.min(255, edgeAmount(src, x, y, width, height) * (1 + amount * 2.8));
      const lum = luminance(src[index], src[index + 1], src[index + 2]) / 255;
      data[index] = clamp(10 + edge * 0.22 + lum * 12);
      data[index + 1] = clamp(42 + edge * 0.62 + lum * 36);
      data[index + 2] = clamp(90 + edge * 1.08 + lum * 70);
      data[index + 3] = src[index + 3];
    }
  }

  return out;
}

function gridOverlay(imageData, amount) {
  const output = canvasFromImageData(imageData);
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  const width = imageData.width;
  const height = imageData.height;
  const step = Math.max(18, Math.round(70 - amount * 36));

  outputCtx.save();
  outputCtx.globalAlpha = 0.2 + amount * 0.22;
  outputCtx.strokeStyle = "#fffdf7";
  outputCtx.lineWidth = 1;
  for (let x = 0; x < width; x += step) {
    outputCtx.beginPath();
    outputCtx.moveTo(x, 0);
    outputCtx.lineTo(x, height);
    outputCtx.stroke();
  }
  for (let y = 0; y < height; y += step) {
    outputCtx.beginPath();
    outputCtx.moveTo(0, y);
    outputCtx.lineTo(width, y);
    outputCtx.stroke();
  }
  outputCtx.restore();

  return outputCtx.getImageData(0, 0, width, height);
}

function glassBlocks(imageData, amount, random) {
  const width = imageData.width;
  const height = imageData.height;
  const input = canvasFromImageData(imageData);
  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  const block = Math.max(18, Math.round(86 - amount * 50));
  const wiggle = Math.round(8 + amount * 28);

  for (let y = 0; y < height; y += block) {
    for (let x = 0; x < width; x += block) {
      const destWidth = Math.min(block, width - x);
      const destHeight = Math.min(block, height - y);
      const sx = Math.max(0, Math.min(width - destWidth, x + Math.round((random() - 0.5) * wiggle)));
      const sy = Math.max(0, Math.min(height - destHeight, y + Math.round((random() - 0.5) * wiggle)));
      outputCtx.drawImage(input, sx, sy, destWidth, destHeight, x, y, destWidth, destHeight);
      outputCtx.strokeStyle = "rgba(255, 255, 255, 0.28)";
      outputCtx.strokeRect(x + 0.5, y + 0.5, destWidth - 1, destHeight - 1);
    }
  }

  return outputCtx.getImageData(0, 0, width, height);
}

function bubbles(imageData, amount, random) {
  const output = canvasFromImageData(imageData);
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  const width = imageData.width;
  const height = imageData.height;
  const count = Math.round(18 + amount * 52);

  outputCtx.save();
  outputCtx.globalCompositeOperation = "screen";
  for (let i = 0; i < count; i += 1) {
    const x = random() * width;
    const y = random() * height;
    const radius = 10 + random() * Math.min(width, height) * 0.06 * amount;
    outputCtx.globalAlpha = 0.22 + random() * 0.28;
    outputCtx.lineWidth = Math.max(2, radius * 0.08);
    outputCtx.strokeStyle = random() > 0.5 ? "#fffdf7" : "#40c9c6";
    outputCtx.beginPath();
    outputCtx.arc(x, y, radius, 0, Math.PI * 2);
    outputCtx.stroke();
    outputCtx.globalAlpha *= 0.7;
    outputCtx.beginPath();
    outputCtx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.22, 0, Math.PI * 2);
    outputCtx.fillStyle = "#fffdf7";
    outputCtx.fill();
  }
  outputCtx.restore();

  return outputCtx.getImageData(0, 0, width, height);
}

function paintSplats(imageData, amount, random) {
  const output = canvasFromImageData(imageData);
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  const width = imageData.width;
  const height = imageData.height;
  const count = Math.round(8 + amount * 18);
  const colors = ["#ff6f59", "#40c9c6", "#c7f464", "#7c65ff", "#fffdf7"];

  for (let i = 0; i < count; i += 1) {
    const x = random() * width;
    const y = random() * height;
    const radius = 18 + random() * Math.min(width, height) * 0.08 * amount;
    outputCtx.save();
    outputCtx.globalAlpha = 0.5 + random() * 0.28;
    outputCtx.fillStyle = colors[Math.floor(random() * colors.length)];
    outputCtx.beginPath();
    outputCtx.arc(x, y, radius, 0, Math.PI * 2);
    outputCtx.fill();

    const drips = 7 + Math.floor(random() * 13);
    for (let j = 0; j < drips; j += 1) {
      const angle = random() * Math.PI * 2;
      const distance = radius * (0.4 + random() * 1.8);
      const dot = radius * (0.08 + random() * 0.22);
      outputCtx.beginPath();
      outputCtx.arc(x + Math.cos(angle) * distance, y + Math.sin(angle) * distance, dot, 0, Math.PI * 2);
      outputCtx.fill();
    }
    outputCtx.restore();
  }

  return outputCtx.getImageData(0, 0, width, height);
}

function sliceShuffle(imageData, amount, random) {
  const out = new ImageData(imageData.width, imageData.height);
  const width = imageData.width;
  const height = imageData.height;
  const sliceHeight = Math.max(8, Math.round(48 - amount * 28));
  const maxShift = Math.round(width * (0.05 + amount * 0.22));

  for (let y = 0; y < height; y += 1) {
    const band = Math.floor(y / sliceHeight);
    const shift = Math.round((Math.sin(band * 1.7) + random() - 0.5) * maxShift);
    for (let x = 0; x < width; x += 1) {
      const sx = (x + shift + width) % width;
      copyPixel(imageData.data, out.data, sampleIndex(sx, y, width, height), (y * width + x) * 4);
    }
  }

  return out;
}

function softBloom(imageData, amount) {
  const width = imageData.width;
  const height = imageData.height;
  const input = canvasFromImageData(imageData);
  const small = document.createElement("canvas");
  small.width = Math.max(1, Math.round(width * 0.16));
  small.height = Math.max(1, Math.round(height * 0.16));
  const smallCtx = small.getContext("2d");
  smallCtx.imageSmoothingEnabled = true;
  smallCtx.drawImage(input, 0, 0, small.width, small.height);

  const output = canvasFromImageData(imageData);
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  outputCtx.save();
  outputCtx.globalCompositeOperation = "screen";
  outputCtx.globalAlpha = 0.2 + amount * 0.34;
  outputCtx.imageSmoothingEnabled = true;
  outputCtx.drawImage(small, 0, 0, width, height);
  outputCtx.restore();

  return outputCtx.getImageData(0, 0, width, height);
}

function xerox(imageData, amount) {
  return mapPixels(imageData, (r, g, b, a, x, y) => {
    const lum = luminance(r, g, b) + pseudoNoise(x, y) * amount * 55;
    const ink = lum > 118 + amount * 32 ? 246 : 18;
    const tint = lum > 180 ? [255, 253, 247] : [ink, ink, ink];
    return [tint[0], tint[1], tint[2], a];
  });
}

function noiseSnow(imageData, amount, random) {
  return mapPixels(imageData, (r, g, b, a) => {
    const snow = (random() - 0.5) * amount * 88;
    const fleck = random() > 1 - amount * 0.05 ? 255 : 0;
    return [
      clamp(r + snow + fleck),
      clamp(g + snow + fleck),
      clamp(b + snow + fleck),
      a,
    ];
  });
}

function posterPunch(imageData, amount) {
  return mapPixels(imageData, (r, g, b, a) => {
    const levels = Math.max(3, Math.round(7 - amount * 3));
    const punched = saturate(
      posterize(r, levels),
      posterize(g, levels),
      posterize(b, levels),
      1.4 + amount * 1.4,
    );
    const contrast = adjustContrast(punched[0], punched[1], punched[2], 1.18 + amount * 0.55);
    return [contrast[0], contrast[1], contrast[2], a];
  });
}

function drawStar(context, x, y, outerRadius, innerRadius, points) {
  context.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + (i * Math.PI) / points;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) {
      context.moveTo(px, py);
    } else {
      context.lineTo(px, py);
    }
  }
  context.closePath();
  context.fill();
  context.stroke();
}

function confetti(imageData, amount, random) {
  const output = canvasFromImageData(imageData);
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  const width = imageData.width;
  const height = imageData.height;
  const count = Math.round(35 + amount * 95);
  const colors = ["#ff6f59", "#40c9c6", "#c7f464", "#7c65ff", "#fffdf7", "#17191c"];

  for (let i = 0; i < count; i += 1) {
    const x = random() * width;
    const y = random() * height;
    const size = 8 + random() * 34 * amount;
    outputCtx.save();
    outputCtx.translate(x, y);
    outputCtx.rotate(random() * Math.PI);
    outputCtx.fillStyle = colors[Math.floor(random() * colors.length)];
    outputCtx.globalAlpha = 0.52 + random() * 0.38;
    if (random() > 0.45) {
      outputCtx.fillRect(-size / 2, -size / 2, size, size * 0.34);
    } else {
      outputCtx.beginPath();
      outputCtx.arc(0, 0, size * 0.42, 0, Math.PI * 2);
      outputCtx.fill();
    }
    outputCtx.restore();
  }

  return outputCtx.getImageData(0, 0, width, height);
}

function burst(imageData, amount, random) {
  const output = canvasFromImageData(imageData);
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  const width = imageData.width;
  const height = imageData.height;
  const cx = width * (0.35 + random() * 0.3);
  const cy = height * (0.3 + random() * 0.32);
  const rays = Math.round(18 + amount * 26);

  outputCtx.save();
  outputCtx.globalCompositeOperation = "screen";
  outputCtx.globalAlpha = 0.14 + amount * 0.18;

  for (let i = 0; i < rays; i += 1) {
    const angle = (i / rays) * Math.PI * 2;
    const length = Math.max(width, height) * (0.45 + random() * 0.7);
    outputCtx.strokeStyle = i % 2 === 0 ? "#fffdf7" : "#ff6f59";
    outputCtx.lineWidth = 4 + random() * 12 * amount;
    outputCtx.beginPath();
    outputCtx.moveTo(cx, cy);
    outputCtx.lineTo(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length);
    outputCtx.stroke();
  }

  outputCtx.restore();
  return outputCtx.getImageData(0, 0, width, height);
}

function scanlines(imageData, amount) {
  const output = canvasFromImageData(imageData);
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  const width = imageData.width;
  const height = imageData.height;
  const gap = Math.max(3, Math.round(9 - amount * 5));

  outputCtx.fillStyle = `rgba(23, 25, 28, ${0.08 + amount * 0.1})`;
  for (let y = 0; y < height; y += gap) {
    outputCtx.fillRect(0, y, width, 1);
  }

  return outputCtx.getImageData(0, 0, width, height);
}

function applyCatalogEffect(imageData, amount, random, effect) {
  const safeAmount = clampUnit(amount);

  switch (effect.type) {
    case "direct":
      return effect.handler(imageData, safeAmount, random);
    case "tone":
      return toneEffect(imageData, safeAmount, effect.mode);
    case "gradient":
      return gradientEffect(imageData, safeAmount, effect.colors);
    case "channel":
      return channelEffect(imageData, safeAmount, effect.mode);
    case "poster":
      return posterEffect(imageData, safeAmount, effect.levels);
    case "threshold":
      return thresholdEffect(imageData, safeAmount, effect.mode);
    case "kernel":
      return kernelEffect(imageData, safeAmount, effect.mode);
    case "geometry":
      return geometryEffect(imageData, safeAmount, effect.mode);
    case "overlay":
      return overlayEffect(imageData, safeAmount, random, effect.mode);
    case "pattern":
      return patternEffect(imageData, safeAmount, random, effect.mode);
    case "dither":
      return ditherEffect(imageData, safeAmount);
    default:
      return cloneImageData(imageData);
  }
}

function toneEffect(imageData, amount, mode) {
  return mapPixels(imageData, (r, g, b, a, x, y, width, height) => {
    const lum = luminance(r, g, b);
    let target = [r, g, b];

    switch (mode) {
      case "grayscale":
        target = [lum, lum, lum];
        break;
      case "monochromeContrast": {
        const value = clamp((lum - 128) * (1.35 + amount * 0.9) + 128);
        target = [value, value, value];
        break;
      }
      case "highKey":
        target = adjustContrast(
          clamp(r + 52 + amount * 28),
          clamp(g + 52 + amount * 28),
          clamp(b + 52 + amount * 28),
          0.78,
        );
        break;
      case "lowKey":
        target = adjustContrast(r * 0.68, g * 0.68, b * 0.68, 1.35 + amount * 0.45);
        break;
      case "invert":
        target = [255 - r, 255 - g, 255 - b];
        break;
      case "sepia":
        target = [
          clamp(r * 0.393 + g * 0.769 + b * 0.189),
          clamp(r * 0.349 + g * 0.686 + b * 0.168),
          clamp(r * 0.272 + g * 0.534 + b * 0.131),
        ];
        break;
      case "cyanotype":
        target = gradientMap(lum / 255, [[5, 25, 64], [28, 102, 172], [230, 248, 255]]);
        break;
      case "tritone":
        target = gradientMap(lum / 255, [[23, 25, 28], [255, 111, 188], [199, 244, 100]]);
        break;
      case "bleach": {
        const gray = [lum, lum, lum];
        target = adjustContrast(
          blendRgb([r, g, b], gray, 0.42)[0],
          blendRgb([r, g, b], gray, 0.42)[1],
          blendRgb([r, g, b], gray, 0.42)[2],
          1.28 + amount * 0.42,
        );
        break;
      }
      case "cross":
        target = [
          clamp(r * 1.22 + 18 * amount),
          clamp(g * 1.05 + b * 0.18),
          clamp(b * 0.82 + 34 * amount),
        ];
        break;
      case "infrared":
        target = [
          clamp(lum * 0.5 + g * 0.9),
          clamp(lum * 0.34 + r * 0.18),
          clamp(lum * 0.7 + b * 0.25),
        ];
        break;
      case "lomo": {
        const vignette = vignetteFactor(x, y, width, height, 0.5 + amount * 0.35);
        const saturated = saturate(r, g, b, 1.25 + amount * 0.75);
        target = [
          clamp(saturated[0] * vignette + 18 * amount),
          clamp(saturated[1] * vignette),
          clamp(saturated[2] * vignette + 8 * amount),
        ];
        break;
      }
      case "split": {
        const shadow = [35, 82, 150];
        const highlight = [255, 170, 86];
        target = lum < 128
          ? blendRgb([r, g, b], shadow, 0.45)
          : blendRgb([r, g, b], highlight, 0.38);
        break;
      }
      case "saturationCrush":
        target = saturate(r, g, b, 0.18 + (1 - amount) * 0.28);
        break;
      case "saturationBoost":
        target = saturate(r, g, b, 1.6 + amount * 1.2);
        break;
      case "duoInk":
        target = lum < 128
          ? mixRgb([12, 16, 26], [40, 201, 198], lum / 128)
          : mixRgb([40, 201, 198], [255, 253, 247], (lum - 128) / 127);
        break;
      default:
        target = [r, g, b];
    }

    return blendRgb([r, g, b], target, 0.35 + amount * 0.65).concat(a);
  });
}

function gradientEffect(imageData, amount, colors) {
  return mapPixels(imageData, (r, g, b, a) => {
    const mapped = gradientMap(luminance(r, g, b) / 255, colors);
    return blendRgb([r, g, b], mapped, 0.28 + amount * 0.66).concat(a);
  });
}

function channelEffect(imageData, amount, mode) {
  return mapPixels(imageData, (r, g, b, a, x, y, width) => {
    let target = [r, g, b];

    if (mode === "red") {
      target = [r, g * 0.12, b * 0.12];
    } else if (mode === "green") {
      target = [r * 0.12, g, b * 0.12];
    } else if (mode === "blue") {
      target = [r * 0.12, g * 0.12, b];
    } else if (mode === "swap") {
      target = [b, r, g];
    } else if (mode === "rotate") {
      const wave = (Math.sin((x / width) * Math.PI * 2) + 1) * 0.5;
      target = [
        clamp(g * wave + b * (1 - wave)),
        clamp(b * wave + r * (1 - wave)),
        clamp(r * wave + g * (1 - wave)),
      ];
    }

    return blendRgb([r, g, b], target, 0.38 + amount * 0.62).concat(a);
  });
}

function posterEffect(imageData, amount, levels) {
  const activeLevels = Math.max(2, Math.round(levels + (1 - amount) * 5));
  return mapPixels(imageData, (r, g, b, a) => {
    const target = [
      posterize(r, activeLevels),
      posterize(g, activeLevels),
      posterize(b, activeLevels),
    ];
    return blendRgb([r, g, b], target, 0.45 + amount * 0.55).concat(a);
  });
}

function thresholdEffect(imageData, amount, mode) {
  return mapPixels(imageData, (r, g, b, a) => {
    const lum = luminance(r, g, b);
    const threshold = 118 + amount * 34;
    let value = lum > threshold ? 255 : 0;
    let target = [value, value, value];

    if (mode === "inverse") {
      value = lum > threshold ? 0 : 255;
      target = [value, value, value];
    } else if (mode === "shadow") {
      target = lum < threshold ? [8, 18, 38] : [clamp(r + 34), clamp(g + 34), clamp(b + 34)];
    } else if (mode === "highlight") {
      target = lum > threshold ? [255, 238, 130] : [clamp(r * 0.42), clamp(g * 0.42), clamp(b * 0.42)];
    }

    return blendRgb([r, g, b], target, 0.45 + amount * 0.55).concat(a);
  });
}

function kernelEffect(imageData, amount, mode) {
  if (mode === "unsharp") {
    const blurred = applyKernelRaw(imageData, [1, 2, 1, 2, 4, 2, 1, 2, 1], 16, 0);
    return mapPixels(imageData, (r, g, b, a, x, y, width) => {
      const index = (y * width + x) * 4;
      return [
        clamp(r + (r - blurred.data[index]) * (0.7 + amount * 1.2)),
        clamp(g + (g - blurred.data[index + 1]) * (0.7 + amount * 1.2)),
        clamp(b + (b - blurred.data[index + 2]) * (0.7 + amount * 1.2)),
        a,
      ];
    });
  }

  if (mode === "charcoal" || mode === "pencil") {
    return sketchKernelEffect(imageData, amount, mode);
  }

  const kernels = {
    gaussianSoft: { kernel: [1, 2, 1, 2, 4, 2, 1, 2, 1], divisor: 16, offset: 0, blend: 0.72 },
    boxBlur: { kernel: [1, 1, 1, 1, 1, 1, 1, 1, 1], divisor: 9, offset: 0, blend: 0.78 },
    sharpen: { kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0], divisor: 1, offset: 0, blend: 0.78 },
    emboss: { kernel: [-2, -1, 0, -1, 1, 1, 0, 1, 2], divisor: 1, offset: 128, blend: 0.9 },
    contour: { kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1], divisor: 1, offset: 128, blend: 0.86 },
    findEdges: { kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1], divisor: 1, offset: 0, blend: 1 },
    edgeEnhance: { kernel: [0, 0, 0, -1, 2, 0, 0, 0, 0], divisor: 1, offset: 0, blend: 0.75 },
    laplace: { kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0], divisor: 1, offset: 128, blend: 0.92 },
    detail: { kernel: [0, -1, 0, -1, 6, -1, 0, -1, 0], divisor: 1, offset: 0, blend: 0.7 },
    smooth: { kernel: [1, 1, 1, 1, 5, 1, 1, 1, 1], divisor: 13, offset: 0, blend: 0.7 },
    smoothMore: { kernel: [1, 2, 1, 2, 8, 2, 1, 2, 1], divisor: 20, offset: 0, blend: 0.82 },
  };
  const config = kernels[mode] || kernels.sharpen;
  const filtered = applyKernelRaw(imageData, config.kernel, config.divisor, config.offset);
  return blendImageData(imageData, filtered, Math.min(1, config.blend * (0.35 + amount * 0.65)));
}

function sketchKernelEffect(imageData, amount, mode) {
  const src = imageData.data;
  const out = new ImageData(imageData.width, imageData.height);
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const edge = edgeAmount(src, x, y, width, height);
      const paper = 238 + pseudoNoise(x, y) * 10 * amount;
      const value = mode === "charcoal"
        ? clamp(paper - edge * (1.1 + amount * 2.4))
        : clamp(255 - edge * (0.65 + amount * 1.4));
      out.data[index] = value;
      out.data[index + 1] = mode === "charcoal" ? value : clamp(value - 5);
      out.data[index + 2] = mode === "charcoal" ? value : clamp(value - 12);
      out.data[index + 3] = src[index + 3];
    }
  }

  return out;
}

function applyKernelRaw(imageData, kernel, divisor, offset) {
  const src = imageData.data;
  const out = new ImageData(imageData.width, imageData.height);
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const destIndex = (y * width + x) * 4;
      const totals = [0, 0, 0];

      for (let ky = -1; ky <= 1; ky += 1) {
        for (let kx = -1; kx <= 1; kx += 1) {
          const weight = kernel[(ky + 1) * 3 + (kx + 1)];
          const sourceIndex = sampleIndex(x + kx, y + ky, width, height);
          totals[0] += src[sourceIndex] * weight;
          totals[1] += src[sourceIndex + 1] * weight;
          totals[2] += src[sourceIndex + 2] * weight;
        }
      }

      out.data[destIndex] = clamp(totals[0] / divisor + offset);
      out.data[destIndex + 1] = clamp(totals[1] / divisor + offset);
      out.data[destIndex + 2] = clamp(totals[2] / divisor + offset);
      out.data[destIndex + 3] = src[destIndex + 3];
    }
  }

  return out;
}

function geometryEffect(imageData, amount, mode) {
  const width = imageData.width;
  const height = imageData.height;
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.hypot(cx, cy);
  const wave = 8 + amount * 46;

  return remapImageData(imageData, (x, y) => {
    const dx = x - cx;
    const dy = y - cy;
    const radius = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const normalizedRadius = radius / maxRadius;

    if (mode === "waveHorizontal") {
      return [x + Math.sin(y * (0.025 + amount * 0.02)) * wave, y];
    }
    if (mode === "waveVertical") {
      return [x, y + Math.sin(x * (0.025 + amount * 0.02)) * wave];
    }
    if (mode === "ripple") {
      const nextRadius = radius + Math.sin(radius * (0.035 + amount * 0.035)) * wave;
      return [cx + Math.cos(angle) * nextRadius, cy + Math.sin(angle) * nextRadius];
    }
    if (mode === "waterRipple") {
      return [
        x + Math.sin(y * 0.045 + radius * 0.018) * wave * 0.7,
        y + Math.cos(x * 0.038 + radius * 0.02) * wave * 0.7,
      ];
    }
    if (mode === "pinch" || mode === "bulge" || mode === "fisheye") {
      const power = mode === "pinch" ? 1 - amount * 0.5 : 1 + amount * 1.2;
      const fisheyePower = mode === "fisheye" ? 1 + amount * 2 : power;
      const nextRadius = maxRadius * Math.pow(normalizedRadius, fisheyePower);
      return [cx + Math.cos(angle) * nextRadius, cy + Math.sin(angle) * nextRadius];
    }
    if (mode === "barrel") {
      const factor = 1 + amount * 0.42 * normalizedRadius * normalizedRadius;
      return [cx + dx * factor, cy + dy * factor];
    }
    if (mode === "diagonalShear") {
      return [x + (y / height - 0.5) * wave * 2.6, y + (x / width - 0.5) * wave * 0.5];
    }
    if (mode === "zigzag") {
      const cell = Math.max(12, Math.round(70 - amount * 38));
      const direction = Math.floor(y / cell) % 2 === 0 ? 1 : -1;
      return [x + direction * wave * 1.1, y];
    }
    if (mode === "tunnel" || mode === "spiral") {
      const twist = (1 - normalizedRadius) * amount * (mode === "spiral" ? 4.8 : 2.6);
      const zoom = mode === "tunnel" ? 1 + (1 - normalizedRadius) * amount * 0.75 : 1;
      return [
        cx + Math.cos(angle + twist) * radius / zoom,
        cy + Math.sin(angle + twist) * radius / zoom,
      ];
    }
    if (mode === "lensRefraction") {
      const bend = Math.sin(normalizedRadius * Math.PI * 5) * wave * (1 - normalizedRadius);
      return [cx + Math.cos(angle) * (radius + bend), cy + Math.sin(angle) * (radius + bend)];
    }
    if (mode === "brokenGlass") {
      const cell = Math.max(22, Math.round(96 - amount * 54));
      const gx = Math.floor(x / cell);
      const gy = Math.floor(y / cell);
      return [
        x + pseudoNoise(gx, gy) * cell * amount * 0.42,
        y + pseudoNoise(gy, gx) * cell * amount * 0.42,
      ];
    }

    return [x, y];
  });
}

function remapImageData(imageData, mapper) {
  const out = new ImageData(imageData.width, imageData.height);
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [sx, sy] = mapper(x, y, width, height);
      copyPixel(imageData.data, out.data, sampleIndex(sx, sy, width, height), (y * width + x) * 4);
    }
  }

  return out;
}

function overlayEffect(imageData, amount, random, mode) {
  if (mode === "filmGrain") {
    return mapPixels(imageData, (r, g, b, a) => {
      const grain = (random() - 0.5) * amount * 70;
      return [clamp(r + grain), clamp(g + grain), clamp(b + grain), a];
    });
  }

  if (mode === "paperFiber") {
    return mapPixels(imageData, (r, g, b, a, x, y) => {
      const fiber = (pseudoNoise(x * 0.35, y * 1.7) + pseudoNoise(x * 1.8, y * 0.22)) * amount * 13;
      return [clamp(r + fiber + 8), clamp(g + fiber + 5), clamp(b + fiber), a];
    });
  }

  if (mode === "vignetteFrame") {
    const vignetted = mapPixels(imageData, (r, g, b, a, x, y, width, height) => {
      const factor = vignetteFactor(x, y, width, height, 0.45 + amount * 0.55);
      return [clamp(r * factor), clamp(g * factor), clamp(b * factor), a];
    });
    const output = canvasFromImageData(vignetted);
    const outputCtx = output.getContext("2d", { willReadFrequently: true });
    outputCtx.strokeStyle = "rgba(23, 25, 28, 0.74)";
    outputCtx.lineWidth = Math.max(6, Math.round(Math.min(imageData.width, imageData.height) * 0.022 * amount));
    outputCtx.strokeRect(outputCtx.lineWidth / 2, outputCtx.lineWidth / 2, imageData.width - outputCtx.lineWidth, imageData.height - outputCtx.lineWidth);
    return outputCtx.getImageData(0, 0, imageData.width, imageData.height);
  }

  const output = canvasFromImageData(imageData);
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  const width = imageData.width;
  const height = imageData.height;

  outputCtx.save();
  if (mode === "dustScratches") {
    outputCtx.globalCompositeOperation = "screen";
    outputCtx.globalAlpha = 0.24 + amount * 0.28;
    outputCtx.strokeStyle = "#fffdf7";
    outputCtx.lineWidth = Math.max(1, Math.round(1 + amount * 2));
    for (let i = 0; i < 28 + amount * 55; i += 1) {
      const x = random() * width;
      const y = random() * height;
      outputCtx.beginPath();
      outputCtx.moveTo(x, y);
      outputCtx.lineTo(x + (random() - 0.5) * width * 0.16, y + random() * height * 0.18);
      outputCtx.stroke();
    }
  } else if (mode === "rainStreaks") {
    outputCtx.globalCompositeOperation = "screen";
    outputCtx.globalAlpha = 0.18 + amount * 0.28;
    outputCtx.strokeStyle = "#dff8ff";
    outputCtx.lineWidth = Math.max(1, Math.round(1 + amount * 2));
    for (let i = 0; i < 60 + amount * 120; i += 1) {
      const x = random() * width;
      const y = random() * height;
      outputCtx.beginPath();
      outputCtx.moveTo(x, y);
      outputCtx.lineTo(x - width * 0.025, y + height * (0.05 + random() * 0.08));
      outputCtx.stroke();
    }
  } else if (mode === "sparkle") {
    outputCtx.globalCompositeOperation = "screen";
    outputCtx.globalAlpha = 0.32 + amount * 0.32;
    outputCtx.fillStyle = "#fffdf7";
    outputCtx.strokeStyle = "#ffd447";
    outputCtx.lineWidth = 1;
    for (let i = 0; i < 18 + amount * 34; i += 1) {
      drawStar(outputCtx, random() * width, random() * height, 6 + random() * 18 * amount, 2 + random() * 7 * amount, 4);
    }
  }
  outputCtx.restore();

  return outputCtx.getImageData(0, 0, width, height);
}

function patternEffect(imageData, amount, random, mode) {
  if (mode === "crtMask" || mode === "lcdStripes" || mode === "canvasWeave") {
    return mapPixels(imageData, (r, g, b, a, x, y) => {
      if (mode === "crtMask") {
        const scan = y % 3 === 0 ? 1 - amount * 0.34 : 1;
        const dim = 1 - amount * 0.32;
        const boost = 1 + amount * 0.22;
        const mask = x % 3 === 0 ? [boost, dim, dim] : x % 3 === 1 ? [dim, boost, dim] : [dim, dim, boost];
        const target = [clamp(r * scan * mask[0]), clamp(g * scan * mask[1]), clamp(b * scan * mask[2])];
        return blendRgb([r, g, b], target, 0.35 + amount * 0.65).concat(a);
      }
      if (mode === "lcdStripes") {
        const stripe = x % 4;
        const boost = 1 + amount * 0.24;
        const dim = 1 - amount * 0.18;
        const target = [
          clamp(r * (stripe === 0 ? boost : dim)),
          clamp(g * (stripe === 1 ? boost : dim)),
          clamp(b * (stripe === 2 ? boost : dim)),
        ];
        return blendRgb([r, g, b], target, 0.35 + amount * 0.65).concat(a);
      }
      const weave = (Math.sin(x * 0.45) + Math.cos(y * 0.5)) * amount * 12;
      return [clamp(r + weave), clamp(g + weave), clamp(b + weave), a];
    });
  }

  if (mode === "stipple") {
    return mapPixels(imageData, (r, g, b, a, x, y) => {
      const lum = luminance(r, g, b) / 255;
      const dot = pseudoNoise(x * 1.7, y * 1.7) > lum - amount * 0.25 ? 245 : 18;
      return blendRgb([r, g, b], [dot, dot, dot], 0.22 + amount * 0.58).concat(a);
    });
  }

  const output = canvasFromImageData(imageData);
  const outputCtx = output.getContext("2d", { willReadFrequently: true });
  const width = imageData.width;
  const height = imageData.height;

  outputCtx.save();
  if (mode === "crosshatch") {
    outputCtx.globalAlpha = 0.22 + amount * 0.28;
    outputCtx.strokeStyle = "#17191c";
    outputCtx.lineWidth = 1;
    const gap = Math.max(8, Math.round(34 - amount * 18));
    for (let x = -height; x < width; x += gap) {
      outputCtx.beginPath();
      outputCtx.moveTo(x, 0);
      outputCtx.lineTo(x + height, height);
      outputCtx.stroke();
    }
    for (let x = 0; x < width + height; x += gap * 1.4) {
      outputCtx.beginPath();
      outputCtx.moveTo(x, 0);
      outputCtx.lineTo(x - height, height);
      outputCtx.stroke();
    }
  } else if (mode === "bendayDots" || mode === "newsprintDots") {
    const cell = Math.max(7, Math.round(22 - amount * 10));
    outputCtx.globalAlpha = mode === "bendayDots" ? 0.58 : 0.68;
    for (let y = 0; y < height; y += cell) {
      for (let x = 0; x < width; x += cell) {
        const index = sampleIndex(x + cell / 2, y + cell / 2, width, height);
        const lum = luminance(imageData.data[index], imageData.data[index + 1], imageData.data[index + 2]) / 255;
        const radius = (1 - lum) * cell * (0.18 + amount * 0.42);
        outputCtx.fillStyle = mode === "bendayDots"
          ? (x / cell + y / cell) % 3 === 0 ? "#ff6f59" : "#ffd447"
          : "#17191c";
        outputCtx.beginPath();
        outputCtx.arc(x + cell / 2, y + cell / 2, radius, 0, Math.PI * 2);
        outputCtx.fill();
      }
    }
  }
  outputCtx.restore();

  return outputCtx.getImageData(0, 0, width, height);
}

function ditherEffect(imageData, amount) {
  const matrix = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ];

  return mapPixels(imageData, (r, g, b, a, x, y) => {
    const threshold = (matrix[y % 4][x % 4] / 16) * 255;
    const lum = luminance(r, g, b);
    const value = lum + (amount - 0.5) * 50 > threshold ? 255 : 0;
    return blendRgb([r, g, b], [value, value, value], 0.35 + amount * 0.62).concat(a);
  });
}

function blendImageData(original, effected, amount) {
  const out = cloneImageData(original);

  for (let index = 0; index < out.data.length; index += 4) {
    out.data[index] = clamp(original.data[index] * (1 - amount) + effected.data[index] * amount);
    out.data[index + 1] = clamp(original.data[index + 1] * (1 - amount) + effected.data[index + 1] * amount);
    out.data[index + 2] = clamp(original.data[index + 2] * (1 - amount) + effected.data[index + 2] * amount);
    out.data[index + 3] = original.data[index + 3];
  }

  return out;
}

function mapPixels(imageData, mapper) {
  const out = cloneImageData(imageData);
  const data = out.data;
  const width = out.width;
  const height = out.height;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const next = mapper(data[index], data[index + 1], data[index + 2], data[index + 3], x, y, width, height);
      data[index] = next[0];
      data[index + 1] = next[1];
      data[index + 2] = next[2];
      data[index + 3] = next[3];
    }
  }

  return out;
}

function canvasFromImageData(imageData) {
  const output = document.createElement("canvas");
  output.width = imageData.width;
  output.height = imageData.height;
  output.getContext("2d").putImageData(imageData, 0, 0);
  return output;
}

function downloadImage() {
  canvas.toBlob((blob) => {
    if (!blob) {
      setStatus("Download failed");
      return;
    }

    const recipeSlug = slugify(state.currentRecipe?.name || "original");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${state.fileName || "image-twist"}-${recipeSlug}.png`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("PNG downloaded");
  }, "image/png");
}

function cloneImageData(imageData) {
  return new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
}

function sanitizeName(name) {
  return name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "image-twist";
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function setStatus(message) {
  refs.statusLine.textContent = message;
}

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function clampUnit(value) {
  return Math.max(0, Math.min(1, value));
}

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.max(min, Math.min(max, Math.round(value)));
}

function luminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function saturate(r, g, b, amount) {
  const gray = luminance(r, g, b);
  return [
    clamp(gray + (r - gray) * amount),
    clamp(gray + (g - gray) * amount),
    clamp(gray + (b - gray) * amount),
  ];
}

function adjustContrast(r, g, b, amount) {
  return [
    clamp((r - 128) * amount + 128),
    clamp((g - 128) * amount + 128),
    clamp((b - 128) * amount + 128),
  ];
}

function mixRgb(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function blendRgb(a, b, amount) {
  return [
    clamp(a[0] * (1 - amount) + b[0] * amount),
    clamp(a[1] * (1 - amount) + b[1] * amount),
    clamp(a[2] * (1 - amount) + b[2] * amount),
  ];
}

function gradientMap(t, stops) {
  const scaled = t * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  const local = scaled - index;
  return mixRgb(stops[index], stops[index + 1], local);
}

function vignetteFactor(x, y, width, height, amount) {
  const dx = (x / width - 0.5) * 2;
  const dy = (y / height - 0.5) * 2;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return Math.max(0.25, 1 - distance * amount);
}

function pseudoNoise(x, y) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return (value - Math.floor(value) - 0.5) * 2;
}

function posterize(value, levels) {
  const step = 255 / (levels - 1);
  return Math.round(value / step) * step;
}

function edgeAmount(data, x, y, width, height) {
  const left = luminanceAt(data, x - 1, y, width, height);
  const right = luminanceAt(data, x + 1, y, width, height);
  const top = luminanceAt(data, x, y - 1, width, height);
  const bottom = luminanceAt(data, x, y + 1, width, height);
  return Math.abs(right - left) + Math.abs(bottom - top);
}

function luminanceAt(data, x, y, width, height) {
  const index = sampleIndex(x, y, width, height);
  return luminance(data[index], data[index + 1], data[index + 2]);
}

function sampleIndex(x, y, width, height) {
  const sx = Math.max(0, Math.min(width - 1, Math.round(x)));
  const sy = Math.max(0, Math.min(height - 1, Math.round(y)));
  return (sy * width + sx) * 4;
}

function copyPixel(src, dest, sourceIndex, destIndex) {
  dest[destIndex] = src[sourceIndex];
  dest[destIndex + 1] = src[sourceIndex + 1];
  dest[destIndex + 2] = src[sourceIndex + 2];
  dest[destIndex + 3] = src[sourceIndex + 3];
}

function mirrorUnit(value) {
  return value < 0.5 ? value * 2 : (1 - value) * 2;
}

function createRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}
