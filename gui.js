// Initialize parameter store
const parameterStore = new ParameterStore({
  carrierFreqX: 0.5,
  carrierFreqY: 0.5,
  modulatorFreq: 0.5,
  modulationIndex: 1.0,
  amplitudeModulationIndex: 1.0,
  modulationCenterX: 0.0,
  modulationCenterY: 0.0,
  lfoFrequency: 0.1,
  lfoAmplitude: 0.5,
  speedLevel: 1, // 1-5 discrete
  intensityLevel: 3, // 1-5 discrete
});

// Backwards compatibility - keep params object for now
let params = parameterStore.getAll();

// Global GUI instances
let guiBuilder;
let guiController;

// Backwards compatibility - expose activeLFOMap for shader bridge
let activeLFOMap = null;

function setupGUI() {
  // Create builder and controller
  guiBuilder = new GUIBuilder();
  guiController = new GUIController(parameterStore, presetManager, lfoEngine);

  // Build and insert HTML
  const html = guiBuilder.buildHTML(parameterStore.getAll());
  document.body.insertAdjacentHTML('beforeend', html);

  // Create and attach live region
  const liveRegion = guiBuilder.createLiveRegion();
  document.body.appendChild(liveRegion);
  guiController.setLiveRegion(liveRegion);

  // Initialize controller
  guiController.initialize();
}

// Backwards compatibility wrapper for preset switching
function setPreset(presetName) {
  guiController.setPreset(presetName);
}

// Backwards compatibility wrappers for dance controls
function changeSpeed(delta) {
  guiController.changeSpeed(delta);
}

function changeIntensity(delta) {
  guiController.changeIntensity(delta);
}

// Called from draw loop
function updateGUI() {
  // Keep legacy params object in sync
  params = parameterStore.getAll();

  // Keep activeLFOMap in sync for shader bridge
  activeLFOMap = lfoEngine.getMap();

  // Update GUI display
  guiController.update();
}

// Shader bridge - called from draw loop
function setShaderUniforms() {
  myShader.setUniform('u_resolution', [width, height]);
  myShader.setUniform('u_carrierFreqX', params.carrierFreqX);
  myShader.setUniform('u_carrierFreqY', params.carrierFreqY);
  myShader.setUniform('u_modulatorFreq', params.modulatorFreq);
  myShader.setUniform('u_modulationIndex', params.modulationIndex);
  myShader.setUniform('u_modulationCenter', [
    2 * params.modulationCenterX,
    2 * params.modulationCenterY,
  ]);
  myShader.setUniform('u_amplitudeModulationIndex', params.amplitudeModulationIndex);
  myShader.setUniform('u_lfoFrequency', params.lfoFrequency);
  myShader.setUniform('u_lfoAmplitude', params.lfoAmplitude);
  myShader.setUniform('u_time', millis() / 1000.0);
}
