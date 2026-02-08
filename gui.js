/**
 * GUI Application Entry Point
 *
 * This file initializes the modular architecture and provides the main API
 * for the p5.js sketch. It coordinates between:
 * - Core: ParameterStore, LFOEngine, PresetManager
 * - UI: GUIBuilder, GUIController, JoystickWidget
 * - Rendering: ShaderBridge
 */

// Initialize parameter store with defaults
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

// Global module instances
let guiBuilder;
let guiController;
let shaderBridge;

// Legacy globals for backwards compatibility
let params = parameterStore.getAll(); // Used by sketch.js draw loop
let activeLFOMap = null; // Exposed for external reference

function setupGUI() {
  // Create instances
  guiBuilder = new GUIBuilder();
  guiController = new GUIController(parameterStore, presetManager, lfoEngine);
  shaderBridge = new ShaderBridge(parameterStore);

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
function setShaderUniforms(animTime) {
  shaderBridge.setUniforms(myShader, width, height, animTime);
}
