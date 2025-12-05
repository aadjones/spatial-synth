let params = {
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
};

let activePreset = "manual";

// Map discrete levels to actual values
function getSpeedValue(level) {
  const speeds = [0.0, 0.05, 0.2, 0.5, 1.0, 2.0];
  return speeds[level];
}

function getIntensityValue(level) {
  const intensities = [0.0, 0.25, 0.5, 1.0, 1.5, 2.0];
  return intensities[level];
}

function setupGUI() {
  const guiHTML = `
    <div id="custom-gui" role="complementary" aria-label="Control panel">
      <div class="gui-handle" id="gui-handle" role="button" aria-label="Toggle controls" tabindex="0">
        <span class="handle-icon">▼</span>
      </div>
      <div class="gui-section presets-section">
        <div class="presets-layout">
          <div class="preset-group">
            <h3>YOUR CREATION</h3>
            <button onclick="setPreset('manual')" class="preset-btn" data-preset="manual">MANUAL</button>
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

      <div class="gui-sections-row">
        <div class="gui-section">
          <h3>STRIPES - THE BASE WAVE</h3>
          <div class="control-group">
            <label>vertical</label>
            <input type="range" id="carrierFreqX" min="0.1" max="10" step="0.01" value="${
              params.carrierFreqX
            }">
          </div>
          <div class="control-group">
            <label>horizontal</label>
            <input type="range" id="carrierFreqY" min="0.1" max="10" step="0.01" value="${
              params.carrierFreqY
            }">
          </div>
        </div>

        <div class="gui-section">
          <h3>WARP BOX - SPACE MODULATOR</h3>
          <div class="warp-controls">
            <div class="warp-sliders">
              <div class="control-group">
                <label>ripples</label>
                <input type="range" id="modulatorFreq" min="0.1" max="10" step="0.01" value="${
                  params.modulatorFreq
                }">
              </div>
              <div class="control-group">
                <label>twist</label>
                <input type="range" id="modulationIndex" min="0" max="5" step="0.05" value="${
                  params.modulationIndex
                }">
              </div>
              <div class="control-group">
                <label>sharpen</label>
                <input type="range" id="amplitudeModulationIndex" min="0" max="5" step="0.05" value="${
                  params.amplitudeModulationIndex
                }">
              </div>
            </div>
            <div class="eye-joystick-container">
              <div class="eye-label">the eye</div>
              <canvas id="eyeJoystick" width="70" height="70"></canvas>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", guiHTML);

  // Add ARIA live region for announcements
  const liveRegion = document.createElement("div");
  liveRegion.setAttribute("aria-live", "polite");
  liveRegion.setAttribute("aria-atomic", "true");
  liveRegion.className = "sr-only";
  liveRegion.style.position = "absolute";
  liveRegion.style.left = "-10000px";
  liveRegion.style.width = "1px";
  liveRegion.style.height = "1px";
  liveRegion.style.overflow = "hidden";
  document.body.appendChild(liveRegion);
  window.guiLiveRegion = liveRegion;

  attachEventListeners();
  setupEyeJoystick();
  updateDanceParams();
  updateActivePreset();
  setupGUIToggle();
}

function setPreset(presetName) {
  activePreset = presetName;

  switch (presetName) {
    case "manual":
      manualMode();
      break;
    case "gentleWaves":
      gentleWaves();
      break;
    case "wildRipples":
      wildRipples();
      break;
    case "pulsatingEye":
      pulsatingEye();
      break;
  }

  updateActivePreset();
}

function updateActivePreset() {
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    if (btn.dataset.preset === activePreset) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function attachEventListeners() {
  const controls = [
    { id: "carrierFreqX", param: "carrierFreqX" },
    { id: "carrierFreqY", param: "carrierFreqY" },
    { id: "modulatorFreq", param: "modulatorFreq" },
    { id: "modulationIndex", param: "modulationIndex" },
    { id: "amplitudeModulationIndex", param: "amplitudeModulationIndex" },
  ];

  controls.forEach(({ id, param }) => {
    const input = document.getElementById(id);

    input.addEventListener("input", (e) => {
      params[param] = parseFloat(e.target.value);
    });
  });
}

function changeSpeed(delta) {
  params.speedLevel = Math.max(1, Math.min(5, params.speedLevel + delta));
  updateDanceParams();
  updateDanceDisplay();
}

function changeIntensity(delta) {
  params.intensityLevel = Math.max(1, Math.min(5, params.intensityLevel + delta));
  updateDanceParams();
  updateDanceDisplay();
}

function updateDanceParams() {
  params.lfoFrequency = getSpeedValue(params.speedLevel);
  params.lfoAmplitude = getIntensityValue(params.intensityLevel);
}

function updateDanceDisplay() {
  const speedDisplay = document.getElementById("speed-level");
  const intensityDisplay = document.getElementById("intensity-level");
  if (speedDisplay) speedDisplay.textContent = params.speedLevel;
  if (intensityDisplay) intensityDisplay.textContent = params.intensityLevel;

  // Update button disabled states
  const speedUp = document.getElementById("speed-up");
  const speedDown = document.getElementById("speed-down");
  const intensityUp = document.getElementById("intensity-up");
  const intensityDown = document.getElementById("intensity-down");

  if (speedUp) speedUp.disabled = params.speedLevel >= 5;
  if (speedDown) speedDown.disabled = params.speedLevel <= 1;
  if (intensityUp) intensityUp.disabled = params.intensityLevel >= 5;
  if (intensityDown) intensityDown.disabled = params.intensityLevel <= 1;
}

function setupEyeJoystick() {
  const canvas = document.getElementById("eyeJoystick");
  const ctx = canvas.getContext("2d");
  let isDragging = false;

  function drawJoystick() {
    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, w, h);

    // Center crosshair
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Eye position (map -1,1 to canvas coords, invert Y for display)
    const x = ((params.modulationCenterX + 1) / 2) * w;
    const y = ((-params.modulationCenterY + 1) / 2) * h;

    // Draw eye dot
    ctx.fillStyle = "#4a9eff";
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = "#6bb3ff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function updateFromMouse(e) {
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
    params.modulationCenterX = (clampedX / w) * 2 - 1;
    params.modulationCenterY = -((clampedY / h) * 2 - 1);

    drawJoystick();
  }

  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    updateFromMouse(e);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
      updateFromMouse(e);
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
  });

  canvas.addEventListener("mouseleave", () => {
    isDragging = false;
  });

  // Touch support
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    isDragging = true;
    const touch = e.touches[0];
    updateFromMouse(touch);
  });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (isDragging) {
      const touch = e.touches[0];
      updateFromMouse(touch);
    }
  });

  canvas.addEventListener("touchend", () => {
    isDragging = false;
  });

  // Keyboard navigation
  canvas.setAttribute("tabindex", "0");
  canvas.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 0.1 : 0.05;
    let changed = false;

    switch (e.key) {
      case "ArrowLeft":
        params.modulationCenterX = Math.max(
          -1,
          params.modulationCenterX - step
        );
        changed = true;
        break;
      case "ArrowRight":
        params.modulationCenterX = Math.min(1, params.modulationCenterX + step);
        changed = true;
        break;
      case "ArrowUp":
        params.modulationCenterY = Math.min(1, params.modulationCenterY + step);
        changed = true;
        break;
      case "ArrowDown":
        params.modulationCenterY = Math.max(
          -1,
          params.modulationCenterY - step
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
  window.drawEyeJoystick = drawJoystick;
}

function setShaderUniforms() {
  myShader.setUniform("u_resolution", [width, height]);
  myShader.setUniform("u_carrierFreqX", params.carrierFreqX);
  myShader.setUniform("u_carrierFreqY", params.carrierFreqY);
  myShader.setUniform("u_modulatorFreq", params.modulatorFreq);
  myShader.setUniform("u_modulationIndex", params.modulationIndex);
  myShader.setUniform("u_modulationCenter", [
    2 * params.modulationCenterX,
    2 * params.modulationCenterY,
  ]);
  myShader.setUniform(
    "u_amplitudeModulationIndex",
    params.amplitudeModulationIndex
  );
  myShader.setUniform("u_lfoFrequency", params.lfoFrequency);
  myShader.setUniform("u_lfoAmplitude", params.lfoAmplitude);
  myShader.setUniform("u_time", millis() / 1000.0);
}

function setupGUIToggle() {
  let isTransitioning = false;
  const gui = document.getElementById("custom-gui");
  const handle = document.getElementById("gui-handle");

  // Show hint (always show for now)
  const hint = document.createElement("div");
  hint.className = "gui-hint";
  hint.textContent = "Click handle or press H to hide controls";
  document.body.appendChild(hint);

  // Fade out after 5 seconds
  setTimeout(() => {
    hint.classList.add("fade-out");
    setTimeout(() => hint.remove(), 500);
  }, 5000);

  function toggleGUI() {
    if (isTransitioning) return;

    isTransitioning = true;
    const isHidden = gui.classList.contains("hidden");

    if (isHidden) {
      gui.classList.remove("hidden");
      if (window.guiLiveRegion) {
        window.guiLiveRegion.textContent = "Controls visible";
      }
    } else {
      // If focus is on a GUI element, move it to body
      if (gui.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      gui.classList.add("hidden");
      if (window.guiLiveRegion) {
        window.guiLiveRegion.textContent = "Controls hidden";
      }
    }

    setTimeout(() => {
      isTransitioning = false;
    }, 200);
  }

  // Handle click
  handle.addEventListener("click", toggleGUI);

  // Handle keyboard on handle
  handle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleGUI();
    }
  });

  // Toggle on H key
  document.addEventListener("keydown", (e) => {
    if (e.key === "h" || e.key === "H") {
      toggleGUI();
    }
  });
}

function updateGUI() {
  const controls = [
    { id: "carrierFreqX", param: "carrierFreqX" },
    { id: "carrierFreqY", param: "carrierFreqY" },
    { id: "modulatorFreq", param: "modulatorFreq" },
    { id: "modulationIndex", param: "modulationIndex" },
    { id: "amplitudeModulationIndex", param: "amplitudeModulationIndex" },
  ];

  controls.forEach(({ id, param }) => {
    const input = document.getElementById(id);
    if (input) {
      input.value = params[param];

      // Mark LFO-controlled parameters
      const controlGroup = input.closest('.control-group');
      if (controlGroup) {
        if (activeLFOMap && activeLFOMap[param]) {
          controlGroup.classList.add('lfo-controlled');
        } else {
          controlGroup.classList.remove('lfo-controlled');
        }
      }
    }
  });

  // Update joystick visual
  if (window.drawEyeJoystick) {
    window.drawEyeJoystick();
  }

  // Mark joystick as LFO-controlled if modulation center is animated
  const joystickContainer = document.querySelector('.eye-joystick-container');
  if (joystickContainer) {
    if (activeLFOMap && (activeLFOMap.modulationCenterX || activeLFOMap.modulationCenterY)) {
      joystickContainer.classList.add('lfo-controlled');
    } else {
      joystickContainer.classList.remove('lfo-controlled');
    }
  }

  // Update dance display
  updateDanceDisplay();
}
