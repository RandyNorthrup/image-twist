const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");

function loadRecipeLibrary() {
  const source = fs.readFileSync("script.js", "utf8");
  const sandbox = createBrowserSandbox();

  return vm.runInNewContext(
    `${source}\n({ effectCatalog, recipes, transforms, state, refs, runChosenTwist, setStrengthFromSlider, scaledEffectAmount, effectBlendAmount });`,
    sandbox,
  );
}

function createBrowserSandbox() {
  const refs = new Map();
  const documentElement = {
    style: { setProperty() {} },
  };

  function createElement(tagName) {
    if (tagName === "canvas") {
      return createCanvas();
    }

    const listeners = {};
    const element = {
      attributes: {},
      children: [],
      value: "",
      textContent: "",
      disabled: false,
      clientWidth: 320,
      parentElement: null,
      append(child) {
        child.parentElement = element;
        element.children.push(child);
      },
      addEventListener(type, handler) {
        listeners[type] = handler;
      },
      dispatchEvent(event) {
        listeners[event.type]?.(event);
      },
      querySelectorAll(selector) {
        return selector === "option" ? element.children : [];
      },
      setAttribute(name, value) {
        element.attributes[name] = value;
      },
      closest() {
        return { getBoundingClientRect: () => ({ width: 320, height: 156 }) };
      },
      getBoundingClientRect() {
        return { width: 320, height: 56 };
      },
      classList: { add() {}, remove() {} },
      style: createStyle(),
    };

    Object.defineProperty(element, "scrollHeight", {
      get() {
        return Math.ceil(element.textContent.length / 20) * 20;
      },
    });

    return element;
  }

  function createStyle() {
    const values = {};
    return {
      setProperty(name, value) {
        values[name] = value;
      },
      getPropertyValue(name) {
        return values[name];
      },
    };
  }

  const document = {
    documentElement,
    body: {
      classList: { add() {}, remove() {} },
      append() {},
    },
    querySelector(selector) {
      if (selector === "#canvas") {
        return refs.get(selector) || setRef(selector, createCanvas());
      }

      return refs.get(selector) || setRef(selector, createElement("div"));
    },
    createElement,
  };

  const math = Object.create(Math);
  math.random = () => 0.42;

  return {
    console,
    document,
    Image: class Image {},
    Math: math,
    URL: { createObjectURL() { return "blob:test"; }, revokeObjectURL() {} },
    Uint8ClampedArray,
    ImageData: class ImageData {
      constructor(dataOrWidth, widthOrHeight, height) {
        if (typeof dataOrWidth === "number") {
          this.width = dataOrWidth;
          this.height = widthOrHeight;
          this.data = new Uint8ClampedArray(this.width * this.height * 4);
          return;
        }

        this.data = dataOrWidth;
        this.width = widthOrHeight;
        this.height = height;
      }
    },
    requestAnimationFrame() {},
    setTimeout(callback) { callback(); },
    window: {
      clearInterval() {},
      setInterval() { return 1; },
      setTimeout(callback) { callback(); },
    },
  };

  function setRef(selector, value) {
    refs.set(selector, value);
    return value;
  }
}

function createCanvas() {
  const context = createContext();

  return {
    width: 1200,
    height: 800,
    style: { setProperty() {} },
    getContext() {
      return context;
    },
    toBlob(callback) {
      callback({});
    },
  };
}

function createContext() {
  return {
    fillStyle: "",
    font: "",
    lineWidth: 1,
    strokeStyle: "",
    clearRect() {},
    drawImage() {},
    fillRect() {},
    strokeRect() {},
    beginPath() {},
    arc() {},
    fill() {},
    moveTo() {},
    bezierCurveTo() {},
    lineTo() {},
    closePath() {},
    fillText() {},
    createLinearGradient() {
      return { addColorStop() {} };
    },
    getImageData(x, y, width, height) {
      return {
        width,
        height,
        data: new Uint8ClampedArray(width * height * 4),
      };
    },
    putImageData() {},
  };
}

test("recipe library contains over 100 unique single-effect recipes", () => {
  const { effectCatalog, recipes, transforms } = loadRecipeLibrary();
  const ids = new Set(recipes.map((recipe) => recipe.id));
  const names = new Set(recipes.map((recipe) => recipe.name));
  const transformIds = new Set(Object.keys(transforms));
  const signatures = new Set(recipes.map((recipe) => recipe.steps.map(([name, amount]) => `${name}:${amount}`).join("|")));

  assert.equal(recipes.length, 110);
  assert.equal(effectCatalog.length, recipes.length);
  assert.equal(transformIds.size, recipes.length);
  assert.ok(recipes.length > 100);
  assert.equal(ids.size, recipes.length);
  assert.equal(names.size, recipes.length);
  assert.equal(signatures.size, recipes.length);
});

