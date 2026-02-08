/**
 * ShaderBridge - Maps JavaScript parameters to GLSL shader uniforms
 *
 * Responsibilities:
 * - Translates ParameterStore values to shader uniforms
 * - Handles coordinate transformations (e.g., modulation center scaling)
 * - Manages time and resolution uniforms
 * - No direct parameter manipulation, only reading and mapping
 */

const ShaderBridge = (function () {
  const TWO_PI = 2 * Math.PI;
  const SMOOTH_TIME = 0.1; // seconds for amplitude smoothing

  class ShaderBridge {
    constructor(parameterStore) {
      this._parameterStore = parameterStore;
      this._lfoPhase = 0;
      this._lastTimeSeconds = 0;
      this._smoothedAmplitude = parameterStore.get('lfoAmplitude');
    }

    /**
     * Set all shader uniforms for the current frame
     * @param {p5.Shader} shader - The p5.js shader instance
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {number} timeMillis - Current time in milliseconds
     */
    setUniforms(shader, width, height, timeMillis) {
      const params = this._parameterStore.getAll();
      const timeSeconds = timeMillis / 1000.0;
      const dt = timeSeconds - this._lastTimeSeconds;
      this._lastTimeSeconds = timeSeconds;

      // Resolution
      shader.setUniform('u_resolution', [width, height]);

      // Carrier frequencies (base wave)
      shader.setUniform('u_carrierFreqX', params.carrierFreqX);
      shader.setUniform('u_carrierFreqY', params.carrierFreqY);

      // Modulator frequency (ripple detail)
      shader.setUniform('u_modulatorFreq', params.modulatorFreq);

      // Modulation indices
      shader.setUniform('u_modulationIndex', params.modulationIndex);
      shader.setUniform('u_amplitudeModulationIndex', params.amplitudeModulationIndex);

      // Modulation center (the eye) - scaled from -1..1 to -2..2
      shader.setUniform('u_modulationCenter', [
        2 * params.modulationCenterX,
        2 * params.modulationCenterY,
      ]);

      // LFO: phase accumulator for smooth frequency transitions
      if (dt > 0 && dt < 1) {
        this._lfoPhase += TWO_PI * params.lfoFrequency * dt;
      }

      // Smooth amplitude changes to avoid visual jumps
      const alpha = 1 - Math.exp(-dt / SMOOTH_TIME);
      this._smoothedAmplitude += (params.lfoAmplitude - this._smoothedAmplitude) * alpha;

      const lfoValue = Math.sin(this._lfoPhase) * this._smoothedAmplitude;
      shader.setUniform('u_lfo', lfoValue);
    }
  }

  return ShaderBridge;
})();
