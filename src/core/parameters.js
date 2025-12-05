/**
 * ParameterStore - Single source of truth for all synthesizer parameters
 *
 * Responsibilities:
 * - Owns all parameter state
 * - Validates and clamps values on update
 * - Notifies subscribers of changes
 * - No dependencies on DOM, p5.js, or rendering
 */

const ParameterStore = (function () {
  class ParameterStore {
    constructor(initialParams) {
      this._params = { ...initialParams };
      this._subscribers = [];
      this._paramDefinitions = this._buildDefinitions();
    }

    /**
     * Define parameter constraints and metadata
     */
    _buildDefinitions() {
      return {
        // Stripes - Base wave
        carrierFreqX: { min: 0.1, max: 10, default: 2.0 },
        carrierFreqY: { min: 0.1, max: 10, default: 2.0 },

        // Warp box - Space modulator
        modulatorFreq: { min: 0.1, max: 10, default: 1.0 },
        modulationIndex: { min: 0, max: 5, default: 2.0 },
        amplitudeModulationIndex: { min: 0, max: 5, default: 1.0 },
        modulationCenterX: { min: -1, max: 1, default: 0.0 },
        modulationCenterY: { min: -1, max: 1, default: 0.0 },

        // Dance - Time modulator
        speedLevel: { min: 1, max: 5, default: 1, isInteger: true },
        intensityLevel: { min: 1, max: 5, default: 3, isInteger: true },
        lfoFrequency: { min: 0, max: 10, default: 0.1 },
        lfoAmplitude: { min: 0, max: 10, default: 0.5 },
      };
    }

    /**
     * Get a parameter value
     */
    get(key) {
      if (!(key in this._params)) {
        console.warn(`Parameter "${key}" does not exist`);
        return undefined;
      }
      return this._params[key];
    }

    /**
     * Set a parameter value with validation
     */
    set(key, value) {
      if (!(key in this._params)) {
        console.warn(`Parameter "${key}" does not exist`);
        return;
      }

      const def = this._paramDefinitions[key];
      let newValue = value;

      // Clamp to min/max
      if (def.min !== undefined) {
        newValue = Math.max(def.min, newValue);
      }
      if (def.max !== undefined) {
        newValue = Math.min(def.max, newValue);
      }

      // Round to integer if needed
      if (def.isInteger) {
        newValue = Math.round(newValue);
      }

      // Only update and notify if value changed
      if (this._params[key] !== newValue) {
        const oldValue = this._params[key];
        this._params[key] = newValue;
        this._notify(key, newValue, oldValue);
      }
    }

    /**
     * Get all parameters as an object
     */
    getAll() {
      return { ...this._params };
    }

    /**
     * Set multiple parameters at once
     */
    setMultiple(updates) {
      Object.entries(updates).forEach(([key, value]) => {
        this.set(key, value);
      });
    }

    /**
     * Subscribe to parameter changes
     * @param {Function} callback - Called with (key, newValue, oldValue)
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
      this._subscribers.push(callback);
      return () => {
        const index = this._subscribers.indexOf(callback);
        if (index > -1) {
          this._subscribers.splice(index, 1);
        }
      };
    }

    /**
     * Notify subscribers of parameter change
     */
    _notify(key, newValue, oldValue) {
      this._subscribers.forEach((callback) => {
        try {
          callback(key, newValue, oldValue);
        } catch (error) {
          console.error("Error in parameter subscriber:", error);
        }
      });
    }

    /**
     * Reset a parameter to its default value
     */
    reset(key) {
      const def = this._paramDefinitions[key];
      if (def && def.default !== undefined) {
        this.set(key, def.default);
      }
    }

    /**
     * Reset all parameters to defaults
     */
    resetAll() {
      Object.keys(this._paramDefinitions).forEach((key) => {
        this.reset(key);
      });
    }
  }

  return ParameterStore;
})();
