// force60fps.js
// ฟังก์ชันบังคับเลือกสตรีม 60FPS สำหรับ HLS.js

export function force60FPS(hlsInstance) {
  if (!hlsInstance) {
    console.warn("force60FPS: hls instance is missing.");
    return;
  }

  hlsInstance.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
    const levels = data.levels;

    if (!levels || levels.length === 0) {
      console.warn("force60FPS: No levels found in manifest.");
      return;
    }

    // หาสตรีมที่ FRAME-RATE ≥ 59 (ถือเป็น 60fps)
    const level60 = levels.find(
      (l) => l.attrs && Number(l.attrs["FRAME-RATE"]) >= 59
    );

    if (level60) {
      hlsInstance.loadLevel = level60.id;
      console.log("force60FPS: Selected 60FPS level:", level60);
    } else {
      console.log("force60FPS: No 60FPS stream found.");
    }
  });
}
