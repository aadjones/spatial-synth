let myShader;
let lfoEngine;

// Backwards compatibility - expose activeLFOMap for GUI
let activeLFOMap = null;

function preload() {
  myShader = loadShader('shader.vert', 'fm.frag');
}

function setup() {
  createMyCanvas();

  // Initialize LFO engine
  lfoEngine = new LFOEngine(parameterStore);

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
// Presets
////////////////////////////////////////

function gentleWaves() {
  lfoEngine.setMap({
    carrierFreqX: { frequency: 0.2, amplitude: 0.3, center: 0.5, phase: 0 },
    carrierFreqY: { frequency: 0.15, amplitude: 0.2, center: 0.5, phase: Math.PI / 2 },
    modulatorFreq: { frequency: 0.1, amplitude: 0.2, center: 0.5, phase: Math.PI },
  });
}

function wildRipples() {
  lfoEngine.setMap({
    carrierFreqX: { frequency: 0.8, amplitude: 0.6, center: 0.7, phase: 0 },
    carrierFreqY: { frequency: 0.6, amplitude: 0.5, center: 0.7, phase: Math.PI / 3 },
    modulatorFreq: { frequency: 0.4, amplitude: 0.4, center: 0.6, phase: Math.PI / 2 },
    modulationIndex: { frequency: 0.3, amplitude: 1.5, center: 2.0, phase: Math.PI },
  });
}

function pulsatingEye() {
  lfoEngine.setMap({
    modulationIndex: { frequency: 0.2, amplitude: 1.5, center: 2.0, phase: 0 },
    amplitudeModulationIndex: { frequency: 0.15, amplitude: 1.0, center: 1.5, phase: Math.PI / 2 },
    modulationCenterX: { frequency: 0.1, amplitude: 0.5, center: 0.0, phase: 0 },
    modulationCenterY: { frequency: 0.1, amplitude: 0.5, center: 0.0, phase: Math.PI / 2 },
  });
}

function manualMode() {
  lfoEngine.clear();
}
