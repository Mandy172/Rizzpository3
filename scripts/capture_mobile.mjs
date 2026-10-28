import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import path from 'path';

const SCREENSHOT_PATH = '/Users/sujaytudu/.gemini/antigravity/brain/a6e1ed7c-19ad-46f5-89a8-89d018bca48f/screenshots/mobile_hero.png';

async function run() {
  console.log('[Mobile Capture] Starting preview server...');
  const server = spawn('npm', ['run', 'preview', '--', '--port', '4173'], {
    cwd: '/Users/sujaytudu/Documents/Open Source',
    stdio: 'pipe',
    env: { ...process.env, PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH}` }
  });

  server.stdout.on('data', (d) => console.log('[Server stdout]', d.toString().trim()));
  server.stderr.on('data', (d) => console.error('[Server stderr]', d.toString().trim()));

  await new Promise((res) => setTimeout(res, 3000));

  console.log('[Puppeteer] Launching mobile emulation (375x812)...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--window-size=375,812',
    ],
    defaultViewport: {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
  });

  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle0', timeout: 30000 });

  console.log('[Puppeteer] Waiting for model to mount and preloader to finish...');
  await new Promise((res) => setTimeout(res, 4000));

  await page.screenshot({ path: SCREENSHOT_PATH });
  console.log('✓ Successfully saved mobile screenshot to:', SCREENSHOT_PATH);

  await browser.close();
  server.kill('SIGTERM');
  process.exit(0);
}

run().catch((err) => {
  console.error('[Error]', err);
  process.exit(1);
});
