const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const { execSync } = require('child_process');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Scene narration cues strictly adhering to Hard Rules:
// 1. No stats or percentages (no return rate, no satisfaction metrics)
// 2. No medical or health claims
// 3. No makeup mentions
// 4. Budget framing: AI found closest match for wedding; shoppers can buy a part (hero piece) or complete look depending on choice/budget
const CUES = [
  {
    id: 1,
    scene: 'Scene 1: Welcome',
    delayMs: 2000,
    text: "LOOKSMITH is an AI stylist that retailers add to their store. One photo in, shoppable looks out."
  },
  {
    id: 2,
    scene: 'Scene 2: Consent & Capture',
    delayMs: 12000,
    text: "The shopper agrees to privacy first. Their photo stays in memory only."
  },
  {
    id: 3,
    scene: 'Scene 3: Skin & Tone',
    delayMs: 27000,
    text: "Two YouCam APIs run on the cropped face: cosmetic skin analysis and skin tone analysis. Here is the tone code, the cosmetic skin score, and a personalized palette. The UI takes on the palette accent."
  },
  {
    id: 4,
    scene: 'Scene 4: Occasion & Budget',
    delayMs: 52000,
    text: "The shopper enters their event and budget. The AI balances occasion harmony with budget flexibility."
  },
  {
    id: 5,
    scene: 'Scene 5: Agent at Work',
    delayMs: 67000,
    text: "The agent plans candidate looks. The critic checks tone harmony and budget. Watch it self-correct: the critic catches a color clash, swaps out a piece, and re-ranks."
  },
  {
    id: 6,
    scene: 'Scene 6: Look 1 VTO & Modular Budget',
    delayMs: 92000,
    text: "Look one goes to YouCam Clothes Virtual Try-On, rendering live on the shopper. The AI found this ensemble to be the closest match for the wedding occasion. Shoppers can purchase either a single hero piece or the complete look depending on their budget."
  },
  {
    id: 7,
    scene: 'Scene 6b: Look 2 Drape VTO',
    delayMs: 110000,
    text: "Look two showcases upper-body silhouette try-on with an asymmetric drape, giving shoppers versatile styling choices across their preferred price point."
  },
  {
    id: 8,
    scene: 'Scene 7: Taste Feedback',
    delayMs: 130000,
    text: "The shopper gives feedback. The stylist remembers their taste for next time."
  },
  {
    id: 9,
    scene: 'Scene 8: Retailer Console',
    delayMs: 145000,
    text: "The retailer gets the look with verified SKUs ready for checkout and fulfillment."
  },
  {
    id: 10,
    scene: 'Scene 9: Storefront Embed',
    delayMs: 157000,
    text: "LOOKSMITH drops into any storefront as an embed or full-screen experience."
  },
  {
    id: 11,
    scene: 'Scene 10: Share Card & End Card',
    delayMs: 168000,
    text: "Shoppers get a clean look card to share, powered by four live YouCam APIs and personalized tone curation."
  }
];

async function generateCueAudio(cue) {
  const filePath = `/tmp/cue_${cue.id}.wav`;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  console.log(`[TTS] Generating cue ${cue.id} (${cue.scene}): "${cue.text}"`);

  const models = ['gemini-2.5-flash-tts', 'gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts'];
  let lastError = null;

  for (let attempt = 0; attempt < 4; attempt++) {
    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: cue.text,
                  speechMetadata: {
                    style: 'Warm, clear, articulate, confident narrator for luxury retail fashion technology',
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          const wavBuffer = Buffer.from(base64Audio, 'base64');
          fs.writeFileSync(filePath, wavBuffer);
          console.log(`[TTS] Saved ${filePath} using ${model} (${wavBuffer.length} bytes)`);
          return filePath;
        }
      } catch (err) {
        console.warn(`[TTS] ${model} attempt ${attempt + 1} failed for cue ${cue.id}: ${err.message?.substring(0, 100)}`);
        lastError = err;
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    console.log(`Waiting 5s before retry...`);
    await new Promise((r) => setTimeout(r, 5000));
  }

  throw lastError || new Error(`Failed to generate audio for cue ${cue.id}`);
}

async function main() {
  console.log('=== LOOKSMITH: Generating Voiceover with Gemini TTS ===');
  console.log('Provider: Google Gemini TTS API (models: gemini-2.5-flash-tts / gemini-3.8-flash-tts)');
  console.log('Voice: Kore (warm, clear, articulate luxury narrator)');

  for (const cue of CUES) {
    await generateCueAudio(cue);
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log('=== All cues generated. Mixing master audio track at artifacts/voiceover.wav ===');

  const inputs = CUES.map((c) => `-i /tmp/cue_${c.id}.wav`).join(' ');
  const filterParts = CUES.map((c, idx) => `[${idx}]adelay=${c.delayMs}|${c.delayMs}[a${idx}]`).join(';');
  const mixInputs = CUES.map((_, idx) => `[a${idx}]`).join('');
  
  // Pad to exact length matching video (178 seconds)
  const fullFilter = `${filterParts};${mixInputs}amix=inputs=${CUES.length}:normalize=0:dropout_transition=0,apad=whole_dur=178[out]`;

  const ffmpegCmd = `ffmpeg -y ${inputs} -filter_complex "${fullFilter}" -map "[out]" -c:a pcm_s16le -ar 44100 artifacts/voiceover.wav`;
  console.log('Running mix command...');
  execSync(ffmpegCmd, { stdio: 'inherit' });

  const stats = fs.statSync('artifacts/voiceover.wav');
  console.log(`Master voiceover created at artifacts/voiceover.wav (${stats.size} bytes)`);
}

main().catch((err) => {
  console.error('Voiceover generation failed:', err);
  process.exit(1);
});
