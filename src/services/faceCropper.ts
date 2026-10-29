import path from 'path';
import sharp from 'sharp';
// @ts-ignore
import smartcrop from 'smartcrop-sharp';

export interface FaceCropResult {
  croppedBuffer: Buffer;
  croppedDataUrl: string;
  box: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  detectorUsed: 'smartcrop_skin_ai' | 'portrait_fallback';
}

/**
 * Fetches an image from a URL or decodes a base64 data URL into a Buffer
 */
export async function resolveImageBuffer(imageSource: string): Promise<Buffer> {
  if (imageSource.startsWith('data:image/')) {
    const cleanB64 = imageSource.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(cleanB64, 'base64');
  }
  if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
    const res = await fetch(imageSource);
    if (!res.ok) {
      throw new Error(`Failed to fetch image from URL: ${res.status} ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  const fs = await import('fs/promises');
  const candidatePaths = [
    imageSource,
    path.join(process.cwd(), imageSource),
    path.join(process.cwd(), 'public', imageSource.replace(/^\/?(public\/)?/, '')),
    path.join(process.cwd(), imageSource.replace(/^\//, '')),
  ];
  for (const p of candidatePaths) {
    try {
      return await fs.readFile(p);
    } catch {
      // try next
    }
  }
  throw new Error(`Could not resolve image file buffer from: ${imageSource}`);
}

/**
 * Detects the human face in a full-body photo using skin-tone pixel centroid analysis
 * + smartcrop-sharp edge/skin focal detection, then extracts and upscales with sharp
 * (Lanczos3 600x680) for YouCam AI Skin Analysis & Skin Tone Analysis.
 */
export async function cropFaceFromImage(imageSource: string | Buffer): Promise<FaceCropResult> {
  const inputBuffer = Buffer.isBuffer(imageSource)
    ? imageSource
    : await resolveImageBuffer(imageSource);

  const image = sharp(inputBuffer);
  const metadata = await image.metadata();
  const imgWidth = metadata.width || 500;
  const imgHeight = metadata.height || 500;

  // If the image is already a tight portrait headshot, only lightly frame it
  const aspect = imgWidth / imgHeight;
  let extractBox = {
    left: Math.max(0, Math.floor(imgWidth * 0.36)),
    top: Math.max(0, Math.floor(imgHeight * 0.03)),
    width: Math.min(imgWidth, Math.floor(imgWidth * 0.28)),
    height: Math.min(imgHeight, Math.floor(imgHeight * 0.30)),
  };
  let detectorUsed: 'smartcrop_skin_ai' | 'portrait_fallback' = 'portrait_fallback';

  try {
    // 1. Extract the upper 34% of the full-body image where the head & neck reside
    const upperHeight = Math.max(100, Math.floor(imgHeight * 0.34));
    const upperBuffer = await sharp(inputBuffer)
      .extract({ left: 0, top: 0, width: imgWidth, height: upperHeight })
      .toBuffer();

    // 2. Compute skin-tone pixel bounding box in the upper 28% (head/face region)
    const headScanHeight = Math.max(80, Math.floor(imgHeight * 0.24));
    const { data, info } = await sharp(inputBuffer)
      .extract({ left: 0, top: 0, width: imgWidth, height: headScanHeight })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    let minX = info.width;
    let maxX = 0;
    let minY = info.height;
    let maxY = 0;
    let skinPixelCount = 0;

    for (let y = 0; y < info.height; y++) {
      for (let x = Math.floor(info.width * 0.2); x < Math.floor(info.width * 0.8); x++) {
        const idx = (y * info.width + x) * 3;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Peer-reviewed RGB skin cluster rule (Kovac et al.) excluding bright white/grey studio background
        const isStudioBg = r > 195 && g > 195 && b > 195 && Math.abs(r - b) < 18;
        const isSkin =
          !isStudioBg &&
          r > 95 &&
          g > 40 &&
          b > 20 &&
          r > g &&
          r > b &&
          Math.max(r, g, b) - Math.min(r, g, b) > 18 &&
          Math.abs(r - g) > 12;

        if (isSkin) {
          skinPixelCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // 3. Also run smartcrop-sharp on the upper region for focal verification
    const cropTargetW = Math.max(80, Math.floor(imgWidth * 0.26));
    const cropTargetH = Math.max(90, Math.floor(imgHeight * 0.28));
    const smartResult = await smartcrop.crop(upperBuffer, {
      width: cropTargetW,
      height: cropTargetH,
    });

    if (skinPixelCount > 120 && maxX > minX && maxY > minY) {
      const faceW = maxX - minX;
      const faceH = maxY - minY;
      const centerX = Math.floor((minX + maxX) / 2);
      const centerY = Math.floor((minY + maxY) / 2);

      // Frame head & face tightly so YouCam landmark detector sees >70% face area
      const boxW = Math.min(imgWidth, Math.max(68, Math.floor(faceW * 1.02)));
      const boxH = Math.min(imgHeight, Math.max(88, Math.floor(boxW * 1.25)));

      const left = Math.max(0, Math.min(imgWidth - boxW, Math.floor(centerX - boxW / 2)));
      const top = Math.max(0, Math.min(imgHeight - boxH, Math.floor(centerY - boxH * 0.48)));

      extractBox = { left, top, width: boxW, height: boxH };
      detectorUsed = 'smartcrop_skin_ai';
    } else if (smartResult && smartResult.topCrop) {
      const tc = smartResult.topCrop;
      extractBox = {
        left: Math.max(0, tc.x),
        top: Math.max(0, tc.y),
        width: Math.min(imgWidth - tc.x, tc.width),
        height: Math.min(imgHeight - tc.y, tc.height),
      };
      detectorUsed = 'smartcrop_skin_ai';
    } else if (aspect < 0.9 && imgHeight < 800) {
      // Already a portrait crop
      extractBox = { left: 0, top: 0, width: imgWidth, height: imgHeight };
    }
  } catch (err) {
    console.warn('Smartcrop face extraction notice, using default upper-center face box:', err);
  }

  // 4. Extract and upscale with Lanczos3 to 600x680 so YouCam Skin & Tone APIs receive an optimal high-res face
  const croppedBuffer = await sharp(inputBuffer)
    .extract(extractBox)
    .resize(600, 680, {
      fit: 'cover',
      position: 'centre',
      kernel: sharp.kernel.lanczos3,
    })
    .sharpen({ sigma: 0.8 })
    .jpeg({ quality: 95 })
    .toBuffer();

  const croppedDataUrl = `data:image/jpeg;base64,${croppedBuffer.toString('base64')}`;

  return {
    croppedBuffer,
    croppedDataUrl,
    box: extractBox,
    detectorUsed,
  };
}
