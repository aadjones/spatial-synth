// Landing page functionality
document.addEventListener('DOMContentLoaded', () => {
  const landingPage = document.getElementById('landing-page');
  const beginBtn = document.getElementById('begin-btn');
  const experience = document.getElementById('experience');
  const loadingIndicator = document.getElementById('loading-indicator');

  // Check if mobile device
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
  }

  // Block mobile devices
  if (isMobileDevice()) {
    const note = document.querySelector('.note');
    note.textContent = 'This experience requires desktop. Please visit on a computer.';
    note.style.color = '#ff6b6b';
    beginBtn.disabled = true;
    beginBtn.style.opacity = '0.5';
    beginBtn.style.cursor = 'not-allowed';
    return;
  }

  // Check for WebGL support
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch(e) {
      return false;
    }
  }

  // Show warning if WebGL is not supported
  if (!isWebGLAvailable()) {
    const note = document.querySelector('.note');
    note.textContent = 'WebGL is required but not supported in your browser. Please use a modern browser like Chrome, Firefox, or Safari.';
    note.style.color = '#ff6b6b';
    beginBtn.disabled = true;
    beginBtn.style.opacity = '0.5';
    beginBtn.style.cursor = 'not-allowed';
    return;
  }

  beginBtn.addEventListener('click', () => {
    // Show loading indicator
    beginBtn.style.display = 'none';
    loadingIndicator.classList.add('visible');

    // Enter fullscreen
    if (!fullscreen()) {
      fullscreen(true);
    }

    // Give a brief moment for fullscreen transition, then fade out
    setTimeout(() => {
      landingPage.classList.add('fade-out');

      // Show experience after fade
      setTimeout(() => {
        landingPage.style.display = 'none';
        experience.style.display = 'block';

        // Initialize p5 sketch if not already initialized
        if (typeof setup === 'function' && !window.p5Instance) {
          // p5.js will automatically call setup() when it loads
          // We just need to make sure the experience container is visible
        }
      }, 800);
    }, 300);
  });

  // Allow Enter key to begin
  beginBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      beginBtn.click();
    }
  });
});
