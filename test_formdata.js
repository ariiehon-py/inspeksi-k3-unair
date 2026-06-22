const { JSDOM } = require('jsdom');
const dom = new JSDOM(`<!DOCTYPE html>
<html>
<body>
    <form id="inspection-form">
        <input type="radio" name="detector_0_status" value="Sesuai" checked>
        <input type="radio" name="detector_0_status" value="Tidak Sesuai">
        <input type="text" name="detector_0_keterangan" value="Test Keterangan">
    </form>
</body>
</html>`);

const window = dom.window;
const document = window.document;
const FormData = window.FormData;

const form = document.getElementById('inspection-form');
const formData = new FormData(form);
const data = Object.fromEntries(formData.entries());

console.log(data);
