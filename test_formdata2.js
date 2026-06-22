const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf-8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;
const document = window.document;

// Simulate DOMContentLoaded
const event = document.createEvent('Event');
event.initEvent('DOMContentLoaded', true, true);
document.dispatchEvent(event);

// Check if evakuasi-checklist-container is filled
const evak = document.getElementById('evakuasi-checklist-container');
console.log("Evakuasi container HTML length:", evak.innerHTML.length);

// Simulate user checking a radio button
const radio = document.querySelector('input[name="evakuasi_0_status"][value="Sesuai"]');
if (radio) {
    radio.checked = true;
    console.log("Checked radio:", radio.name);
} else {
    console.log("Radio not found!");
}

// Extract FormData
const form = document.getElementById('inspection-form');
const formData = new window.FormData(form);
const data = Object.fromEntries(formData.entries());

console.log("FormData keys:", Object.keys(data));
console.log("Value for evakuasi_0_status:", data.evakuasi_0_status);
