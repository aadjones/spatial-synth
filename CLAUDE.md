# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a p5.js-based spatial FM synthesizer with real-time WebGL shader visualization. It creates animated visual patterns using frequency modulation (FM) and amplitude modulation (AM) techniques, controlled by a custom HTML interface.

## Running the Project

This is a client-side web application with no build step. To run:

1. Serve the directory with any local HTTP server:
   ```bash
   python -m http.server 8000
   # or
   python3 -m http.server 8000
   # or
   npx serve
   ```

2. Open `http://localhost:8000` in a browser

The application runs entirely in the browser with no backend or build process.

## Architecture

### Core Components

**sketch.js** - Main p5.js application loop
- `preload()`: Loads the GLSL shaders (vertex and fragment)
- `setup()`: Initializes canvas and GUI
- `draw()`: Main render loop that updates LFO parameters, GUI state, and shader uniforms
- `updateParamsFromLFOs()`: Applies sinusoidal modulation to parameters based on active preset
- Preset functions (`gentleWaves()`, `wildRipples()`, `pulsatingEye()`): Define LFO mappings for animated presets

**gui.js** - Custom HTML interface and parameter management
- `params` object: Central store for all synthesis parameters
- `setupGUI()`: Creates custom HTML controls positioned at the bottom of the screen in a horizontal layout
- `attachEventListeners()`: Binds range input events to update params object in real-time
- `updateGUI()`: Syncs GUI display with current parameter values (used by LFO presets)
- `setShaderUniforms()`: Maps JavaScript parameters to GLSL uniforms

**gui-style.css** - Custom GUI styling
- Horizontal bottom layout with three main sections (Stripes, Warp Box, Dance)
- Preset buttons section at the top
- Dark translucent background
- Responsive flexbox layout

**fm.frag** - Fragment shader (GLSL)
- Implements FM synthesis visualization using 2D sinusoidal grids
- Creates carrier waves in X and Y dimensions
- Modulates both frequency and amplitude using circular waves from a center point
- Includes simplex noise functions (currently unused but available)
- LFO drives real-time parameter animation within the shader

**shader.vert** - Vertex shader (GLSL)
- Simple passthrough vertex shader
- Transforms coordinates to cover entire canvas

### Parameter Flow

1. User adjusts GUI controls OR selects a preset → `params` object updated
2. If preset active: `updateParamsFromLFOs()` calculates sinusoidal modulation → overwrites `params` values
3. `setShaderUniforms()` passes current `params` to fragment shader
4. Fragment shader renders visual output based on uniforms
5. `updateGUI()` syncs GUI display with current parameter values

### Key Concepts

**LFO (Low Frequency Oscillator) System**
- Manual mode: `activeLFOMap = null`, user has direct control via GUI
- Preset modes: `activeLFOMap` defines which parameters oscillate and how (frequency, amplitude, center, phase)
- Each LFO-controlled parameter follows: `value = center + amplitude * sin(2π * frequency * time + phase)`

**FM Synthesis Mapping**
- Carrier frequencies (X/Y): Create the base stripe pattern
- Modulator frequency: Controls ripple detail
- Modulation index: Controls frequency "twist" intensity
- Amplitude modulation index: Controls edge "sharpening"
- Modulation center: Position of the radiating wave origin ("the eye")

## Common Modifications

**Adding a new parameter:**
1. Add to `params` object in [gui.js](gui.js)
2. Add HTML control in `setupGUI()` within the appropriate section
3. Add to controls array in `attachEventListeners()` with id, param name, and decimals
4. Add to controls array in `updateGUI()` for LFO preset synchronization
5. Add `setUniform()` call in `setShaderUniforms()`
6. Declare uniform in [fm.frag](fm.frag) and use in shader logic

**Creating a new preset:**
1. Define function in [sketch.js](sketch.js) that sets `activeLFOMap`
2. Add button in the presets section in `setupGUI()` HTML
3. LFO map structure: `{ paramName: { frequency, amplitude, center, phase } }`

**Modifying visual output:**
- Edit the fragment shader [fm.frag](fm.frag)
- The main synthesis happens in `main()` function
- Simplex noise function available via `snoise(vec2)` for alternative modulation
