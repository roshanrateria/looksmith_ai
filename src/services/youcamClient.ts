/**
 * Production Client for Perfect Corp YouCam APIs
 * Endpoints:
 * - /s2s/v2.0/file: Presigned file upload
 * - /s2s/v2.0/task/skin-analysis: Skin Analysis (SD/HD)
 * - /s2s/v2.0/task/skin-tone-analysis: Skin Tone & Facial Feature Colors
 * - /s2s/v2.0/task/cloth: Clothes Virtual Try-On
 * - /s2s/v2.0/task/makeup-vto: Makeup Virtual Try-On
 */

import { SkinConcernScores, ToneProfile } from '../utils/skinRules';

const BASE_URL = 'https://yce-api-01.makeupar.com';

export interface YouCamTaskResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorMessage?: string;
  taskId?: string;
}

export interface YouCamSkinToneResult {
  color: {
    skin_color: string;
    eye_color: string;
    eye_color_name: string;
    lip_color: string;
    eyebrow_color: string;
    hair_color: string;
    hair_color_name: string;
  };
  face_quality?: {
    has_face: boolean;
    area?: string;
    frontal?: string;
    lighting?: string;
    faceangle?: string;
  };
}

export interface YouCamSkinAnalysisResult {
  output: Array<{
    type: string;
    ui_score?: number;
    raw_score?: number;
    score?: number;
    mask_urls?: string[];
  }>;
}

