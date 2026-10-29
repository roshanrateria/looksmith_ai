const sharp = require('sharp');
const fs = require('fs');

async function createOverlays() {
  console.log('Generating video overlays...');

  // 1. Telemetry Header Banner (x: 865, y: 494, width: 340, height: 26)
  // Background matches telemetry dark card: #0F0D0C
  // Text: ACTIVE YOUCAM APIS (3 LIVE, 1 ROADMAP) in styled font
  const telemetrySvg = `
    <svg width="340" height="26" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0E0C0A"/>
      <g transform="translate(2, 6)">
        <!-- Layers Icon in #E5BA82 -->
        <path d="M7 2L1 5.5L7 9L13 5.5L7 2Z" fill="none" stroke="#E5BA82" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M1 9.5L7 13L13 9.5" fill="none" stroke="#E5BA82" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <text x="24" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="700" letter-spacing="0.08em" fill="rgba(255,255,255,0.78)">
        ACTIVE YOUCAM APIS (3 LIVE, 1 ROADMAP)
      </text>
    </svg>
  `;
  await sharp(Buffer.from(telemetrySvg)).png().toFile('artifacts/overlay_telemetry_header.png');
  console.log('Created overlay_telemetry_header.png');

  // 2. End Card Box 4 Amber Pill: [FUTURE ROADMAP] (width: 140, height: 26)
  const pillSvg = `
    <svg width="140" height="26" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="136" height="22" rx="11" fill="rgba(245, 158, 11, 0.22)" stroke="#F59E0B" stroke-width="1.4"/>
      <text x="70" y="17" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace" font-size="10.5" font-weight="800" letter-spacing="0.06em" fill="#F59E0B" text-anchor="middle">
        [FUTURE ROADMAP]
      </text>
    </svg>
  `;
  await sharp(Buffer.from(pillSvg)).png().toFile('artifacts/overlay_roadmap_pill.png');
  console.log('Created overlay_roadmap_pill.png');

  // 3. Subtitle Box for Look 3 / Taste Memory (width: 1920, height: 220)
  // Replaces the old subtitle box at the bottom of the screen (centered at x: 0, y: 760)
  const tasteSubtitleSvg = `
    <svg width="1920" height="220" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="1920" height="220" fill="#000000"/>
      <text x="960" y="90" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="600" fill="#FFFFFF" text-anchor="middle">
        Self-Learning Taste Memory: Disliking minimal silhouettes and liking
      </text>
      <text x="960" y="130" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="600" fill="#FFFFFF" text-anchor="middle">
        Kaveri Threadworks updates Gemini planner weights.
      </text>
    </svg>
  `;
  await sharp(Buffer.from(tasteSubtitleSvg)).png().toFile('artifacts/overlay_taste_subtitle.png');
  console.log('Created overlay_taste_subtitle.png');

  // 4. Share Card Subtitle (for scene-8-share.png)
  const shareCardSubtitleSvg = `
    <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
      <rect x="280" y="888" width="1360" height="84" rx="6" fill="rgba(0,0,0,0.88)"/>
      <text x="960" y="924" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="600" fill="#FFFFFF" text-anchor="middle">
        Customer Look Share Card: Generates downloadable high-res
      </text>
      <text x="960" y="955" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="600" fill="#FFFFFF" text-anchor="middle">
        styling cards and instant social story posters.
      </text>
    </svg>
  `;
  await sharp('artifacts/screenshots/scene-8-share.png')
    .composite([{ input: Buffer.from(shareCardSubtitleSvg), top: 0, left: 0 }])
    .toFile('artifacts/share_card_with_sub.png');
  console.log('Created share_card_with_sub.png');
}

createOverlays().catch(err => {
  console.error(err);
  process.exit(1);
});
