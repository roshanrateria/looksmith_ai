const { execSync } = require('child_process');
const fs = require('fs');

async function main() {
  console.log('=== LOOKSMITH: Assembling Final Demo Video (v3) ===');

  const rawDemoEdited = 'artifacts/demo-edited.mp4';
  const overlayTelemetry = 'artifacts/overlay_telemetry_header.png';
  const overlayRoadmap = 'artifacts/overlay_roadmap_pill.png';
  const overlayTaste = 'artifacts/overlay_taste_subtitle.png';
  const shareCardImg = 'artifacts/share_card_with_sub.png';
  const voiceoverWav = 'artifacts/voiceover.wav';
  const outputMp4 = 'artifacts/final_demo_v3.mp4';

  // 1. Generate Part A: trim 3.0s to 93.30s from demo-edited.mp4 with Telemetry Header & Taste Subtitle overlays
  console.log('Step 1: Rendering Part A (0:00 - 90.30s) with Telemetry & Taste Subtitle overlays...');
  const partACmd = `ffmpeg -y -ss 00:00:03.000 -to 00:01:33.300 -i "${rawDemoEdited}" \
    -i "${overlayTelemetry}" \
    -i "${overlayTaste}" \
    -filter_complex "[0:v][1:v]overlay=865:494:enable='between(t,4.5,49.5)'[v1];[v1][2:v]overlay=0:760:enable='between(t,63.5,70.5)'[v2]" \
    -map "[v2]" -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -r 30 /tmp/part_a.mp4`;
  execSync(partACmd, { stdio: 'inherit' });

  // 2. Generate Part B: 2.0-second video clip of Customer Look Share Card at 1920x1080 30fps
  console.log('Step 2: Rendering Part B (2.0s Share Card)...');
  const partBCmd = `ffmpeg -y -loop 1 -t 2.0 -i "${shareCardImg}" \
    -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -r 30 /tmp/part_b.mp4`;
  execSync(partBCmd, { stdio: 'inherit' });

  // 3. Generate Part C: from 93.30s to end with [FUTURE ROADMAP] pill burned on Box 4
  console.log('Step 3: Rendering Part C (B2B + End Card with [FUTURE ROADMAP] pill)...');
  const partCCmd = `ffmpeg -y -ss 00:01:33.300 -i "${rawDemoEdited}" \
    -i "${overlayRoadmap}" \
    -filter_complex "[0:v][1:v]overlay=1170:602:enable='gte(t,7.0)'[vout]" \
    -map "[vout]" -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -r 30 /tmp/part_c.mp4`;
  execSync(partCCmd, { stdio: 'inherit' });

  // 4. Concatenate Part A + Part B + Part C and mux in voiceover.wav
  console.log('Step 4: Concatenating parts and muxing voiceover narration...');
  fs.writeFileSync('/tmp/concat_list.txt', "file '/tmp/part_a.mp4'\nfile '/tmp/part_b.mp4'\nfile '/tmp/part_c.mp4'\n");

  const concatCmd = `ffmpeg -y -f concat -safe 0 -i /tmp/concat_list.txt \
    -i "${voiceoverWav}" \
    -c:v copy \
    -c:a aac -b:a 192k -af "apad" -shortest \
    "${outputMp4}"`;
  execSync(concatCmd, { stdio: 'inherit' });

  // Verify and mirror copies
  console.log(`=== Final Video created successfully: ${outputMp4} ===`);
  const stats = fs.statSync(outputMp4);
  console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  // Mirror to standard locations for convenience
  fs.copyFileSync(outputMp4, 'artifacts/final-demo.mp4');
  fs.copyFileSync(outputMp4, 'artifacts/demo-edited.mp4');
  fs.copyFileSync(outputMp4, 'artifacts/demo 2.mp4');
  console.log('Mirrored to artifacts/final-demo.mp4 and artifacts/demo-edited.mp4');

  // Probe output video specs
  const probeOutput = execSync(`ffprobe -v error -show_entries format=duration,size,bit_rate:stream=width,height,r_frame_rate,codec_name "${outputMp4}"`).toString();
  console.log('Video Probe Info:\n', probeOutput);
}

main().catch(err => {
  console.error('Assembly failed:', err);
  process.exit(1);
});
