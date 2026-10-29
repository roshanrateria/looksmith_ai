#!/usr/bin/env bash
set -e

echo "=== LOOKSMITH: Building Final Demo Video ==="

if [ -f "artifacts/raw/demo.webm" ]; then
  RAW_VIDEO="artifacts/raw/demo.webm"
else
  RAW_VIDEO=$(find artifacts/ -name "*.webm" | head -n 1)
fi

if [ -z "$RAW_VIDEO" ]; then
  echo "Error: No raw .webm video found in artifacts/raw/ or artifacts/"
  exit 1
fi

echo "Source raw video: $RAW_VIDEO"
mkdir -p artifacts

# Ensure audio track exists
if [ ! -f "artifacts/voiceover.wav" ]; then
  echo "Generating voiceover audio..."
  node scripts/generate-voiceover.cjs
fi

# 1. Produce demo.mp4: H.264, 1920x1080, 30fps, AAC audio, clean video presentation
echo "Encoding demo.mp4 with voiceover audio..."
ffmpeg -y -i "$RAW_VIDEO" \
  -i artifacts/voiceover.wav \
  -vf "fps=30,scale=1920:1080" \
  -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p \
  -c:a aac -b:a 192k \
  -shortest \
  artifacts/demo.mp4

# 2. Produce demo_silent.mp4: exact same video without audio
echo "Encoding demo_silent.mp4 (silent version)..."
ffmpeg -y -i artifacts/demo.mp4 \
  -an \
  -c:v copy \
  artifacts/demo_silent.mp4

# Mirror copies for reference
cp artifacts/demo.mp4 artifacts/final-demo.mp4
cp artifacts/demo.mp4 artifacts/demo-2.mp4

echo "=== Final demo video created at artifacts/demo.mp4 ==="
ls -lh artifacts/demo.mp4 artifacts/demo_silent.mp4
echo "=== Video Stream Probe Info ==="
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=width,height,r_frame_rate,codec_name artifacts/demo.mp4
echo "=== Subtitle Stream Check (must be empty) ==="
ffprobe -v error -select_streams s -show_entries stream=codec_name artifacts/demo.mp4 || true
