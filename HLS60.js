/**
 * HLS60.js
 * Wrapper HLS.js + 60 FPS interpolation + FPS toggle button
 */

class HLS60 {
  constructor(videoElement, hlsSource, options = {}) {
    this.video = videoElement;
    this.src = hlsSource;
    this.hls = null;
    this.use60FPS = false;
    this.lastFrame = null;

    // Canvas สำหรับ render 60 FPS
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.video.width || 640;
    this.canvas.height = this.video.height || 360;
    this.video.style.display = 'none';
    this.video.parentNode.insertBefore(this.canvas, this.video.nextSibling);

    // ปุ่ม FPS 60
    this.fpsBtn = document.createElement('button');
    this.fpsBtn.innerText = 'Enable 60 FPS';
    this.fpsBtn.style.display = 'block';
    this.fpsBtn.style.marginTop = '10px';
    this.canvas.parentNode.insertBefore(this.fpsBtn, this.canvas.nextSibling);

    this.fpsBtn.addEventListener('click', () => {
      this.use60FPS = !this.use60FPS;
      this.fpsBtn.innerText = this.use60FPS ? 'Disable 60 FPS' : 'Enable 60 FPS';
    });

    this.initHLS(options);
  }

  initHLS(options) {
    if (Hls.isSupported()) {
      this.hls = new Hls(options);
      this.hls.loadSource(this.src);
      this.hls.attachMedia(this.video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.video.play();
        this.drawLoop();
      });
    } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
      this.video.src = this.src;
      this.video.addEventListener('loadedmetadata', () => {
        this.video.play();
        this.drawLoop();
      });
    } else {
      console.error('HLS not supported in this browser');
    }
  }

  // Linear interpolate frame (simple)
  interpolate(frameA, frameB) {
    const output = new ImageData(frameA.width, frameA.height);
    for (let i = 0; i < frameA.data.length; i++) {
      output.data[i] = (frameA.data[i] + frameB.data[i]) / 2;
    }
    return output;
  }

  drawLoop() {
    if (this.video.readyState >= 2) {
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      const currentFrame = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

      if (this.use60FPS && this.lastFrame) {
        const interpolated = this.interpolate(this.lastFrame, currentFrame);
        this.ctx.putImageData(interpolated, 0, 0);
      }

      this.lastFrame = currentFrame;
    }

    requestAnimationFrame(this.drawLoop.bind(this)); // รัน ~60 FPS
  }
}
