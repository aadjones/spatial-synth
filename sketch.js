let myShader;
let lfoEngine;
let presetManager;

function preload() {
  myShader = loadShader('shader.vert', 'fm.frag');
}

function setup() {
  createMyCanvas();

  // Initialize LFO engine
  lfoEngine = new LFOEngine(parameterStore);

  // Initialize preset manager
  presetManager = new PresetManager(lfoEngine);

  setupGUI();
}

function draw() {
  // Update LFO-controlled parameters
  lfoEngine.update(millis() / 1000.0);

  // Keep legacy params object in sync for setShaderUniforms
  params = parameterStore.getAll();

  // Keep activeLFOMap in sync for GUI
  activeLFOMap = lfoEngine.getMap();

  updateGUI();
  setShaderUniforms();
  shader(myShader);
  rect(0, 0, width, height);
}

function mousePressed() {
  // Don't trigger fullscreen if landing page is still visible
  const landingPage = document.getElementById('landing-page');
  if (landingPage && landingPage.style.display !== 'none') {
    return;
  }

  if (!fullscreen()) {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}

function keyPressed() {
  if (keyCode === ESCAPE && fullscreen()) {
    fullscreen(false);
  }

  // Save screenshot with 's' key
  if (key === 's' || key === 'S') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    saveCanvas(`synthesizer-${timestamp}`, 'png');
  }
}

function createMyCanvas() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

////////////////////////////////////////
// Presets - Backwards compatibility wrappers
////////////////////////////////////////

function gentleWaves() {
  presetManager.apply('gentleWaves');
}

function wildRipples() {
  presetManager.apply('wildRipples');
}

function pulsatingEye() {
  presetManager.apply('pulsatingEye');
}

function manualMode() {
  presetManager.apply('manual');
}
