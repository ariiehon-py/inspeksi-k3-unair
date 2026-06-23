const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const script = fs.readFileSync('app.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

// Mock Firebase
window.db = {
    collection: () => ({
        get: async () => []
    })
};

// Mock other missing globals
window.checklists = { apar: [], detector: [], firealarm: [], pintudarurat: [], tanggadarurat: [], evakuasi: [] };

try {
    const scriptEl = window.document.createElement("script");
    scriptEl.textContent = script;
    window.document.body.appendChild(scriptEl);
    
    // Test showRiwayat
    window.showRiwayat();
    
    console.log("Dashboard hidden:", window.document.getElementById('dashboard-view').classList.contains('hidden'));
    console.log("Riwayat hidden:", window.document.getElementById('riwayat-view').classList.contains('hidden'));
    console.log("Success! No crashes.");
} catch(e) {
    console.error("Error occurred:", e);
}
