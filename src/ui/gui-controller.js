/**
 * GUIController - Manages GUI state, events, and updates
 *
 * Responsibilities:
 * - Event handling for all controls
 * - GUI state synchronization with parameters
 * - Preset activation and visual feedback
 * - LFO-controlled visual indicators
 * - Accessibility announcements
 */

const GUIController = (function () {
  class GUIController {
    constructor(parameterStore, presetManager, lfoEngine) {
      this._parameterStore = parameterStore;
      this._presetManager = presetManager;
      this._lfoEngine = lfoEngine;
      this._activePreset = 'manual';
      this._liveRegion = null;
      this._joystick = null;

      // Map discrete levels to actual values
      this._speedMap = [0.0, 0.05, 0.2, 0.5, 1.0, 2.0];
      this._intensityMap = [0.0, 0.25, 0.5, 1.0, 1.5, 2.0];
    }

    /**
     * Initialize the controller - attach all event listeners
     */
    initialize() {
      this._attachSliderListeners();
      this._setupEyeJoystick();
      this._updateDanceParams();
      this._updateActivePreset();
      this._setupToggle();
    }

    /**
     * Set the live region reference for accessibility announcements
     */
    setLiveRegion(liveRegion) {
      this._liveRegion = liveRegion;
    }

    /**
     * Set a preset by name
     */
    setPreset(presetName) {
      this._activePreset = presetName;
      this._presetManager.apply(presetName);
      this._updateActivePreset();
    }

    /**
     * Get the current active preset name
     */
    getActivePreset() {
      return this._activePreset;
    }

    /**
     * Update GUI to reflect current parameter state
     * Called from main draw loop
     */
    update() {
      this._updateSliders();
      this._updateJoystick();
      this._updateDanceDisplay();
    }

    /**
     * Change speed level
     */
    changeSpeed(delta) {
      const newLevel = Math.max(1, Math.min(5, this._parameterStore.get('speedLevel') + delta));
      this._parameterStore.set('speedLevel', newLevel);
      this._updateDanceParams();
      this._updateDanceDisplay();
    }

    /**
     * Change intensity level
     */
    changeIntensity(delta) {
      const newLevel = Math.max(1, Math.min(5, this._parameterStore.get('intensityLevel') + delta));
      this._parameterStore.set('intensityLevel', newLevel);
      this._updateDanceParams();
      this._updateDanceDisplay();
    }

    /**
     * Attach event listeners to range sliders
     */
    _attachSliderListeners() {
      const controls = [
        { id: 'carrierFreqX', param: 'carrierFreqX' },
        { id: 'carrierFreqY', param: 'carrierFreqY' },
        { id: 'modulatorFreq', param: 'modulatorFreq' },
        { id: 'modulationIndex', param: 'modulationIndex' },
        { id: 'amplitudeModulationIndex', param: 'amplitudeModulationIndex' },
      ];

      controls.forEach(({ id, param }) => {
        const input = document.getElementById(id);
        input.addEventListener('input', (e) => {
          this._parameterStore.set(param, parseFloat(e.target.value));
        });
      });
    }

    /**
     * Update slider values and LFO indicators
     */
    _updateSliders() {
      const controls = [
        { id: 'carrierFreqX', param: 'carrierFreqX' },
        { id: 'carrierFreqY', param: 'carrierFreqY' },
        { id: 'modulatorFreq', param: 'modulatorFreq' },
        { id: 'modulationIndex', param: 'modulationIndex' },
        { id: 'amplitudeModulationIndex', param: 'amplitudeModulationIndex' },
      ];

      controls.forEach(({ id, param }) => {
        const input = document.getElementById(id);
        if (input) {
          input.value = this._parameterStore.get(param);

          // Mark LFO-controlled parameters
          const controlGroup = input.closest('.control-group');
          if (controlGroup) {
            if (this._lfoEngine.isParameterControlled(param)) {
              controlGroup.classList.add('lfo-controlled');
            } else {
              controlGroup.classList.remove('lfo-controlled');
            }
          }
        }
      });
    }

    /**
     * Update preset button active states
     */
    _updateActivePreset() {
      document.querySelectorAll('.preset-btn').forEach((btn) => {
        if (btn.dataset.preset === this._activePreset) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    /**
     * Update dance parameters based on discrete levels
     */
    _updateDanceParams() {
      const speedLevel = this._parameterStore.get('speedLevel');
      const intensityLevel = this._parameterStore.get('intensityLevel');

      this._parameterStore.set('lfoFrequency', this._speedMap[speedLevel]);
      this._parameterStore.set('lfoAmplitude', this._intensityMap[intensityLevel]);
    }

    /**
     * Update dance display values and button states
     */
    _updateDanceDisplay() {
      const speedLevel = this._parameterStore.get('speedLevel');
      const intensityLevel = this._parameterStore.get('intensityLevel');

      const speedDisplay = document.getElementById('speed-level');
      const intensityDisplay = document.getElementById('intensity-level');
      if (speedDisplay) speedDisplay.textContent = speedLevel;
      if (intensityDisplay) intensityDisplay.textContent = intensityLevel;

      // Update button disabled states
      const speedUp = document.getElementById('speed-up');
      const speedDown = document.getElementById('speed-down');
      const intensityUp = document.getElementById('intensity-up');
      const intensityDown = document.getElementById('intensity-down');

      if (speedUp) speedUp.disabled = speedLevel >= 5;
      if (speedDown) speedDown.disabled = speedLevel <= 1;
      if (intensityUp) intensityUp.disabled = intensityLevel >= 5;
      if (intensityDown) intensityDown.disabled = intensityLevel <= 1;
    }

    /**
     * Setup the eye joystick control
     */
    _setupEyeJoystick() {
      this._joystick = new JoystickWidget(
        'eyeJoystick',
        this._parameterStore,
        'modulationCenterX',
        'modulationCenterY',
        this._lfoEngine
      );
    }

    /**
     * Update joystick visual and LFO indicator
     */
    _updateJoystick() {
      if (this._joystick) {
        this._joystick.draw();

        // Mark joystick container as LFO-controlled
        const joystickContainer = document.querySelector('.eye-joystick-container');
        if (joystickContainer) {
          if (this._joystick.isLFOControlled()) {
            joystickContainer.classList.add('lfo-controlled');
          } else {
            joystickContainer.classList.remove('lfo-controlled');
          }
        }
      }
    }

    /**
     * Setup GUI toggle functionality
     */
    _setupToggle() {
      let isTransitioning = false;
      const gui = document.getElementById('custom-gui');
      const handle = document.getElementById('gui-handle');

      // Show hint
      const hint = document.createElement('div');
      hint.className = 'gui-hint';
      hint.textContent = 'Click ▼ at bottom or press H to hide/show controls';
      document.body.appendChild(hint);

      // Fade out after 5 seconds
      setTimeout(() => {
        hint.classList.add('fade-out');
        setTimeout(() => hint.remove(), 500);
      }, 5000);

      const toggleGUI = () => {
        if (isTransitioning) return;

        isTransitioning = true;
        const isHidden = gui.classList.contains('hidden');

        if (isHidden) {
          gui.classList.remove('hidden');
          if (this._liveRegion) {
            this._liveRegion.textContent = 'Controls visible';
          }
        } else {
          // If focus is on a GUI element, move it to body
          if (gui.contains(document.activeElement)) {
            document.activeElement.blur();
          }
          gui.classList.add('hidden');
          if (this._liveRegion) {
            this._liveRegion.textContent = 'Controls hidden';
          }
        }

        setTimeout(() => {
          isTransitioning = false;
        }, 200);
      };

      // Handle click
      handle.addEventListener('click', toggleGUI);

      // Handle keyboard on handle
      handle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleGUI();
        }
      });

      // Toggle on H key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'h' || e.key === 'H') {
          toggleGUI();
        }
      });
    }
  }

  return GUIController;
})();
