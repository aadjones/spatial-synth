# Spatial Synthesizer

An interactive visual experience exploring frequency modulation and spatial wave patterns through real-time WebGL shader visualization.

## About

Spatial Synthesizer is a web-based generative art piece that creates dynamic visual patterns using frequency modulation (FM) synthesis techniques. Users can manipulate various parameters to create their own unique visual compositions or explore preset animations created by the artist.

## Features

- **Real-time WebGL shader visualization** using p5.js
- **Interactive controls** for spatial wave manipulation:
  - Base wave frequencies (vertical/horizontal stripes)
  - Space modulation (ripples, twist, sharpening)
  - Eye position control via interactive joystick
  - Time modulation (speed and intensity)
- **Artist presets** including Gentle Waves, Wild Ripple, and Pulsating Eye
- **Keyboard shortcuts**:
  - `Space` - Freeze/unfreeze animation
  - `H` - Hide/show controls
  - `S` - Save screenshot
  - `ESC` - Exit fullscreen
  - Arrow keys - Navigate eye joystick (when focused)
- **Accessibility features**: keyboard navigation, screen reader support, WCAG AA compliant colors
- **Responsive design** with mobile support

## Running Locally

This is a client-side web application with no build step required.

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/spatial-synthesizer.git
   cd spatial-synthesizer
   ```

2. Serve the directory with any local HTTP server:
   ```bash
   # Using Python 3
   python3 -m http.server 8000

   # Using Python 2
   python -m SimpleHTTPServer 8000

   # Using Node.js
   npx serve
   ```

3. Open `http://localhost:8000` in a modern browser (Chrome, Firefox, or Safari recommended)

## Browser Requirements

- WebGL support (required)
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- Best experienced on desktop at full screen

## Project Structure

- `index.html` - Main HTML entry point with landing page
- `sketch.js` - p5.js main application loop and presets
- `gui.js` - Custom control interface and parameter management
- `gui-style.css` - Control panel styling
- `landing.css` - Landing page styling
- `landing.js` - Landing page functionality and WebGL detection
- `fm.frag` - Fragment shader implementing FM synthesis visualization
- `shader.vert` - Vertex shader (passthrough)
- `style.css` - Base canvas styling

## Technologies

- [p5.js](https://p5js.org/) - Creative coding framework
- WebGL/GLSL - Hardware-accelerated shader rendering
- Vanilla JavaScript - No framework dependencies
- Custom HTML/CSS GUI - Accessible control interface

## Artist

Created by Aaron Demby Jones

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

This is an art piece, but if you find bugs or have suggestions, feel free to open an issue.