test("twist dropdown starts on Original placeholder", () => {
  const { refs } = loadRecipeLibrary();
  const [placeholder] = refs.twistSelect.children;

  assert.equal(refs.twistSelect.value, "");
  assert.equal(placeholder.textContent, "Original");
  assert.equal(placeholder.value, "");
  assert.equal(placeholder.disabled, true);
});

test("each recipe is one effect, not a merged chain", () => {
  const { recipes, transforms } = loadRecipeLibrary();

  recipes.forEach((recipe) => {
    assert.equal(recipe.steps.length, 1, `${recipe.name} merges multiple effects`);
    assert.equal(recipe.steps[0][0], recipe.id, `${recipe.name} does not point at its own effect`);
    assert.equal(typeof transforms[recipe.id], "function", `${recipe.name} has no unique transform`);
  });
});

test("effect catalog covers multiple researched filter families", () => {
  const { effectCatalog } = loadRecipeLibrary();
  const types = new Set(effectCatalog.map((effect) => effect.type));

  [
    "direct",
    "tone",
    "gradient",
    "channel",
    "poster",
    "threshold",
    "kernel",
    "geometry",
    "overlay",
    "pattern",
    "dither",
  ].forEach((type) => assert.ok(types.has(type), `missing ${type} effect family`));
});

test("recipe library is not built from generated variant suffixes", () => {
  const { recipes } = loadRecipeLibrary();
  const oldVariantSuffixes = [
    "-neon-chroma",
    "-prism-light-leak",
    "-pixel-noise",
    "-mirror-burst",
  ];

  recipes.forEach((recipe) => {
    assert.equal(recipe.name.includes(":"), false, `${recipe.name} looks like a generated variant`);
    oldVariantSuffixes.forEach((suffix) => {
      assert.equal(recipe.id.endsWith(suffix), false, `${recipe.id} keeps old generated variant suffix`);
    });
  });
});

test("every recipe step points to a real transform and valid amount", () => {
  const { recipes, transforms } = loadRecipeLibrary();

  recipes.forEach((recipe) => {
    assert.ok(recipe.id);
    assert.ok(recipe.name);
    assert.match(recipe.accent, /^#[0-9a-f]{6}$/i);
    assert.equal(recipe.steps.length, 1);

    recipe.steps.forEach(([stepName, amount]) => {
      assert.equal(typeof transforms[stepName], "function", `${recipe.name} uses missing transform ${stepName}`);
      assert.equal(typeof amount, "number");
      assert.ok(amount >= 0 && amount <= 1, `${recipe.name} ${stepName} amount out of range`);
    });
  });
});

test("twist button still avoids repeating current selected recipe", () => {
  const { recipes, refs, state, runChosenTwist } = loadRecipeLibrary();
  state.source = { width: 2, height: 2, data: new Uint8ClampedArray(16) };
  state.currentRecipe = recipes[0];
  refs.twistSelect.value = recipes[0].id;

  runChosenTwist();

  assert.notEqual(state.currentRecipe, recipes[0]);
});

test("changing dropdown applies selected recipe immediately", () => {
  const { recipes, refs, state } = loadRecipeLibrary();
  const selectedRecipe = recipes[47];
  state.source = { width: 2, height: 2, data: new Uint8ClampedArray(16) };
  refs.twistSelect.value = selectedRecipe.id;

  refs.twistSelect.dispatchEvent({ type: "change" });

  assert.equal(state.currentRecipe, selectedRecipe);
});

test("intensity slider maps full range from near original to full effect", () => {
  const { refs, state, setStrengthFromSlider, scaledEffectAmount, effectBlendAmount } = loadRecipeLibrary();
  refs.strengthInput.value = "100";

  setStrengthFromSlider(false);

  assert.equal(state.strength, 1);
  assert.equal(refs.strengthInput.textContent, "");
  assert.equal(refs.strengthInput.ariaValueText || refs.strengthInput.attributes?.["aria-valuetext"], "100% intensity");
  assert.equal(refs.strengthInput.style.getPropertyValue("--strength-fill"), "100%");
  assert.equal(effectBlendAmount(), 1);
  assert.ok(Math.abs(scaledEffectAmount(0.4, () => 0.5) - 0.4) < Number.EPSILON * 4);

  refs.strengthInput.value = "0";
  setStrengthFromSlider(false);

  assert.equal(state.strength, 0);
  assert.equal(refs.strengthInput.ariaValueText || refs.strengthInput.attributes?.["aria-valuetext"], "0% intensity");
  assert.equal(refs.strengthInput.style.getPropertyValue("--strength-fill"), "0%");
  assert.equal(effectBlendAmount(), 0.02);
  assert.ok(Math.abs(scaledEffectAmount(0.4, () => 0.95) - 0.08) < Number.EPSILON * 4);
});
