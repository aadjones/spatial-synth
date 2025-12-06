/**
 * JoystickWidget - A 2D joystick control for X/Y parameter control
 *
 * Responsibilities:
 * - Renders a 2D joystick on a canvas element
 * - Handles mouse, touch, and keyboard input
 * - Updates two parameters (X and Y) in the ParameterStore
 * - Visual feedback for LFO-controlled state
 * - Accessibility support with keyboard navigation
 */

const JoystickWidget = (function () {
  class JoystickWidget {
    constructor(canvasId, parameterStore, paramXName, paramYName, lfoEngine) {
      this._canvas = document.getElementById(canvasId);
      this._ctx = this._canvas.getContext('2d');
      this._parameterStore = parameterStore;
      this._paramXName = paramXName;
      this._paramYName = paramYName;
      this._lfoEngine = lfoEngine;
      this._isDragging = false;

      this._setupEventListeners();
      this.draw();
    }

    /**
     * Draw the joystick
     */
    draw() {
      const w = this._canvas.width;
      const h = this._canvas.height;
      const ctx = this._ctx;

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

      // Position (map -1,1 to canvas coords, invert Y for display)
      const paramX = this._parameterStore.get(this._paramXName);
      const paramY = this._parameterStore.get(this._paramYName);
      const x = ((paramX + 1) / 2) * w;
      const y = ((-paramY + 1) / 2) * h;

      // Check if LFO-controlled
      const isLFOControlled =
        this._lfoEngine.isParameterControlled(this._paramXName) ||
        this._lfoEngine.isParameterControlled(this._paramYName);

      // Draw position dot
      ctx.fillStyle = isLFOControlled ? '#888' : '#4a9eff';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Outline
      ctx.strokeStyle = isLFOControlled ? '#999' : '#6bb3ff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    /**
     * Check if joystick is LFO-controlled
     */
    isLFOControlled() {
      return (
        this._lfoEngine.isParameterControlled(this._paramXName) ||
        this._lfoEngine.isParameterControlled(this._paramYName)
      );
    }

    /**
     * Update parameters from mouse/touch position
     */
    _updateFromMouse(e) {
      const rect = this._canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dotRadius = 6;
      const w = this._canvas.width;
      const h = this._canvas.height;

      // Clamp pixel coordinates to keep dot inside canvas
      const clampedX = Math.max(dotRadius, Math.min(w - dotRadius, x));
      const clampedY = Math.max(dotRadius, Math.min(h - dotRadius, y));

      // Convert to -1 to 1 range (invert Y so up is negative)
      this._parameterStore.set(this._paramXName, (clampedX / w) * 2 - 1);
      this._parameterStore.set(this._paramYName, -((clampedY / h) * 2 - 1));

      this.draw();
    }

    /**
     * Setup all event listeners
     */
    _setupEventListeners() {
      // Mouse events
      this._canvas.addEventListener('mousedown', (e) => {
        this._isDragging = true;
        this._updateFromMouse(e);
      });

      this._canvas.addEventListener('mousemove', (e) => {
        if (this._isDragging) {
          this._updateFromMouse(e);
        }
      });

      this._canvas.addEventListener('mouseup', () => {
        this._isDragging = false;
      });

      this._canvas.addEventListener('mouseleave', () => {
        this._isDragging = false;
      });

      // Touch events
      this._canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this._isDragging = true;
        const touch = e.touches[0];
        this._updateFromMouse(touch);
      });

      this._canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (this._isDragging) {
          const touch = e.touches[0];
          this._updateFromMouse(touch);
        }
      });

      this._canvas.addEventListener('touchend', () => {
        this._isDragging = false;
      });

      // Keyboard navigation
      this._canvas.setAttribute('tabindex', '0');
      this._canvas.addEventListener('keydown', (e) => {
        const step = e.shiftKey ? 0.1 : 0.05;
        let changed = false;

        switch (e.key) {
          case 'ArrowLeft':
            this._parameterStore.set(
              this._paramXName,
              Math.max(-1, this._parameterStore.get(this._paramXName) - step)
            );
            changed = true;
            break;
          case 'ArrowRight':
            this._parameterStore.set(
              this._paramXName,
              Math.min(1, this._parameterStore.get(this._paramXName) + step)
            );
            changed = true;
            break;
          case 'ArrowUp':
            this._parameterStore.set(
              this._paramYName,
              Math.min(1, this._parameterStore.get(this._paramYName) + step)
            );
            changed = true;
            break;
          case 'ArrowDown':
            this._parameterStore.set(
              this._paramYName,
              Math.max(-1, this._parameterStore.get(this._paramYName) - step)
            );
            changed = true;
            break;
        }

        if (changed) {
          e.preventDefault();
          this.draw();
        }
      });
    }
  }

  return JoystickWidget;
})();
