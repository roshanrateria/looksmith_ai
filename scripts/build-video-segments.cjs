const { execSync } = require('child_process');
const fs = require('fs');

console.log('=== Step 1: Building Video Segments for final_v4.mp4 ===');

const sourceVideo = 'artifacts/demo.mp4';
const look1Card = 'artifacts/frame_look1_vto.png';
const look2Card = 'artifacts/frame_look2_vto.png';
const shareCard = 'artifacts/screenshots/scene-8-share.png';
const endCard = 'artifacts/frame_end_card.png';

// Ensure /tmp/v4 exists
fs.mkdirSync('/tmp/v4', { recursive: true });

// Part 1: Demo 0.00s to 93.50s
console.log('Rendering Part 1 (0.00s - 93.50s)...');
execSync(`ffmpeg -y -ss 00:00:00.000 -to 00:01:33.500 -i "${sourceVideo}" -an \
  -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 30 /tmp/v4/part1.mp4`, { stdio: 'inherit' });

// Part 2: Look 1 Card (2.80s)
console.log('Rendering Part 2 (Look 1 Card, 2.80s)...');
execSync(`ffmpeg -y -loop 1 -t 2.80 -i "${look1Card}" \
  -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 30 /tmp/v4/part2.mp4`, { stdio: 'inherit' });

// Part 3: Demo 93.50s to 106.50s
console.log('Rendering Part 3 (93.50s - 106.50s)...');
execSync(`ffmpeg -y -ss 00:01:33.500 -to 00:01:46.500 -i "${sourceVideo}" -an \
  -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 30 /tmp/v4/part3.mp4`, { stdio: 'inherit' });

// Part 4: Look 2 Card (2.80s)
console.log('Rendering Part 4 (Look 2 Card, 2.80s)...');
execSync(`ffmpeg -y -loop 1 -t 2.80 -i "${look2Card}" \
  -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 30 /tmp/v4/part4.mp4`, { stdio: 'inherit' });

// Part 5: Demo 106.50s to 163.28s
console.log('Rendering Part 5 (106.50s - 163.28s)...');
execSync(`ffmpeg -y -ss 00:01:46.500 -to 00:02:43.280 -i "${sourceVideo}" -an \
  -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 30 /tmp/v4/part5.mp4`, { stdio: 'inherit' });

// Part 6: Share Card (3.50s)
console.log('Rendering Part 6 (Share Card, 3.50s)...');
execSync(`ffmpeg -y -loop 1 -t 3.50 -i "${shareCard}" \
  -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 30 /tmp/v4/part6.mp4`, { stdio: 'inherit' });

// Part 7: End Card (5.50s)
console.log('Rendering Part 7 (End Card, 5.50s)...');
execSync(`ffmpeg -y -loop 1 -t 5.50 -i "${endCard}" \
  -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -r 30 /tmp/v4/part7.mp4`, { stdio: 'inherit' });

// Concatenate all 7 parts into /tmp/v4/video_silent.mp4
console.log('Concatenating all 7 segments...');
const concatList = [
  "file '/tmp/v4/part1.mp4'",
  "file '/tmp/v4/part2.mp4'",
  "file '/tmp/v4/part3.mp4'",
  "file '/tmp/v4/part4.mp4'",
  "file '/tmp/v4/part5.mp4'",
  "file '/tmp/v4/part6.mp4'",
  "file '/tmp/v4/part7.mp4'"
].join('\n');
fs.writeFileSync('/tmp/v4/concat_list.txt', concatList + '\n');

execSync(`ffmpeg -y -f concat -safe 0 -i /tmp/v4/concat_list.txt -c:v copy /tmp/v4/video_silent.mp4`, { stdio: 'inherit' });

const duration = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 /tmp/v4/video_silent.mp4`).toString().trim();
console.log(`Video assembly complete! Duration: ${duration}s`);
