/**
 * PresetManager - Manages synthesizer presets
 *
 * Responsibilities:
 * - Stores preset definitions as data
 * - Provides API to apply presets via LFOEngine
 * - Tracks currently active preset
 * - Makes it easy to add new presets
 */

const PresetManager = (function () {
  class PresetManager {
    constructor(lfoEngine) {
      this._lfoEngine = lfoEngine;
      this._currentPreset = 'manual';

      // Preset definitions
      this._presets = {
        manual: null, // null means no LFO automation

        gentleWaves: {
          carrierFreqX: { frequency: 0.2, amplitude: 0.3, center: 0.5, phase: 0 },
          carrierFreqY: { frequency: 0.15, amplitude: 0.2, center: 0.5, phase: Math.PI / 2 },
          modulatorFreq: { frequency: 0.1, amplitude: 0.2, center: 0.5, phase: Math.PI },
        },

        wildRipples: {
          carrierFreqX: { frequency: 0.8, amplitude: 0.6, center: 0.7, phase: 0 },
          carrierFreqY: { frequency: 0.6, amplitude: 0.5, center: 0.7, phase: Math.PI / 3 },
          modulatorFreq: { frequency: 0.4, amplitude: 0.4, center: 0.6, phase: Math.PI / 2 },
          modulationIndex: { frequency: 0.3, amplitude: 1.5, center: 2.0, phase: Math.PI },
        },

        pulsatingEye: {
          modulationIndex: { frequency: 0.2, amplitude: 1.5, center: 2.0, phase: 0 },
          amplitudeModulationIndex: { frequency: 0.15, amplitude: 1.0, center: 1.5, phase: Math.PI / 2 },
          modulationCenterX: { frequency: 0.1, amplitude: 0.5, center: 0.0, phase: 0 },
          modulationCenterY: { frequency: 0.1, amplitude: 0.5, center: 0.0, phase: Math.PI / 2 },
        },
      };
    }

    /**
     * Apply a preset by name
     * @param {string} presetName - Name of the preset to apply
     * @returns {boolean} - True if preset exists and was applied
     */
    apply(presetName) {
      if (!(presetName in this._presets)) {
        console.warn(`Preset "${presetName}" not found`);
        return false;
      }

      const lfoMap = this._presets[presetName];

      if (lfoMap === null) {
        // Manual mode - clear LFO automation
        this._lfoEngine.clear();
      } else {
        // Apply LFO map
        this._lfoEngine.setMap(lfoMap);
      }

      this._currentPreset = presetName;
      return true;
    }

    /**
     * Get the currently active preset name
     * @returns {string}
     */
    getCurrent() {
      return this._currentPreset;
    }

    /**
     * Get list of all available preset names
     * @returns {Array<string>}
     */
    list() {
      return Object.keys(this._presets);
    }

    /**
     * Check if a preset exists
     * @param {string} presetName
     * @returns {boolean}
     */
    has(presetName) {
      return presetName in this._presets;
    }
  }

  return PresetManager;
})();
