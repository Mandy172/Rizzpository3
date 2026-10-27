import puppeteer from 'puppeteer-core';
import path from 'path';

const SCREENSHOT_DIR = '/Users/sujaytudu/.gemini/antigravity-cli/brain/1d45185d-6893-4381-ad47-5ce7df508769/screenshots';

const stages = [
  { name: 'stage_00_intro', progress: 0.02, title: 'Intro Assembled Hero' },
  { name: 'stage_01_engine', progress: 1.5 / 12, title: '01 Engine V4 65°' },
  { name: 'stage_02_frame', progress: 2.5 / 12, title: '02 Frame & Subframe (Scan Mode)' },
  { name: 'stage_03_front_fork', progress: 3.5 / 12, title: '03 Öhlins Inverted Fork' },
  { name: 'stage_04_front_brakes', progress: 4.5 / 12, title: '04 Brembo Stylema Brakes' },
  { name: 'stage_05_electronics', progress: 5.5 / 12, title: '05 APRC Electronics (Scan Mode)' },
  { name: 'stage_06_winglets', progress: 6.5 / 12, title: '06 MotoGP Aero Winglets' },
  { name: 'stage_07_exhaust', progress: 7.5 / 12, title: '07 Akrapovič Titanium Exhaust' },
  { name: 'stage_08_swingarm_shock', progress: 8.5 / 12, title: '08 Swingarm & Öhlins TTX' },
  { name: 'stage_09_wheels', progress: 9.5 / 12, title: '09 Forged Magnesium Wheels' },
  { name: 'stage_10_cockpit', progress: 10.5 / 12, title: '10 TFT Telemetry Cockpit' },
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
    console.log(`[Browser Console ${msg.type()}]`, text);
  });

  page.on('pageerror', (err) => {
    console.error('[Browser PageError]', err);
  });

  console.log('[Puppeteer] Navigating to http://127.0.0.1:5173...');
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for Lenis and 3D canvas to mount
  await page.waitForFunction(() => window.__lenis !== undefined);
  await new Promise((r) => setTimeout(r, 2000));

  console.log('[Puppeteer] Capturing 10 Stages + Intro/Outro...');

  for (const st of stages) {
    console.log(`\nCapturing: ${st.title} (${st.name}) at progress ${st.progress.toFixed(3)}...`);
    
    // Scroll Lenis to target progress
    await page.evaluate((prog) => {
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      window.__lenis.scrollTo(prog * scrollMax, { immediate: false, duration: 0.8 });
    }, st.progress);

    // Wait for GSAP scrub, camera dolly and power3.inOut transition
    await new Promise((r) => setTimeout(r, 1400));

    const filepath = path.join(SCREENSHOT_DIR, `${st.name}.png`);
    await page.screenshot({ path: filepath, type: 'png' });
    console.log(`✓ Saved ${filepath}`);
  }

  await browser.close();
  console.log('\n[Puppeteer] All screenshots captured successfully!');
}

run().catch((err) => {
  console.error('[Puppeteer Error]', err);
  process.exit(1);
});
