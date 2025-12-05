/**
 * LFOEngine - Manages Low Frequency Oscillator (LFO) parameter automation
 *
 * Responsibilities:
 * - Stores and manages the active LFO map
 * - Calculates sinusoidal LFO values based on time
 * - Updates parameters through the ParameterStore
 * - No dependencies on DOM or rendering
 */

const LFOEngine = (function () {
  class LFOEngine {
    constructor(parameterStore) {
      this._parameterStore = parameterStore;
      this._activeLFOMap = null;
    }

    /**
     * Set the active LFO map
     * @param {Object|null} lfoMap - Map of parameter names to LFO configs
     *   Each config: { frequency, amplitude, center, phase }
     */
    setMap(lfoMap) {
      this._activeLFOMap = lfoMap;
    }

    /**
     * Get the active LFO map
     */
    getMap() {
      return this._activeLFOMap;
    }

    /**
     * Check if LFO system is active
     */
    isActive() {
      return this._activeLFOMap !== null;
    }

    /**
     * Check if a specific parameter is being controlled by LFO
     */
    isParameterControlled(paramName) {
      return this._activeLFOMap && paramName in this._activeLFOMap;
    }

    /**
     * Update all LFO-controlled parameters based on current time
     * @param {number} timeSeconds - Current time in seconds
     */
    update(timeSeconds) {
      if (!this._activeLFOMap) return;

      const TWO_PI = 2 * Math.PI;

      for (let param in this._activeLFOMap) {
        const lfo = this._activeLFOMap[param];
        const value =
          lfo.center +
          lfo.amplitude *
            Math.sin(TWO_PI * lfo.frequency * timeSeconds + lfo.phase);

        this._parameterStore.set(param, value);
      }
    }

    /**
     * Clear the active LFO map (return to manual mode)
     */
    clear() {
      this._activeLFOMap = null;
    }
  }

  return LFOEngine;
})();
