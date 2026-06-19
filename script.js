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
};

const MAX_SIDE = 2100;

const state = {
  source: null,
  fileName: "image-twist",
  currentRecipe: null,
  autoTimer: null,
  isRendering: false,
  seed: 1,
};

const recipes = [
  {
    id: "candy-portal",
    name: "Candy Portal",
    accent: "#ff6fbc",
    steps: [
      ["duotone", 0.95],
      ["swirl", 0.62],
      ["confetti", 0.8],
    ],
  },
  {
    id: "glitch-carnival",
    name: "Glitch Carnival",
    accent: "#40c9c6",
    steps: [
      ["pop", 0.7],
      ["glitch", 0.95],
      ["neon", 0.76],
      ["scanlines", 0.56],
    ],
  },
  {
    id: "comic-blast",
    name: "Comic Blast",
    accent: "#ffd447",
    steps: [
      ["comic", 0.9],
      ["halftone", 0.34],
      ["burst", 0.72],
    ],
  },
  {
    id: "arcade-night",
    name: "Arcade Night",
    accent: "#29ff72",
    steps: [
      ["nightVision", 0.92],
      ["glitch", 0.42],
      ["scanlines", 0.9],
    ],
  },
  {
    id: "heatwave-poster",
    name: "Heatwave Poster",
    accent: "#ff6f59",
    steps: [
      ["heatMap", 0.98],
      ["comic", 0.35],
      ["burst", 0.42],
    ],
  },
  {
    id: "pixel-popcorn",
    name: "Pixel Popcorn",
    accent: "#c7f464",
    steps: [
      ["pixelate", 0.78],
      ["pop", 0.88],
      ["confetti", 0.66],
    ],
  },
  {
    id: "mirror-maze",
    name: "Mirror Maze",
    accent: "#7c65ff",
    steps: [
      ["mirror", 0.72],
      ["duotone", 0.62],
      ["neon", 0.48],
    ],
  },
  {
    id: "ascii-dream",
    name: "ASCII Dream",
    accent: "#c7f464",
    steps: [
      ["ascii", 0.74],
      ["glitch", 0.18],
      ["scanlines", 0.5],
    ],
  },
  {
    id: "retro-booth",
    name: "Retro Booth",
    accent: "#c59b62",
    steps: [
      ["oldPhoto", 0.9],
      ["burst", 0.24],
      ["confetti", 0.28],
    ],
  },
  {
    id: "mosaic-party",
    name: "Mosaic Party",
    accent: "#40c9c6",
    steps: [
      ["mosaic", 0.82],
      ["pop", 0.72],
      ["confetti", 0.9],
    ],
  },
  {
    id: "kaleido-soda",
    name: "Kaleido Soda",
    accent: "#7c65ff",
    steps: [
      ["kaleidoscope", 0.78],
      ["pop", 0.75],
      ["prismBands", 0.7],
    ],
  },
  {
    id: "prism-rain",
    name: "Prism Rain",
    accent: "#40c9c6",
    steps: [
      ["chromaWave", 0.86],
      ["rainbowBands", 0.82],
      ["lightLeaks", 0.62],
    ],
  },
  {
    id: "sticker-bomb",
    name: "Sticker Bomb",
    accent: "#ffd447",
    steps: [
      ["pop", 0.72],
      ["stickers", 0.92],
      ["comic", 0.22],
    ],
  },
  {
    id: "vhs-ghost",
    name: "VHS Ghost",
    accent: "#ff6f59",
    steps: [
      ["ghostTrail", 0.76],
      ["glitch", 0.52],
      ["scanlines", 0.88],
      ["noiseSnow", 0.42],
    ],
  },
  {
    id: "solar-flare",
    name: "Solar Flare",
    accent: "#ffb000",
    steps: [
      ["solarize", 0.88],
      ["lightLeaks", 0.9],
      ["burst", 0.72],
    ],
  },
  {
    id: "blueprint-beam",
    name: "Blueprint Beam",
    accent: "#2f80ed",
    steps: [
      ["blueprint", 0.86],
      ["scanlines", 0.28],
      ["gridOverlay", 0.5],
    ],
  },
  {
    id: "bubble-wrap",
    name: "Bubble Wrap",
    accent: "#40c9c6",
    steps: [
      ["glassBlocks", 0.45],
      ["bubbles", 0.88],
      ["duotone", 0.24],
    ],
  },
  {
    id: "paint-splash",
    name: "Paint Splash",
    accent: "#ff6f59",
    steps: [
      ["pop", 0.82],
      ["paintSplats", 0.92],
      ["halftone", 0.18],
    ],
  },
  {
    id: "slice-shuffle",
    name: "Slice Shuffle",
    accent: "#c7f464",
    steps: [
      ["sliceShuffle", 0.88],
      ["chromaWave", 0.4],
      ["confetti", 0.32],
    ],
  },
  {
    id: "dream-bloom",
    name: "Dream Bloom",
    accent: "#ff9de2",
    steps: [
      ["softBloom", 0.86],
      ["duotone", 0.42],
      ["lightLeaks", 0.6],
    ],
  },
  {
    id: "xerox-jam",
    name: "Xerox Jam",
    accent: "#17191c",
    steps: [
      ["xerox", 0.82],
      ["sliceShuffle", 0.32],
      ["noiseSnow", 0.7],
    ],
  },
  {
    id: "glass-blocks",
    name: "Glass Blocks",
    accent: "#40c9c6",
    steps: [
      ["glassBlocks", 0.86],
      ["neon", 0.4],
      ["rainbowBands", 0.28],
    ],
  },
  {
    id: "rainbow-tunnel",
    name: "Rainbow Tunnel",
    accent: "#7c65ff",
    steps: [
      ["swirl", 0.7],
      ["rainbowBands", 0.95],
      ["kaleidoscope", 0.28],
    ],
  },
  {
    id: "poster-punch",
    name: "Poster Punch",
    accent: "#ff6f59",
    steps: [
      ["posterPunch", 0.9],
      ["comic", 0.5],
      ["gridOverlay", 0.28],
    ],
  },
  {
    id: "frosted-lens",
    name: "Frosted Lens",
    accent: "#9ee8ff",
    steps: [
      ["glassBlocks", 0.55],
      ["softBloom", 0.54],
      ["bubbles", 0.38],
    ],
  },
];

