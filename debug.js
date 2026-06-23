const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Catch console logs
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    // Load local file
    const fileUrl = 'file://' + path.resolve('index.html');
    await page.goto(fileUrl);
    
    // Wait for the app to load
    await page.waitForTimeout(1000);
    
    console.log("Clicking Riwayat Data...");
    try {
        await page.click('#nav-riwayat');
        await page.waitForTimeout(1000);
        
        // Check if riwayat-view is visible
        const isHidden = await page.$eval('#riwayat-view', el => el.classList.contains('hidden'));
        console.log("Is riwayat-view hidden?", isHidden);
        
        // Check if dashboard-view is hidden
        const isDashHidden = await page.$eval('#dashboard-view', el => el.classList.contains('hidden'));
        console.log("Is dashboard-view hidden?", isDashHidden);
        
    } catch(err) {
        console.error("Failed to click or check:", err);
    }
    
    await browser.close();
})();
