# Architectural & Product Decisions (DECISIONS.md)

This log documents decisions made during the build of **LOOKSMITH** according to the project brief.

## 1. Full-Stack Dev Architecture
- **Decision:** Built with an Express + Vite middleware server (`server.ts`) in development and production (`tsx server.ts`).
- **Rationale:** Ensures clean server-side proxying of YouCam and Gemini APIs (zero API key exposure to client code), true Server-Sent Events (SSE) streaming for the live Agent Stage timeline, and direct serving of the embeddable `looksmith.js` widget and `demo-store.html`.

## 2. YouCam Integration & Unit Conservation
- **Decision:** Implemented a unified `runTask` polling client with SHA-256 caching and a robust `DEMO_MODE=cached` system.
- **Rationale:** The hackathon assigns ~1,000 free units. A hard cap of 14 calls per session is enforced. In `DEMO_MODE=cached`, pre-recorded high-fidelity analysis and VTO results for 3 diverse personas (Maya, Aisha, Chloe) replay instantly without consuming credits or risking network dropouts during judge evaluations or video recording. When `YOUCAM_API_KEY` is provided, live calls execute against `https://yce-api-01.makeupar.com`.

## 3. Skin-to-Makeup Rule Engine
- **Decision:** Pure deterministic skin rule engine in `src/utils/skinRules.ts`.
- **Rules applied:**
  - High oiliness / pores (>60) → Matte or satin base finish, sheer/velvet lip, no glossy lips, avoids high-shine highlighters.
  - Low hydration (<45) or rough texture → Dewy or luminous satin finish, hydrating tint, avoids heavy matte drying powders.
  - High redness (>55) / sensitivity → Soft low-intensity neutral tones (40% default intensity), avoidance of harsh red lips, adds "Gentle picks" comfort badge.
  - Pigmentation / uneven tone (>55) → Medium-coverage radiant finish, balanced lip/eye color drawn from personal skin tone palette.
  - Balanced/low concerns → Dynamic harmonized look from tone palette.
- **Tone Palette Harmony:** Derived from YouCam Skin Tone Analysis (skin, eye, brow, lip, hair colors). Dynamic accent calculation finds the deep harmonic swatch that satisfies WCAG AA contrast (≥4.5:1) against white, which tints the UI tokens in real-time.

## 4. Deterministic Scoring Model
- **Decision:** Standardized 0–100 scoring model:
  - **Palette Match (40 pts):** Uses CIEDE2000 color difference (ΔE) between garment hex and nearest tone swatch, with bonus for analogous / complementary harmony.
  - **Occasion Fit (25 pts):** Match score between occasion tags (wedding, formal, party, casual, office) and product tags.
  - **Budget Fit (15 pts):** Linear penalty if total outfit exceeds user-specified budget; max score if within budget.
  - **Skin-Safety (20 pts):** Bonus for breathable, hypoallergenic fabrics (linen, cotton, silk) when skin sensitivity/oiliness is flagged.
  - **Penalties:** Clashing undertones (-15), silhouette duplication (-10).

## 5. Gemini 3.5 Flash Lite Agent Loop & Fallback
- **Decision:** Used `@google/genai` with model `gemini-3.5-flash-lite` (configurable via `GEMINI_MODEL`, defaulting to `gemini-3.5-flash-lite`). Structured JSON generation with strict validation.
- **Resilience:** If `GEMINI_API_KEY` is absent or the API request times out (>12s), the backend seamlessly transitions to the local deterministic planner. The user journey never dead-ends.

## 6. Widget & White-Label Architecture
- **Decision:** LOOKSMITH can run both as a standalone responsive web application and as an embeddable script (`/looksmith.js`).
- **PostMessage Protocol:**
  - `looksmith:ready`: Widget signals ready state.
  - `looksmith:open` / `looksmith:close`: Modal visibility controls.
  - `looksmith:add-to-bag`: Returns selected SKUs, quantities, and look metadata to the host store.
- **Theming:** Token-driven design variables (`--accent`, `--font-display`, `--radius-scale`, retailer logo) allow instant rebranding between multi-brand marketplace ("Meridian Mart") and single brand ("Northloom Denim Co.").
