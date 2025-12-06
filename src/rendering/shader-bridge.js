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
  class ShaderBridge {
    constructor(parameterStore) {
      this._parameterStore = parameterStore;
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

      // LFO/Time parameters
      shader.setUniform('u_lfoFrequency', params.lfoFrequency);
      shader.setUniform('u_lfoAmplitude', params.lfoAmplitude);
      shader.setUniform('u_time', timeMillis / 1000.0);
    }
  }

  return ShaderBridge;
})();
