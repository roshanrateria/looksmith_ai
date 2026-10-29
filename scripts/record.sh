#!/usr/bin/env bash
set -e

echo "=== LOOKSMITH DEMO RECORDING SESSION ==="
mkdir -p artifacts/raw artifacts/screenshots

trap 'playwright-cli close 2>/dev/null || true' EXIT

echo "[1/4] Opening browser at 1920x1080..."
playwright-cli close 2>/dev/null || true
playwright-cli open http://localhost:3000
playwright-cli resize 1920 1080

echo "[2/4] Starting video screencast recording to artifacts/raw/demo.webm..."
playwright-cli video-start artifacts/raw/demo.webm --size 1920x1080 --fps 30

echo "[3/4] Running 9-scene end-to-end demo journey..."
playwright-cli run-code --filename scripts/record-demo-journey.js

echo "[4/4] Stopping video screencast recording..."
playwright-cli video-stop
playwright-cli close

echo "Raw video saved. Checking size:"
ls -lh artifacts/raw/demo.webm

echo "Now building final MP4..."
bash ./scripts/make-video.sh
