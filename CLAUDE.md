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

This project follows a modular architecture with clean separation of concerns. For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md).

### Quick Reference

**Directory Structure:**
```
src/
├── core/              # Data and business logic
│   ├── parameters.js  # ParameterStore (single source of truth)
│   ├── lfo-engine.js  # LFOEngine (parameter automation)
│   └── presets.js     # PresetManager (preset definitions)
├── ui/                # User interface
│   ├── gui-builder.js    # GUIBuilder (HTML construction)
│   ├── gui-controller.js # GUIController (event handling)
│   └── joystick-widget.js # JoystickWidget (2D control)
└── rendering/         # Graphics pipeline
    └── shader-bridge.js  # ShaderBridge (uniform mapping)
```

**Application Layer:**
- `gui.js` - Initializes modules and provides API
- `sketch.js` - p5.js entry point and main loop
- `landing.js` - Landing page interaction

**Shaders:**
- `fm.frag` - Fragment shader (FM synthesis visualization)
- `shader.vert` - Vertex shader (passthrough)

### Data Flow

```
User Input → GUIController → ParameterStore → ShaderBridge → GLSL Shaders → Visual Output
                                    ↑
                                LFOEngine (for presets)
```

### Key Architecture Principles

1. **ParameterStore** is the single source of truth for all parameters
2. **Core modules** have no UI dependencies
3. **UI modules** only read from ParameterStore, never modify directly
4. **Unidirectional data flow** from parameters to rendering
5. **IIFE pattern** for module encapsulation without build tools

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

### Adding a New Parameter

1. Add to ParameterStore initialization in [gui.js](gui.js)
2. Add to ParameterStore definitions in [src/core/parameters.js](src/core/parameters.js)
3. Add HTML control in [src/ui/gui-builder.js](src/ui/gui-builder.js)
4. Add event listener in [src/ui/gui-controller.js](src/ui/gui-controller.js)
5. Add shader uniform in [src/rendering/shader-bridge.js](src/rendering/shader-bridge.js)
6. Declare and use uniform in [fm.frag](fm.frag)

**See detailed example in [ARCHITECTURE.md](ARCHITECTURE.md#adding-a-new-parameter)**

### Creating a New Preset

1. Add preset definition to [src/core/presets.js](src/core/presets.js)
2. Add button in [src/ui/gui-builder.js](src/ui/gui-builder.js)
3. Add wrapper function in [sketch.js](sketch.js) (for backwards compatibility)

**See detailed example in [ARCHITECTURE.md](ARCHITECTURE.md#adding-a-new-preset)**

### Modifying Visual Output

- Edit [fm.frag](fm.frag) fragment shader
- Main synthesis happens in `main()` function
- Simplex noise available via `snoise(vec2)`
