import puppeteer from 'puppeteer-core';
import path from 'path';

const SCREENSHOT_DIR = '/Users/sujaytudu/.gemini/antigravity/brain/a6e1ed7c-19ad-46f5-89a8-89d018bca48f/screenshots';

const stages = [
  { name: 'stage_00_intro', progress: 0.02, title: 'Intro Assembled Hero' },
  { name: 'stage_01_engine', progress: 1.5 / 12, title: '01 Parallel-Twin Engine' },
  { name: 'stage_02_frame', progress: 2.5 / 12, title: '02 Dual-Beam Aluminium Frame' },
  { name: 'stage_03_front_fork', progress: 3.5 / 12, title: '03 41mm Inverted Fork' },
  { name: 'stage_04_front_brakes', progress: 4.5 / 12, title: '04 ByBre Radial Brakes' },
  { name: 'stage_05_electronics', progress: 5.5 / 12, title: '05 APRC Electronics' },
  { name: 'stage_06_winglets', progress: 6.5 / 12, title: '06 Double Fairing & Aero' },
  { name: 'stage_07_exhaust', progress: 7.5 / 12, title: '07 2-into-1 Underbelly Exhaust' },
  { name: 'stage_08_swingarm_shock', progress: 8.5 / 12, title: '08 Asymmetric Swingarm & Monoshock' },
  { name: 'stage_09_wheels', progress: 9.5 / 12, title: '09 17-Inch Alloy Wheels' },
  { name: 'stage_10_cockpit', progress: 10.5 / 12, title: '10 5-Inch TFT Cockpit' },
  { name: 'stage_11_outro', progress: 0.98, title: 'Outro Reassembly Complete' },
];

async function run() {
  console.log('[Puppeteer] Launching Brave Browser...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--window-size=1440,900',
    ],
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
    },
  });

  const page = await browser.newPage();

  page.on('console', (msg) => {
    const text = msg.text();
    if (!text.includes('React DevTools')) {
      console.log(`[Browser Console ${msg.type()}]`, text);
    }
  });

  page.on('pageerror', (err) => {
    console.error('[Browser PageError]', err);
  });

  console.log('[Puppeteer] Navigating to http://127.0.0.1:5173...');
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for Lenis and Preloader completion
  await page.waitForFunction(() => window.__lenis !== undefined);
  console.log('[Puppeteer] Waiting for Rodin 3D model to mount and preloader to wipe...');
  await new Promise((r) => setTimeout(r, 4000));

  console.log('\n[Puppeteer] Capturing 10 Scroll Telemetry Stages + Hero/Outro...');

  for (const st of stages) {
    console.log(`Capturing: ${st.title} (${st.name}) at progress ${st.progress.toFixed(3)}...`);
    
    // Scroll Lenis to target progress
    await page.evaluate((prog) => {
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      window.__lenis.scrollTo(prog * scrollMax, { immediate: false, duration: 0.8 });
    }, st.progress);

    // Wait for camera lerp and leader-line update
    await new Promise((r) => setTimeout(r, 1500));

    const filepath = path.join(SCREENSHOT_DIR, `${st.name}.png`);
    await page.screenshot({ path: filepath, type: 'png' });
    console.log(`✓ Saved ${filepath}`);
  }

  // Test 360° Inspection Mode views
  console.log('\n[Puppeteer] Testing 360° Inspection Mode Views...');
  // Click "INSPECT 360°" button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const inspectBtn = btns.find((b) => b.textContent.includes('INSPECT 360°'));
    if (inspectBtn) inspectBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  const inspectionViews = ['front', 'side', 'rear', 'cockpit'];
  for (const view of inspectionViews) {
    console.log(`Switching to inspection view: ${view}...`);
    await page.evaluate((v) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const targetBtn = btns.find((b) => b.textContent.toLowerCase() === v);
      if (targetBtn) targetBtn.click();
    }, view);

    await new Promise((r) => setTimeout(r, 1200));
    const filepath = path.join(SCREENSHOT_DIR, `inspect_${view}.png`);
    await page.screenshot({ path: filepath, type: 'png' });
    console.log(`✓ Saved ${filepath}`);
  }

  await browser.close();
  console.log('\n[Puppeteer] All screenshots and inspection views captured successfully!');
}

run().catch((err) => {
  console.error('[Puppeteer Error]', err);
  process.exit(1);
});
