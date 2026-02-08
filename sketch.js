/**
 * Main p5.js Sketch
 *
 * This is the p5.js application entry point. It handles:
 * - Shader loading and rendering
 * - Main draw loop coordination
 * - LFO engine updates
 * - Canvas setup and user interactions (fullscreen, screenshots)
 */

let myShader;
let lfoEngine;
let presetManager;

// Animation pause state
let animationPaused = false;
let pauseTimeOffset = 0;
let lastPauseStart = 0;

function getAnimationTime() {
  if (animationPaused) {
    return lastPauseStart - pauseTimeOffset;
  }
  return millis() - pauseTimeOffset;
}

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
  const animTime = getAnimationTime();

  // Update LFO-controlled parameters
  lfoEngine.update(animTime / 1000.0);

  // Keep legacy params object in sync for setShaderUniforms
  params = parameterStore.getAll();

  // Keep activeLFOMap in sync for GUI
  activeLFOMap = lfoEngine.getMap();

  updateGUI();
  setShaderUniforms(animTime);
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

  // Toggle animation pause with spacebar
  if (key === ' ') {
    if (animationPaused) {
      pauseTimeOffset += millis() - lastPauseStart;
      animationPaused = false;
      // Sync any speed/intensity changes made while frozen
      guiController.syncDanceParams();
    } else {
      lastPauseStart = millis();
      animationPaused = true;
    }
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