const transforms = {
  pop: popColor,
  duotone,
  heatMap,
  oldPhoto,
  nightVision,
  comic,
  neon: neonEdge,
  glitch,
  pixelate,
  halftone,
  ascii,
  mirror: mirrorFold,
  swirl,
  mosaic,
  kaleidoscope,
  prismBands,
  chromaWave,
  rainbowBands,
  lightLeaks,
  stickers,
  ghostTrail,
  solarize,
  blueprint,
  gridOverlay,
  glassBlocks,
  bubbles,
  paintSplats,
  sliceShuffle,
  softBloom,
  xerox,
  noiseSnow,
  posterPunch,
  confetti,
  burst,
  scanlines,
};

init();

function init() {
  populateTwistSelect();
  bindEvents();
  loadSample();
}

function populateTwistSelect() {
  refs.twistSelect.innerHTML = "";

  recipes.forEach((recipe) => {
    const option = document.createElement("option");
    option.value = recipe.id;
    option.textContent = recipe.name;
    refs.twistSelect.append(option);
  });
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
    if (!state.currentRecipe) {
      refs.recipeName.textContent = "Original";
    }
  });

  refs.twistAgain.addEventListener("click", () => runChosenTwist());
  refs.downloadImage.addEventListener("click", downloadImage);
  refs.autoParty.addEventListener("click", toggleAutoParty);

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
  refs.recipeName.textContent = "Original";
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

function runRandomTwist() {
  runTwist(pickRecipe());
}

function runTwist(recipe) {
  if (!state.source || state.isRendering || !recipe) {
    return;
  }

  state.isRendering = true;
  state.currentRecipe = recipe;
  state.seed = Math.floor(Math.random() * 1000000) + 1;
  document.documentElement.style.setProperty("--accent", recipe.accent);
  refs.recipeName.textContent = recipe.name;
  refs.twistSelect.value = recipe.id;
  refs.twistAgain.disabled = true;
  refs.twistSelect.disabled = true;
  refs.downloadImage.disabled = true;
  document.body.classList.add("is-twisting");
  setStatus("Twisting...");

  requestAnimationFrame(() => {
    try {
      const random = createRandom(state.seed);
      let working = cloneImageData(state.source);

      recipe.steps.forEach(([stepName, baseAmount], index) => {
        const transform = transforms[stepName];
        const amount = clampUnit(baseAmount + (random() - 0.5) * 0.18);
        working = transform(working, amount, random, index);
      });

      ctx.putImageData(working, 0, 0);
      setStatus(`${recipe.name} - ${canvas.width} x ${canvas.height}`);
    } catch (error) {
      console.error(error);
      setStatus("Twist failed");
    } finally {
      state.isRendering = false;
      refs.twistAgain.disabled = false;
      refs.twistSelect.disabled = false;
      refs.downloadImage.disabled = false;
      window.setTimeout(() => document.body.classList.remove("is-twisting"), 380);
    }
  });
}

function showOriginal() {
  if (!state.source) {
    return;
  }

  ctx.putImageData(state.source, 0, 0);
  state.currentRecipe = null;
  refs.recipeName.textContent = "Original";
  setStatus(`Original - ${canvas.width} x ${canvas.height}`);
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
