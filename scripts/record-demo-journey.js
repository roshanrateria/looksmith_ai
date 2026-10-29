async (page) => {
  // Inject ripple only (No captions, No chips, No subtitles) and enforce >=16px task ID font size
  const injectRippleAndStyles = async () => {
    await page.evaluate(() => {
      if (document.getElementById('demo-touch-ripple-root')) return;

      const style = document.createElement('style');
      style.id = 'demo-touch-ripple-root';
      style.textContent = `
        /* Enforce task ID readability at 1080p */
        .task-id-mono, [data-task-id] {
          font-size: 16px !important;
          line-height: 1.4 !important;
        }
      `;
      document.head.appendChild(style);

      // Tap ripple on click
      document.addEventListener('pointerdown', (e) => {
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        ripple.style.width = '36px';
        ripple.style.height = '36px';
        ripple.style.marginLeft = '-18px';
        ripple.style.marginTop = '-18px';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'radial-gradient(circle, rgba(229,186,130,0.85) 0%, rgba(31,58,52,0.4) 60%, transparent 100%)';
        ripple.style.boxShadow = '0 0 18px rgba(229,186,130,0.6)';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '100000002';
        ripple.style.transition = 'transform 0.45s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 0.45s ease';
        ripple.style.transform = 'scale(0.3)';
        ripple.style.opacity = '1';
        document.body.appendChild(ripple);
        requestAnimationFrame(() => {
          ripple.style.transform = 'scale(2.2)';
          ripple.style.opacity = '0';
        });
        setTimeout(() => ripple.remove(), 500);
      }, true);

      // Scene 10 End Card (Plain text only, dark grey background, no stats, no claims)
      const endCard = document.createElement('div');
      endCard.id = 'demo-end-card';
      endCard.style.cssText = 'position:fixed;inset:0;background:#0F0D0C;display:none;flex-direction:column;align-items:center;justify-content:center;z-index:100000001;padding:48px;text-align:center;transition:opacity 0.6s ease;opacity:0;pointer-events:none;';
      endCard.innerHTML = `
        <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:56px;font-weight:600;color:#FAF8F5;margin-bottom:12px;letter-spacing:-0.02em;">
          LOOKSMITH
        </div>
        <div style="font-size:15px;color:#E5BA82;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:36px;font-weight:600;">
          Autonomous Skin & Tone-Aware Fashion Stylist
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:20px;max-width:760px;width:100%;margin-bottom:40px;text-align:left;">
          <div style="background:rgba(255,255,255,0.05);padding:20px;border-radius:16px;border:1px solid rgba(255,255,255,0.1);">
            <div style="color:#34D399;font-size:13px;font-weight:700;margin-bottom:4px;">1. AI Skin Analysis</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.7);">Cosmetic pore, oiliness, and redness detection</div>
          </div>
          <div style="background:rgba(255,255,255,0.05);padding:20px;border-radius:16px;border:1px solid rgba(255,255,255,0.1);">
            <div style="color:#34D399;font-size:13px;font-weight:700;margin-bottom:4px;">2. AI Skin Tone Analysis</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.7);">Personalized 6-swatch CIEDE2000 tone palette</div>
          </div>
          <div style="background:rgba(255,255,255,0.05);padding:20px;border-radius:16px;border:1px solid rgba(255,255,255,0.1);">
            <div style="color:#34D399;font-size:13px;font-weight:700;margin-bottom:4px;">3. AI Clothes Virtual Try-On (Full Body)</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.7);">Full-body garment rendering on shopper photo</div>
          </div>
          <div style="background:rgba(255,255,255,0.05);padding:20px;border-radius:16px;border:1px solid rgba(255,255,255,0.1);">
            <div style="color:#34D399;font-size:13px;font-weight:700;margin-bottom:4px;">4. AI Clothes Virtual Try-On (Upper Body)</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.7);">Upper-body drape & silhouette try-on</div>
          </div>
        </div>
        <div style="font-size:14px;color:rgba(255,255,255,0.6);font-family:monospace;letter-spacing:0.02em;">
          https://github.com/roshanrateria/looksmith_ai
        </div>
      `;
      document.body.appendChild(endCard);

      window.__demo = {
        showEnd: () => {
          endCard.style.display = 'flex';
          requestAnimationFrame(() => { endCard.style.opacity = '1'; });
        }
      };
    });
  };

  await injectRippleAndStyles();

  // SCENE 1: Welcome (0:00 - 0:10 = 10s)
  console.log('[SCENE 1: Welcome] 0:00 - 0:10');
  await new Promise((r) => setTimeout(r, 7500));
  const startBtn = page.locator('button:has-text("Start Styling")');
  await startBtn.hover();
  await new Promise((r) => setTimeout(r, 1000));
  await startBtn.click();
  await new Promise((r) => setTimeout(r, 2500));

  // SCENE 2: Consent and capture (0:10 - 0:25 = 15s)
  console.log('[SCENE 2: Consent and capture] 0:10 - 0:25');
  await new Promise((r) => setTimeout(r, 2500));
  const agreeBtn = page.locator('button:has-text("I Agree & Continue")');
  await agreeBtn.click();
  await new Promise((r) => setTimeout(r, 5500));

  // Shutter click for photo capture (auto face crop)
  const shutterBtn = page.locator('button[aria-label="Take selfie photo"]');
  await shutterBtn.hover();
  await new Promise((r) => setTimeout(r, 1500));
  await shutterBtn.click();
  await new Promise((r) => setTimeout(r, 8500));

  // SCENE 3: Skin and tone (0:25 - 0:50 = 25s)
  console.log('[SCENE 3: Skin and tone] 0:25 - 0:50');
  // Wait for profile screen to appear
  await page.locator('text=Here is what we noticed').waitFor({ state: 'visible', timeout: 45000 });

  // Let task IDs stay readable on Under the Hood panel for at least 3-4 seconds
  await new Promise((r) => setTimeout(r, 5000));

  // Interact with concern markers
  const balanceBtn = page.locator('button:has-text("T-Zone Balance")');
  if (await balanceBtn.isVisible()) {
    await balanceBtn.hover();
    await new Promise((r) => setTimeout(r, 1000));
    await balanceBtn.click();
    await new Promise((r) => setTimeout(r, 1500));
  }

  const poreBtn = page.locator('button:has-text("Pore Refinement")');
  if (await poreBtn.isVisible()) {
    await poreBtn.hover();
    await new Promise((r) => setTimeout(r, 1000));
    await poreBtn.click();
    await new Promise((r) => setTimeout(r, 1500));
  }

  // Click tone swatch
  const swatches = page.locator('button[title^="Copy hex"]');
  if (await swatches.first().isVisible()) {
    await swatches.first().click();
    await new Promise((r) => setTimeout(r, 2000));
  }

  // Screenshot 3 (Profile)
  await page.screenshot({ path: 'artifacts/screenshots/scene-3-profile.png' });

  // Let Under the Hood panel remain visible before advancing
  await new Promise((r) => setTimeout(r, 4500));

  // Click Continue to Occasion
  const continueBtn = page.locator('button:has-text("Choose Occasion & Style Looks")');
  await continueBtn.click();
  await new Promise((r) => setTimeout(r, 2500));

  // SCENE 4: Occasion and budget (0:50 - 1:05 = 15s)
  console.log('[SCENE 4: Occasion and budget] 0:50 - 1:05');
  const occasionInput = page.locator('textarea');
  await occasionInput.fill("cousin's wedding, evening");
  await new Promise((r) => setTimeout(r, 1500));

  const slider = page.locator('input[type="range"]');
  if (await slider.isVisible()) {
    await slider.fill('6000');
    await new Promise((r) => setTimeout(r, 1500));
  }

  await new Promise((r) => setTimeout(r, 3500));

  const launchBtn = page.locator('button:has-text("Launch AI Stylist Agent")');
  await launchBtn.click();
  await new Promise((r) => setTimeout(r, 2000));

  // SCENE 5: Agent at work (1:05 - 1:35 = 30s)
  console.log('[SCENE 5: Agent at work] 1:05 - 1:35');
  // Wait for Self-Correction badge to appear
  const selfCorrectionBadge = page.locator('text=Self-Correction').first();
  await selfCorrectionBadge.waitFor({ state: 'visible', timeout: 65000 });
  await new Promise((r) => setTimeout(r, 4500));

  // Open Technical Trace to inspect critic reasoning
  const techTraceBtn = page.locator('button:has-text("Technical Trace")').first();
  if (await techTraceBtn.isVisible()) {
    await techTraceBtn.click();
    await new Promise((r) => setTimeout(r, 4500));
  }

  // Screenshot 5 (Agent Stage)
  await page.screenshot({ path: 'artifacts/screenshots/scene-5-agent-stage.png' });

  // Wait for completed looks
  const viewLooksBtn = page.locator('button:has-text("View Curated Looks")').first();
  await viewLooksBtn.waitFor({ state: 'visible', timeout: 75000 });
  await new Promise((r) => setTimeout(r, 3500));
  await viewLooksBtn.click();
  await new Promise((r) => setTimeout(r, 3000));

  // SCENE 6: Look carousel (1:35 - 2:05 = 30s)
  console.log('[SCENE 6: Look carousel] 1:35 - 2:05');
  // Look 1: Live VTO render on user photo
  await new Promise((r) => setTimeout(r, 4500));

  // Hold peek before
  const peekBtn = page.locator('button:has-text("Hold to Peek Before")').first();
  if (await peekBtn.isVisible()) {
    const box = await peekBtn.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await new Promise((r) => setTimeout(r, 2500));
      await page.mouse.up();
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // Open Skin-Safe Certification sheet
  const matchBadge = page.locator('button:has-text("Match Score")').first();
  if (await matchBadge.isVisible()) {
    await matchBadge.click();
    await new Promise((r) => setTimeout(r, 2500));
    const closeSheetBtn = page.locator('button:has-text("Close")').first();
    if (await closeSheetBtn.isVisible()) {
      await closeSheetBtn.click();
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  // Advance to Look 2
  const nextBtn = page.locator('button[aria-label="Next Look"]');
  await nextBtn.click();
  await new Promise((r) => setTimeout(r, 4500));

  // Hold peek before on Look 2
  if (await peekBtn.isVisible()) {
    const box = await peekBtn.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await new Promise((r) => setTimeout(r, 2500));
      await page.mouse.up();
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // Screenshot 6 (Carousel)
  await page.screenshot({ path: 'artifacts/screenshots/scene-6-carousel.png' });
  await new Promise((r) => setTimeout(r, 2500));

  // SCENE 7: Learning from feedback (2:05 - 2:20 = 15s)
  console.log('[SCENE 7: Learning from feedback] 2:05 - 2:20');
  const dislikeBtn = page.locator('button[aria-label="Dislike Look"]');
  await dislikeBtn.click();
  await new Promise((r) => setTimeout(r, 2500));

  await nextBtn.click();
  await new Promise((r) => setTimeout(r, 1500));

  const likeBtn = page.locator('button[aria-label="Like Look"]');
  await likeBtn.click();
  await new Promise((r) => setTimeout(r, 2500));

  // Screenshot 7 (Learning)
  await page.screenshot({ path: 'artifacts/screenshots/scene-7-learning.png' });

  const replanBtn = page.locator('button:has-text("Re-plan")').first();
  if (await replanBtn.isVisible()) {
    await replanBtn.click();
    await new Promise((r) => setTimeout(r, 3500));
    try {
      const viewLooksReplan = page.locator('button:has-text("View Curated Looks")').first();
      await viewLooksReplan.waitFor({ state: 'visible', timeout: 50000 });
      await viewLooksReplan.click();
      await new Promise((r) => setTimeout(r, 2000));
    } catch (e) {
      // continue
    }
  }

  // SCENE 8: B2B handoff and share (2:20 - 2:35 = 15s)
  console.log('[SCENE 8: B2B handoff and share] 2:20 - 2:35');
  // Add to Bag
  const addToBagBtn = page.locator('button:has-text("Add Complete Look to Bag")').first();
  if (await addToBagBtn.isVisible()) {
    await addToBagBtn.click();
    await new Promise((r) => setTimeout(r, 2200));
    const continueShopBtn = page.locator('button:has-text("Continue Shopping")').first();
    if (await continueShopBtn.isVisible()) {
      await continueShopBtn.click();
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  // Open Share Look Card
  const shareBtn = page.locator('button[aria-label="Share Look Card"]');
  if (await shareBtn.isVisible()) {
    await shareBtn.click();
    await new Promise((r) => setTimeout(r, 2500));

    // Screenshot 8-share
    await page.screenshot({ path: 'artifacts/screenshots/scene-8-share.png' });

    const closeShare = page.locator('button[aria-label="Close share modal"]');
    if (await closeShare.isVisible()) {
      await closeShare.click({ force: true });
    } else {
      await page.keyboard.press('Escape');
    }
    await new Promise((r) => setTimeout(r, 1800));
  }

  // Open Retailer Console
  const consoleNavBtn = page.locator('button:has-text("Retailer Console")').first();
  if (await consoleNavBtn.isVisible()) {
    await consoleNavBtn.click();
    await new Promise((r) => setTimeout(r, 3000));

    // Screenshot 8-b2b
    await page.screenshot({ path: 'artifacts/screenshots/scene-8-b2b.png' });
    await new Promise((r) => setTimeout(r, 2500));
  }

  // SCENE 9: Storefront embed (2:35 - 2:45 = 10s)
  console.log('[SCENE 9: Storefront embed] 2:35 - 2:45');
  await page.goto('http://localhost:3000/demo-store.html');
  await page.waitForLoadState('networkidle');
  await injectRippleAndStyles();

  const widgetBtn = page.locator('#looksmith-launcher-btn');
  await widgetBtn.waitFor({ state: 'visible', timeout: 8000 });
  await new Promise((r) => setTimeout(r, 2000));
  await widgetBtn.click();
  await new Promise((r) => setTimeout(r, 6500));

  // SCENE 10: End card (2:45 - 2:52 = 7s)
  console.log('[SCENE 10: End card] 2:45 - 2:52');
  await page.evaluate(() => {
    window.__demo.showEnd();
  });
  await new Promise((r) => setTimeout(r, 8500));

  console.log('Journey complete!');
}