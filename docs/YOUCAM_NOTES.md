# YouCam API Integration Notes & Architecture (`docs/YOUCAM_NOTES.md`)

## 1. Overview & Base Server
- **Host:** `https://yce-api-01.makeupar.com`
- **Auth Header:** `X-API-KEY: <YOUCAM_API_KEY>` or `Authorization: Bearer <YOUCAM_API_KEY>`
- **Content Type:** `multipart/form-data` for file uploads or `application/json` with accessible image URLs.
- **Workflow:** Async Task Pattern
  1. `POST /api/v1/<service>/tasks` → returns `{ task_id, status: 'running' | 'pending' }`
  2. `GET /api/v1/<service>/tasks/{task_id}` → polls until `{ status: 'success', result: { ... } }` or `{ status: 'failed', error: '...' }`
  3. Exponential backoff polling: initial delay 1.5s, step 1.25x up to max 4s, maximum duration 60s.

## 2. APIs Used in Pipeline (≥4 APIs)

### A. AI Skin Analysis (`/api/v1/skin_analysis/tasks`)
- **Purpose:** Analyze skin texture, oiliness, moisture/hydration, redness, pores, and spots.
- **Rules per YouCam Spec:**
  - SD and HD concerns cannot be mixed in a single request.
  - Concerns requested: `texture`, `pores`, `oiliness`, `moisture`, `redness`, `spots`.
  - Resolution: Supports up to 4096px (client-side resized to max 1200px for speed and bandwidth optimization).
- **Output:** Normalized severity scores (0–100) per concern, bounding masks/regions, and skin age approximation.
- **Mapping to LOOKSMITH:** Drives makeup finish selection (dewy vs matte vs satin), coverage recommendation, and skin-comfort badging.

### B. AI Skin Tone Analysis (`/api/v1/skin_tone/tasks`)
- **Purpose:** Detects nuanced facial tone features.
- **Output:**
  - `skin_tone`: Hex color + undertone classification (warm / cool / neutral) + Pantone/Monk scale reference.
  - `eye_color`: Hex color.
  - `eyebrow_color`: Hex color.
  - `lip_color`: Hex color.
  - `hair_color`: Hex color.
- **Mapping to LOOKSMITH:** Generates a 6-swatch personalized color palette (Primary, Secondary, Accent, Warm Contrast, Cool Neutral, Evening Deep). Also calculates the dynamic UI accent color with AA contrast.

### C. AI Clothes (Cloth) Virtual Try-On (`/s2s/v2.0/task/cloth-v4`)
- **Endpoint:** `POST https://yce-api-01.makeupar.com/s2s/v2.0/task/cloth-v4`
- **Unit Consumption:** 2 units
- **Image Requirements:**
  - `src_file_url` or `src_file_id`: High-res full-body photo (1024×768 recommended, 512×384 min, <10MB).
  - `ref_file_url` or `ref_file_id` / `template_id`: Product flat-lay or real-person reference image.
  - `garment_category`: `'auto'`, `'upper_body'`, `'lower_body'`, `'full_body'`.
- **Polling Endpoint:** `GET /s2s/v2.0/task/cloth-v4/{task_id}`
- **Output:** Synthesized photorealistic try-on image (`results.url`) showing natural garment draping, lighting match, and occlusion.

### D. AI Look Virtual Try-On (`/s2s/v2.0/task/look-vto`) & Makeup VTO
- **Endpoint:** `POST https://yce-api-01.makeupar.com/s2s/v2.0/task/look-vto`
- **Unit Consumption:** 2 units
- **List Look Templates:** `GET /s2s/v2.0/task/template/look-vto?page_size=20`
- **Parameters:**
  - `src_file_url` or `src_file_id`: Customer photo (face width >= 100px, long side < 1920px).
  - `template_id`: Template ID (e.g., `all_rosy_chic`, `good_template_001`, `berry_smooth`).
- **Polling Endpoint:** `GET /s2s/v2.0/task/look-vto/{task_id}`
- **Output:** Rendered try-on image (`results.url`) with seamless blend onto facial landmarks.
- **Fine-Grained Makeup VTO:** `/s2s/v2.0/task/makeup-vto` for skin smooth strength and lip saturation customisation.

## 3. Unit Budget & Thrift Architecture
- **Free Allowance:** ~1,000 units.
- **Cost Minimization Strategies:**
  1. **Session Hard Cap:** Max 14 live calls per session.
  2. **Hash-based Local Caching:** Computes `SHA256(image_bytes + params)`. If hit, returns instantly with zero network/unit cost.
  3. **Parallel Execution:** Skin Analysis and Skin Tone Analysis trigger concurrently via `Promise.all()`.
  4. **Staggered Look Rendering:** Hero look receives full Clothes + Makeup VTO; secondary looks receive Clothes VTO initially with on-demand makeup upgrade upon tap.
  5. **Cached Demo Mode (`DEMO_MODE=cached`):** Provides instant, verified responses for pre-set customer profiles, enabling 100% predictable judge evaluation, tests, and zero-downtime offline demonstrations.
