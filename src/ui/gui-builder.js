/**
 * GUIBuilder - Constructs the HTML structure for the synthesizer GUI
 *
 * Responsibilities:
 * - Builds the DOM structure for all controls
 * - Returns HTML strings and references
 * - No event handling or state management
 * - Pure construction logic
 */

const GUIBuilder = (function () {
  class GUIBuilder {
    /**
     * Build the complete GUI HTML structure
     * @param {Object} initialParams - Initial parameter values for control defaults
     * @returns {string} HTML string
     */
    buildHTML(initialParams) {
      return `
        <div id="custom-gui" role="complementary" aria-label="Control panel">
          ${this._buildHandle()}
          ${this._buildPresetsSection()}
          ${this._buildControlSections(initialParams)}
        </div>
      `;
    }

    /**
     * Build the collapsible handle
     */
    _buildHandle() {
      return `
        <div class="gui-handle" id="gui-handle" role="button" aria-label="Toggle controls" tabindex="0">
          <span class="handle-text">hide/show controls</span>
          <span class="handle-icon">▼</span>
        </div>
      `;
    }

    /**
     * Build the presets section
     */
    _buildPresetsSection() {
      return `
        <div class="gui-section presets-section">
          <div class="presets-layout">
            <div class="preset-group">
              <h3>YOUR CREATION</h3>
              <div class="preset-buttons">
                <button onclick="setPreset('manual')" class="preset-btn" data-preset="manual">MANUAL</button>
              </div>
            </div>
            <div class="preset-divider"></div>
            <div class="preset-group">
              <h3>ARTIST'S CREATIONS</h3>
              <div class="preset-buttons">
                <button onclick="setPreset('gentleWaves')" class="preset-btn" data-preset="gentleWaves">GENTLE WAVES</button>
                <button onclick="setPreset('wildRipples')" class="preset-btn" data-preset="wildRipples">WILD RIPPLE</button>
                <button onclick="setPreset('pulsatingEye')" class="preset-btn" data-preset="pulsatingEye">PULSATING EYE</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    /**
     * Build the three main control sections
     */
    _buildControlSections(params) {
      return `
        <div class="gui-sections-row">
          ${this._buildStripesSection(params)}
          ${this._buildWarpSection(params)}
          ${this._buildDanceSection(params)}
        </div>
      `;
    }

    /**
     * Build the Stripes section
     */
    _buildStripesSection(params) {
      return `
        <div class="gui-section">
          <h3>STRIPES - THE BASE WAVE</h3>
          <div class="control-group">
            <label>vertical</label>
            <input type="range" id="carrierFreqX" min="0.1" max="10" step="0.01" value="${params.carrierFreqX}">
          </div>
          <div class="control-group">
            <label>horizontal</label>
            <input type="range" id="carrierFreqY" min="0.1" max="10" step="0.01" value="${params.carrierFreqY}">
          </div>
        </div>
      `;
    }

    /**
     * Build the Warp Box section
     */
    _buildWarpSection(params) {
      return `
        <div class="gui-section">
          <h3>WARP BOX - SPACE MODULATOR</h3>
          <div class="warp-controls">
            <div class="warp-sliders">
              <div class="control-group">
                <label>ripples</label>
                <input type="range" id="modulatorFreq" min="0.1" max="10" step="0.01" value="${params.modulatorFreq}">
              </div>
              <div class="control-group">
                <label>twist</label>
                <input type="range" id="modulationIndex" min="0" max="5" step="0.05" value="${params.modulationIndex}">
              </div>
              <div class="control-group">
                <label>sharpen</label>
                <input type="range" id="amplitudeModulationIndex" min="0" max="5" step="0.05" value="${params.amplitudeModulationIndex}">
              </div>
            </div>
            <div class="eye-joystick-container">
              <div class="eye-label">the eye</div>
              <canvas id="eyeJoystick" width="70" height="70"></canvas>
            </div>
          </div>
        </div>
      `;
    }

    /**
     * Build the Dance section
     */
    _buildDanceSection(params) {
      return `
        <div class="gui-section dance-section">
          <h3>DANCE - TIME MODULATOR</h3>
          <div class="dance-controls-horizontal">
            <div class="level-control">
              <label>speed</label>
              <div class="level-arrows">
                <button class="arrow-btn" id="speed-up" onclick="changeSpeed(1)">▲</button>
                <span class="level-display" id="speed-level">${params.speedLevel}</span>
                <button class="arrow-btn" id="speed-down" onclick="changeSpeed(-1)">▼</button>
              </div>
            </div>
            <div class="level-control">
              <label>intensity</label>
              <div class="level-arrows">
                <button class="arrow-btn" id="intensity-up" onclick="changeIntensity(1)">▲</button>
                <span class="level-display" id="intensity-level">${params.intensityLevel}</span>
                <button class="arrow-btn" id="intensity-down" onclick="changeIntensity(-1)">▼</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    /**
     * Create and append accessibility live region
     * @returns {HTMLElement} The live region element
     */
    createLiveRegion() {
      const liveRegion = document.createElement("div");
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      liveRegion.className = "sr-only";
      liveRegion.style.position = "absolute";
      liveRegion.style.left = "-10000px";
      liveRegion.style.width = "1px";
      liveRegion.style.height = "1px";
      liveRegion.style.overflow = "hidden";
      return liveRegion;
    }
  }

  return GUIBuilder;
})();
