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
      const canvas = document.getElementById('eyeJoystick');
      const ctx = canvas.getContext('2d');
      let isDragging = false;

      const drawJoystick = () => {
        const w = canvas.width;
        const h = canvas.height;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, w, h);

        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, w, h);

        // Center crosshair
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();

        // Eye position (map -1,1 to canvas coords, invert Y for display)
        const x = ((this._parameterStore.get('modulationCenterX') + 1) / 2) * w;
        const y = ((-this._parameterStore.get('modulationCenterY') + 1) / 2) * h;

        // Check if LFO-controlled
        const isLFOControlled =
          this._lfoEngine.isParameterControlled('modulationCenterX') ||
          this._lfoEngine.isParameterControlled('modulationCenterY');

        // Draw eye dot
        ctx.fillStyle = isLFOControlled ? '#888' : '#4a9eff';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Outline
        ctx.strokeStyle = isLFOControlled ? '#999' : '#6bb3ff';
        ctx.lineWidth = 2;
        ctx.stroke();
      };

      const updateFromMouse = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const dotRadius = 6;
        const w = canvas.width;
        const h = canvas.height;

        // Clamp pixel coordinates to keep dot inside canvas
        const clampedX = Math.max(dotRadius, Math.min(w - dotRadius, x));
        const clampedY = Math.max(dotRadius, Math.min(h - dotRadius, y));

        // Convert to -1 to 1 range (invert Y so up is negative)
        this._parameterStore.set('modulationCenterX', (clampedX / w) * 2 - 1);
        this._parameterStore.set('modulationCenterY', -((clampedY / h) * 2 - 1));

        drawJoystick();
      };

      // Mouse events
      canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateFromMouse(e);
      });

      canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
          updateFromMouse(e);
        }
      });

      canvas.addEventListener('mouseup', () => {
        isDragging = false;
      });

      canvas.addEventListener('mouseleave', () => {
        isDragging = false;
      });

      // Touch events
      canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDragging = true;
        const touch = e.touches[0];
        updateFromMouse(touch);
      });

      canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isDragging) {
          const touch = e.touches[0];
          updateFromMouse(touch);
        }
      });

      canvas.addEventListener('touchend', () => {
        isDragging = false;
      });

      // Keyboard navigation
      canvas.setAttribute('tabindex', '0');
      canvas.addEventListener('keydown', (e) => {
        const step = e.shiftKey ? 0.1 : 0.05;
        let changed = false;

        switch (e.key) {
          case 'ArrowLeft':
            this._parameterStore.set(
              'modulationCenterX',
              Math.max(-1, this._parameterStore.get('modulationCenterX') - step)
            );
            changed = true;
            break;
          case 'ArrowRight':
            this._parameterStore.set(
              'modulationCenterX',
              Math.min(1, this._parameterStore.get('modulationCenterX') + step)
            );
            changed = true;
            break;
          case 'ArrowUp':
            this._parameterStore.set(
              'modulationCenterY',
              Math.min(1, this._parameterStore.get('modulationCenterY') + step)
            );
            changed = true;
            break;
          case 'ArrowDown':
            this._parameterStore.set(
              'modulationCenterY',
              Math.max(-1, this._parameterStore.get('modulationCenterY') - step)
            );
            changed = true;
            break;
        }

        if (changed) {
          e.preventDefault();
          drawJoystick();
        }
      });

      // Initial draw
      drawJoystick();

      // Store reference for updates
      this._drawJoystick = drawJoystick;
    }

    /**
     * Update joystick visual and LFO indicator
     */
    _updateJoystick() {
      if (this._drawJoystick) {
        this._drawJoystick();
      }

      // Mark joystick as LFO-controlled if modulation center is animated
      const joystickContainer = document.querySelector('.eye-joystick-container');
      if (joystickContainer) {
        if (
          this._lfoEngine.isParameterControlled('modulationCenterX') ||
          this._lfoEngine.isParameterControlled('modulationCenterY')
        ) {
          joystickContainer.classList.add('lfo-controlled');
        } else {
          joystickContainer.classList.remove('lfo-controlled');
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