export class YouCamClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Polls an async task until completion or timeout
   */
  async pollTask<T>(
    endpoint: string,
    taskId: string,
    maxAttempts = 18,
    intervalMs = 2000
  ): Promise<YouCamTaskResult<T>> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((r) => setTimeout(r, intervalMs));
      const res = await fetch(`${BASE_URL}${endpoint}/${taskId}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });

      if (!res.ok) {
        return { success: false, errorMessage: `HTTP ${res.status}: ${res.statusText}`, taskId };
      }

      const body = await res.json();
      const taskStatus = body?.data?.task_status || body?.status;

      if (taskStatus === 'success' || (body?.status === 200 && body?.data?.results)) {
        return { success: true, data: body.data.results, taskId };
      }

      if (taskStatus === 'error') {
        return {
          success: false,
          error: body?.data?.error || 'TaskError',
          errorMessage: body?.data?.error_message || 'Task processing failed.',
          taskId,
        };
      }
    }

    return { success: false, errorMessage: 'Polling timeout exceeded (36s).', taskId };
  }

  /**
   * Upload a raw image buffer via the YouCam File API to obtain a file_id
   */
  async uploadFile(
    buffer: Buffer,
    contentType = 'image/jpeg',
    fileName = 'upload.jpg'
  ): Promise<string | null> {
    try {
      const initRes = await fetch(`${BASE_URL}/s2s/v2.0/file`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          files: [
            {
              file_name: fileName,
              file_size: buffer.length,
              content_type: contentType,
            },
          ],
        }),
      });

      if (!initRes.ok) return null;
      const initData = await initRes.json();
      const fileObj = initData?.data?.files?.[0] || initData?.files?.[0];
      if (!fileObj || !fileObj.requests?.[0]) return null;

      const uploadReq = fileObj.requests[0];
      const putRes = await fetch(uploadReq.url, {
        method: uploadReq.method || 'PUT',
        headers: uploadReq.headers || { 'Content-Type': contentType },
        body: new Uint8Array(buffer),
      });

      if (putRes.ok) {
        return fileObj.file_id;
      }
    } catch (e) {
      console.warn('YouCam File upload failed:', e);
    }
    return null;
  }

  /**
   * AI Skin Tone Analysis
   * With flexible angle strictness for high real-world accuracy on selfies.
   */
  async runSkinToneAnalysis(
    srcFileUrlOrId: string,
    strictness: 'strict' | 'high' | 'medium' | 'low' | 'flexible' = 'flexible'
  ): Promise<YouCamTaskResult<YouCamSkinToneResult>> {
    const isFileId = !srcFileUrlOrId.startsWith('http');
    const body: Record<string, any> = {
      face_angle_strictness_level: strictness,
    };
    if (isFileId) {
      body.src_file_id = srcFileUrlOrId;
    } else {
      body.src_file_url = srcFileUrlOrId;
    }

    const res = await fetch(`${BASE_URL}/s2s/v2.0/task/skin-tone-analysis`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    const initData = await res.json();
    const taskId = initData?.data?.task_id;
    if (!taskId) {
      return {
        success: false,
        errorMessage: initData?.error_message || 'Failed to start skin tone task',
      };
    }

    return this.pollTask<YouCamSkinToneResult>('/s2s/v2.0/task/skin-tone-analysis', taskId);
  }

  /**
   * AI Skin Analysis (SD / HD concerns)
   * Requests pore, oiliness, moisture, redness, texture, age_spot with format=json
   */
  async runSkinAnalysis(
    srcFileUrlOrId: string
  ): Promise<YouCamTaskResult<YouCamSkinAnalysisResult>> {
    const isFileId = !srcFileUrlOrId.startsWith('http');
    const body: Record<string, any> = {
      dst_actions: ['pore', 'oiliness', 'moisture', 'redness', 'texture', 'age_spot'],
      format: 'json',
    };
    if (isFileId) {
      body.src_file_id = srcFileUrlOrId;
    } else {
      body.src_file_url = srcFileUrlOrId;
    }

    const res = await fetch(`${BASE_URL}/s2s/v2.0/task/skin-analysis`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    const initData = await res.json();
    const taskId = initData?.data?.task_id;
    if (!taskId) {
      return {
        success: false,
        errorMessage: initData?.error_message || 'Failed to start skin analysis task',
      };
    }

    return this.pollTask<YouCamSkinAnalysisResult>('/s2s/v2.0/task/skin-analysis', taskId);
  }

  /**
   * AI Clothes (Cloth) Virtual Try-On
   * Uses /s2s/v2.0/task/cloth-v4 as specified in YouCam API Reference
   */
  async runClothesVTO(
    userImgUrlOrId: string,
    garmentImgUrlOrId: string,
    garmentCategory: 'auto' | 'upper_body' | 'lower_body' | 'full_body' = 'upper_body'
  ): Promise<YouCamTaskResult<{ url: string }>> {
    const body: Record<string, any> = {
      garment_category: garmentCategory,
    };

    if (userImgUrlOrId.startsWith('http')) {
      body.src_file_url = userImgUrlOrId;
    } else {
      body.src_file_id = userImgUrlOrId;
    }

    if (garmentImgUrlOrId.startsWith('http')) {
      body.ref_file_url = garmentImgUrlOrId;
    } else {
      body.ref_file_id = garmentImgUrlOrId;
    }

    const res = await fetch(`${BASE_URL}/s2s/v2.0/task/cloth-v4`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    const initData = await res.json();
    const taskId = initData?.data?.task_id;
    if (!taskId) {
      return {
        success: false,
        errorMessage: initData?.error_message || 'Failed to start clothes VTO task',
      };
    }

    return this.pollTask<{ url: string }>('/s2s/v2.0/task/cloth-v4', taskId);
  }

  /**
   * AI Look Virtual Try-On (/s2s/v2.0/task/look-vto)
   * Applies curated beauty looks crafted by beauty experts.
   */
  async runLookVTO(
    srcFileUrlOrId: string,
    templateId = 'all_rosy_chic'
  ): Promise<YouCamTaskResult<{ url: string }>> {
    const isFileId = !srcFileUrlOrId.startsWith('http');
    const body: Record<string, any> = {
      template_id: templateId,
    };

    if (isFileId) {
      body.src_file_id = srcFileUrlOrId;
    } else {
      body.src_file_url = srcFileUrlOrId;
    }

    const res = await fetch(`${BASE_URL}/s2s/v2.0/task/look-vto`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    const initData = await res.json();
    const taskId = initData?.data?.task_id;
    if (!taskId) {
      return {
        success: false,
        errorMessage: initData?.error_message || 'Failed to start look VTO task',
      };
    }

    return this.pollTask<{ url: string }>('/s2s/v2.0/task/look-vto', taskId);
  }

  /**
   * List Available AI Look Templates
   */
  async listLookTemplates(pageSize = 20, startingToken?: string): Promise<any> {
    let url = `${BASE_URL}/s2s/v2.0/task/template/look-vto?page_size=${pageSize}`;
    if (startingToken) {
      url += `&starting_token=${encodeURIComponent(startingToken)}`;
    }
    const res = await fetch(url, { headers: this.getHeaders() });
    return res.json();
  }

  /**
   * AI Makeup Virtual Try-On
   * Applies smooth, lip finish, and complexion effects.
   */
  async runMakeupVTO(
    srcFileUrlOrId: string,
    effects: any[] = [
      {
        category: 'skin_smooth',
        skinSmoothStrength: 45,
        skinSmoothColorIntensity: 40,
      },
      {
        category: 'lip_color',
        shape: { name: 'original' },
        style: { type: 'full' },
        palettes: [
          {
            color: '#c17d73',
            texture: 'satin',
            colorIntensity: 50,
            gloss: 35,
          },
        ],
      },
    ],
    version = '1.0'
  ): Promise<YouCamTaskResult<{ url: string }>> {
    const isFileId = !srcFileUrlOrId.startsWith('http');
    const body: Record<string, any> = {
      version,
      effects,
    };
    if (isFileId) {
      body.src_file_id = srcFileUrlOrId;
    } else {
      body.src_file_url = srcFileUrlOrId;
    }

    const res = await fetch(`${BASE_URL}/s2s/v2.0/task/makeup-vto`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    const initData = await res.json();
    const taskId = initData?.data?.task_id;
    if (!taskId) {
      return {
        success: false,
        errorMessage: initData?.error_message || 'Failed to start makeup VTO task',
      };
    }

    return this.pollTask<{ url: string }>('/s2s/v2.0/task/makeup-vto', taskId);
  }

  /**
   * Converts YouCam skin tone result to LOOKSMITH's ToneProfile
   */
  static mapToToneProfile(colorResult: YouCamSkinToneResult['color']): ToneProfile {
    const skinHex = colorResult.skin_color || '#B98A66';
    const lipHex = colorResult.lip_color || '#B85D56';
    const eyeHex = colorResult.eye_color || '#2D1E16';
    const hairHex = colorResult.hair_color || '#1A1817';
    const eyebrowHex = colorResult.eyebrow_color || '#261C16';

    // Undertone classification: parse hex to RGB
    const hex = skinHex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 180;
    const g = parseInt(hex.substring(2, 4), 16) || 140;
    const b = parseInt(hex.substring(4, 6), 16) || 100;

    let undertone: 'warm' | 'cool' | 'neutral' = 'neutral';
    if (r - b > 45 && r > g) {
      undertone = 'warm';
    } else if (b - g > 5 || (r - b < 25 && g > 110)) {
      undertone = 'cool';
    }

    // Dynamic 6-swatch palette harmonized with undertone
    const paletteHexes =
      undertone === 'warm'
        ? [skinHex, '#8C4A32', '#C48B47', '#2E4C3E', '#F2D398', '#4A3427']
        : undertone === 'cool'
        ? [skinHex, '#2A3B5C', '#875C74', '#405B55', '#E3C8D0', '#2B2B36']
        : [skinHex, '#5B4E47', '#8E6E53', '#394B43', '#E6D7C3', '#252528'];

    return {
      skinToneHex: skinHex,
      undertone,
      eyeColorHex: eyeHex,
      eyebrowColorHex: eyebrowHex,
      lipColorHex: lipHex,
      hairColorHex: hairHex,
      paletteHexes,
    };
  }

  /**
   * Converts YouCam skin analysis output array to LOOKSMITH's SkinConcernScores
   */
  static mapToSkinScores(output: YouCamSkinAnalysisResult['output']): SkinConcernScores {
    const findScore = (type: string, fallback: number) => {
      const match = output.find((o) => o.type === type);
      if (!match) return fallback;
      const score = match.ui_score !== undefined ? match.ui_score : match.raw_score;
      if (score === undefined) return fallback;
      return Math.round(score);
    };

    // Note: YouCam ui_score represents healthiness (higher = healthier/fewer pores).
    // In our SkinConcernScores, oiliness, redness, pores, and spots represent severity (0-100).
    const poreHealth = findScore('pore', 75);
    const oilHealth = findScore('oiliness', 70);
    const moistureHealth = findScore('moisture', 65);
    const rednessHealth = findScore('redness', 80);
    const textureHealth = findScore('texture', 75);
    const spotHealth = findScore('age_spot', 82);

    return {
      pores: Math.max(10, Math.min(95, 100 - poreHealth)),
      oiliness: Math.max(10, Math.min(95, 100 - oilHealth)),
      moisture: Math.max(15, Math.min(95, moistureHealth)),
      redness: Math.max(5, Math.min(95, 100 - rednessHealth)),
      texture: Math.max(10, Math.min(95, 100 - textureHealth)),
      spots: Math.max(5, Math.min(95, 100 - spotHealth)),
    };
  }
}
