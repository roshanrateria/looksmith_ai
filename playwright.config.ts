import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './e2e',
  timeout: 360000, // 6 minutes max
  expect: {
    timeout: 30000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    headless: true,
    video: {
      mode: 'on',
      size: { width: 1920, height: 1080 },
    },
    launchOptions: {
      executablePath: '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell',
      args: [
        '--use-fake-device-for-media-stream',
        '--use-fake-ui-for-media-stream',
        `--use-file-for-fake-video-capture=${path.resolve('e2e/assets/selfie.y4m')}`,
      ],
    },
  },
  outputDir: 'artifacts/raw-test-results/',
});
