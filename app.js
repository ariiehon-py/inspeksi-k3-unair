// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBY1BuHTiTGd4yKkSe-zQuFRcT6UZBKJsg",
    authDomain: "inspeksi-341a8.firebaseapp.com",
    projectId: "inspeksi-341a8",
    storageBucket: "inspeksi-341a8.firebasestorage.app",
    messagingSenderId: "799654508292",
    appId: "1:799654508292:web:8a0c2e95af5076b0088251",
    measurementId: "G-0NF9YZBHK3"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

db.enablePersistence({ synchronizeTabs: true })
  .catch((err) => {
      console.warn("Persistence error:", err.code);
  });

const checklists = {
    apar: [
        "APAR Mudah dilihat dan jelas",
        "Terdapat tanda Lokasi APAR",
        "Tinggi Pemasangan APAR (minimal 50 cm dan maksimal 125 cm)",
        "APAR menggantung dan terdapat bracket/hook gantungan",
        "Kondisi fisik tabung",
        "Pin Pengaman",
        "Label jenis dan petunjuk penggunaan",
        "Tanggal kadaluarsa terbaca jelas",
        "Manometer Normal (Zona Hijau)",
        "Nozzle pada kondisi normal, tidak berdebu, tidak rusak",
        "Hose (selang) pada kondisi normal tidak retak tidak bocor",
        "Kartu inspeksi tersedia dan terisi"
    ],
    detector: [
        "Detektor terpasang dengan baik, tidak terdapat kerusakan fisik",
        "Tidak tertutup debu/cat",
        "LED indikator berfungsi",
        "Kabel dan koneksi baik",
        "Detektor merespon saat diuji",
        "Sinyal diterima panel alarm",
        "Alarm bunyi saat pengujian",
        "Identifikasi/zona jelas",
        "Catatan inspeksi tersedia",
        "Catu daya normal",
        "Sensitivitas detektor baik",
        "Riwayat pemeliharaan tersedia"
    ],
    firealarm: [
        "Panel fire alarm berfungsi normal",
        "Lampu indikator power menyala",
        "Tidak ada indikator trouble",
        "Manual call point (MCP) dapat diakses",
        "MCP berfungsi saat diuji",
        "Bell alarm berbunyi saat pengujian",
        "Strobo lamp berfungsi",
        "Baterai cadangan dalam kondisi baik",
        "Zona alarm teridentifikasi jelas",
        "Catatan inspeksi tersedia"
    ],
    evakuasi: [
        "Mudah dilihat dan jelas",
        "Terdapat tanda jalur evakuasi",
        "Tinggi Pemasangan safety sign rute evakuasi sesuai standar",
        "Warna, gambar, dan arah safety sign rute evakuasi benar",
        "Peta jalur evakuasi tersedia di lokasi",
        "Peta Lokasi APAR tersedia di lokasi"
    ],
    pintudarurat: [
        "Pintu darurat mudah diakses",
        "Tidak ada hambatan di depan pintu",
        "Pintu membuka ke arah aliran evakuasi (outward)",
        "Pintu dapat dibuka tanpa kunci dari dalam",
        "Self-closing device berfungsi",
        "Engsel dan handle berfungsi baik",
        "Rambu EXIT terlihat jelas dan menyala/fluorescent",
        "Pencahayaan darurat (Emergency Light) berfungsi",
        "Pintu tahan api dalam kondisi baik",
        "Terdapat catatan inspeksi berkala",
        "Terbuat dari bahan tahan api standar"
    ],
    tanggadarurat: [
        "Tangga darurat tersedia dan dapat digunakan",
        "Jalur menuju tangga bebas hambatan",
        "Tidak ada barang tersimpan di tangga/bawah tangga",
        "Handrail tersedia dan kokoh",
        "Pintu tangga dapat dibuka dengan mudah",
        "Pencahayaan darurat berfungsi",
        "Rambu EXIT terpasang dan terlihat jelas",
        "Penanda nomor lantai tersedia",
        "Tangga terlindung dari asap dan api (presurisasi/ventilasi)",
        "Terdapat catatan inspeksi berkala"
    ]
};

let aparCount = 0;
let deletedApars = new Set();

const surveyorMap = {
    'neffrety': 'Dr. Neffrety Nilamsari, S.Sos., M.Kes.',
    'herman': 'Herman Bagus Dwicahyo, S.KM., M.KKK.',
    'yunita': 'Yunita Putri Linggarwati, S.KM.',
    'hasan': 'Hasan Sholeh',
    'natasya': 'Natasya Anggraheni Putri',
    'nabila': 'Nabila Eka Agustin',
    'sahda': 'Sahda Regita Cahyani',
    'daninda': 'Daninda Aisya Putri',
    'suryan': 'Suryan Nur Madjid',
    'sam': 'Sam Ramdhani Purnama',
    'rafa': 'Maulana Rafa Ajie Zafira',
    'faizah': 'Faizah Nur Rahmannia',
    'nadha': 'Ngakan Komang Nadha Santika'
};

// View Management
function login(e) {
    e.preventDefault();
    const user = document.getElementById('username').value.toLowerCase().trim();
    const pass = document.getElementById('password').value;
    
    if(surveyorMap[user] && pass === 'k3unair') {
        localStorage.setItem('k3_logged_in', 'true');
        localStorage.setItem('k3_user_id', user);
        localStorage.setItem('k3_user_name', surveyorMap[user]);
        showDashboard();
    } else {
        alert('Username atau password salah! Username = nama panggilan huruf kecil, Password = k3unair');
    }
}

function logout() {
    if(confirm('Yakin ingin keluar?')) {
        localStorage.removeItem('k3_logged_in');
        showLogin();
    }
}

function checkAuth() {
    if(localStorage.getItem('k3_logged_in') === 'true') {
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('login-view').classList.remove('hidden');
    document.getElementById('app-view').classList.add('hidden');
}

let currentDocId = null;

function showDashboard() {
    const userName = localStorage.getItem('k3_user_name') || 'Surveyor';
    const welcomeText = document.getElementById('welcome-text');
    if (welcomeText) welcomeText.innerText = `Hi, ${userName}!`;

    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('app-view').classList.remove('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');
    document.getElementById('form-view').classList.add('hidden');
    document.getElementById('riwayat-view').classList.add('hidden');
    document.getElementById('statistik-view').classList.add('hidden');
    window.scrollTo(0, 0);
    updateDashboardOverview();
}

function startNewInspection() {
    document.getElementById('inspection-form').reset();
    currentDocId = null;
    
    const savedName = localStorage.getItem('k3_user_name');
    if (savedName) {
        document.getElementById('input-surveyor').value = savedName;
    }
    
    document.getElementById('apar-container').innerHTML = '';
    aparCount = 0;
    deletedApars.clear();
    
    renderSurveyorDropdown();
    
    // Clear Quill editors
    if (window.quillEditors) {
        for (let key in window.quillEditors) {
            window.quillEditors[key].root.innerHTML = '';
        }
    }
    
    addApar();
    startInspection();
}

function renderSurveyorDropdown() {
    const select = document.getElementById('surveyor-dropdown');
    if (!select) return;
    
    // Reset options except the first one
    select.innerHTML = '<option value="">-- Tambah Rekan Surveyor --</option>';
    
    const currentUser = localStorage.getItem('k3_user_name') || '';
    
    Object.values(surveyorMap).forEach(name => {
        if (name === currentUser) return;
        const opt = document.createElement('option');
        opt.value = name;
        opt.innerText = name;
        select.appendChild(opt);
    });
}

function addSurveyorFromDropdown(selectEl) {
    const name = selectEl.value;
    if (!name) return;
    
    const input = document.getElementById('input-surveyor');
    let currentVal = input.value.trim();
    
    if (currentVal && !currentVal.includes(name)) {
        input.value = currentVal + ', ' + name;
    } else if (!currentVal) {
        input.value = name;
    }
    
    // Reset selection back to default
    selectEl.value = '';
}

function getMissingFields(data) {
    const missing = [];
    if (!data.fakultas) missing.push("Fakultas");
    if (!data.lokasi) missing.push("Lokasi");
    if (!data.tanggal) missing.push("Tanggal");
    if (!data.surveyor) missing.push("Surveyor");
    
    let aparMissing = false;
    for (let i = 1; i <= data.aparCount; i++) {
        if (data.deletedApars && data.deletedApars.includes(i)) continue;
        checklists.apar.forEach((_, idx) => {
            if (!data[`apar_${i}_item_${idx}_status`]) aparMissing = true;
        });
    }
    if (aparMissing) missing.push("APAR");
    
    const pasifSections = [
        { key: 'detector', name: 'Detektor', cb: 'no_detector' },
        { key: 'firealarm', name: 'Fire Alarm', cb: 'no_firealarm' },
        { key: 'evakuasi', name: 'Evakuasi', cb: 'no_evakuasi' },
        { key: 'pintudarurat', name: 'Pintu Darurat', cb: 'no_pintu' },
        { key: 'tanggadarurat', name: 'Tangga Darurat', cb: 'no_tangga' }
    ];
    
    pasifSections.forEach(sec => {
        if (data[sec.cb] !== '1') {
            let secMissing = false;
            checklists[sec.key].forEach((_, idx) => {
                if (!data[`${sec.key}_${idx}_status`]) secMissing = true;
            });
            if (secMissing) missing.push(sec.name);
        }
    });
    
    return missing;
}

let dashboardChartInstance = null;

async function updateDashboardOverview() {
    const reports = await getReports();
    
    const finalReports = reports.filter(r => r.status === 'final' || !r.status);
    const draftReports = reports.filter(r => r.status === 'draft');
    
    document.getElementById('dash-tot-laporan').innerText = finalReports.length;
    document.getElementById('dash-tot-draf').innerText = draftReports.length;
    
    let totalApar = 0;
    const fakultasSet = new Set();
    const statsByFak = {};

    finalReports.forEach(r => {
        if(r.fakultas) fakultasSet.add(r.fakultas);
        
        for(let i=1; i<=r.aparCount; i++) {
            if(!r.deletedApars || !r.deletedApars.includes(i)) {
                totalApar++;
            }
        }
        
        const fak = r.fakultas || 'Lainnya';
        if(!statsByFak[fak]) statsByFak[fak] = { sesuai: 0, total: 0 };
        
        for(let i=1; i<=r.aparCount; i++) {
            if(r.deletedApars && r.deletedApars.includes(i)) continue;
            checklists.apar.forEach((_, idx) => {
                const status = r[`apar_${i}_item_${idx}_status`];
                if(status) {
                    statsByFak[fak].total++;
                    if(status === 'Sesuai') statsByFak[fak].sesuai++;
                }
            });
        }
        
        const countPassive = (prefix, list) => {
            if(r[`no_${prefix}`] === '1') return;
            list.forEach((_, idx) => {
                const status = r[`${prefix}_${idx}_status`];
                if(status) {
                    statsByFak[fak].total++;
                    if(status === 'Sesuai') statsByFak[fak].sesuai++;
                }
            });
        };
        countPassive('detector', checklists.detector);
        countPassive('firealarm', checklists.firealarm);
        countPassive('evakuasi', checklists.evakuasi);
        countPassive('pintudarurat', checklists.pintudarurat);
        countPassive('tanggadarurat', checklists.tanggadarurat);
    });
    
    document.getElementById('dash-tot-fakultas').innerText = fakultasSet.size;
    document.getElementById('dash-tot-apar').innerText = totalApar;
    
    const labels = [];
    const dataSesuai = [];
    const dataTidakSesuai = [];
    
    for(const fak in statsByFak) {
        labels.push(fak.replace('Fakultas ', '').replace('Sekolah ', ''));
        const s = statsByFak[fak];
        const pct = s.total > 0 ? Math.round((s.sesuai / s.total) * 100) : 0;
        dataSesuai.push(pct);
        dataTidakSesuai.push(100 - pct);
    }
    
    const ctx = document.getElementById('dashboardChart').getContext('2d');
    if(dashboardChartInstance) dashboardChartInstance.destroy();
    
    dashboardChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.length > 0 ? labels : ['Belum Ada Data'],
            datasets: [
                {
                    label: '% Sesuai',
                    data: labels.length > 0 ? dataSesuai : [0],
                    backgroundColor: '#16a34a',
                    borderRadius: 4
                },
                {
                    label: '% Tidak Sesuai',
                    data: labels.length > 0 ? dataTidakSesuai : [0],
                    backgroundColor: '#ef4444',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: true, grid: { display: false } },
                y: { stacked: true, beginAtZero: true, max: 100 }
            },
            plugins: {
                legend: { position: 'top', align: 'end' }
            }
        }
    });
}

function startInspection() {
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('riwayat-view').classList.add('hidden');
    document.getElementById('statistik-view').classList.add('hidden');
    document.getElementById('form-view').classList.remove('hidden');
    window.scrollTo(0, 0);
}

function showRiwayat() {
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('form-view').classList.add('hidden');
    document.getElementById('statistik-view').classList.add('hidden');
    document.getElementById('riwayat-view').classList.remove('hidden');
    window.scrollTo(0, 0);
    renderRiwayat();
}

function showStatistik() {
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('form-view').classList.add('hidden');
    document.getElementById('riwayat-view').classList.add('hidden');
    document.getElementById('statistik-view').classList.remove('hidden');
    window.scrollTo(0, 0);
    renderStatistik();
}


// Initialize application
window.quillEditors = {};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('detector-checklist-container').innerHTML = generateChecklistHTML(checklists.detector, 'detector');
    document.getElementById('firealarm-checklist-container').innerHTML = generateChecklistHTML(checklists.firealarm, 'firealarm');
    document.getElementById('evakuasi-checklist-container').innerHTML = generateChecklistHTML(checklists.evakuasi, 'evakuasi');
    document.getElementById('pintudarurat-checklist-container').innerHTML = generateChecklistHTML(checklists.pintudarurat, 'pintudarurat');
    document.getElementById('tanggadarurat-checklist-container').innerHTML = generateChecklistHTML(checklists.tanggadarurat, 'tanggadarurat');
    
    // Init Quill Editors
    const sections = ['apar', 'detector', 'firealarm', 'evakuasi', 'pintudarurat', 'tanggadarurat'];
    sections.forEach(sec => {
        ['kesimpulan', 'rekomendasi'].forEach(type => {
            const elId = `#editor-${type}-${sec}`;
            if(document.querySelector(elId)) {
                window.quillEditors[`${type}_${sec}`] = new Quill(elId, {
                    theme: 'snow',
                    modules: {
                        imageResize: {
                            displaySize: true
                        },
                        toolbar: [
                            ['bold', 'italic', 'underline'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            ['image']
                        ]
                    }
                });
            }
        });
    });

    loadDraft();
    checkAuth();
});

function generateChecklistHTML(items, prefix) {
    let html = '';
    items.forEach((item, index) => {
        html += `
        <div class="flex flex-col lg:flex-row gap-4 py-6 border-t border-gray-50 w-full items-start">
            <div class="w-full lg:w-1/3 text-sm font-medium text-dark leading-relaxed pr-4">
                ${index + 1}. <span class="text-gray-600 font-normal">${item}</span>
            </div>
            
            <div class="flex flex-wrap items-center gap-4 w-full lg:w-2/3">
                <div class="flex items-center gap-5 shrink-0">
                    <label class="inline-flex items-center cursor-pointer group">
                        <input type="radio" name="${prefix}_${index}_status" value="Sesuai" class="w-5 h-5 border-gray-300 text-primary focus:ring-primary" onchange="autoFillKeterangan(this, \`${item}\`)">
                        <span class="ml-2 text-sm text-gray-700 group-hover:text-dark transition">Sesuai</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer group">
                        <input type="radio" name="${prefix}_${index}_status" value="Tidak Sesuai" class="w-5 h-5 border-gray-300 text-red-600 focus:ring-red-600" onchange="autoFillKeterangan(this, \`${item}\`)">
                        <span class="ml-2 text-sm text-gray-700 group-hover:text-dark transition">Tidak Sesuai</span>
                    </label>
                </div>

                <div class="flex-1 min-w-[150px]">
                    <input type="text" name="${prefix}_${index}_keterangan" oninput="this.removeAttribute('data-auto')" placeholder="Keterangan..." class="w-full px-4 py-2 text-sm border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-primary focus:ring-primary transition shadow-sm">
                </div>

                <div class="w-full sm:w-auto shrink-0 flex flex-col gap-2">
                    <input type="file" name="${prefix}_${index}_foto" accept="image/*" class="w-full max-w-[200px] sm:max-w-xs text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer transition-colors overflow-hidden" onchange="showPreview(this, '${prefix}_${index}_preview')">
                    <img id="${prefix}_${index}_preview" class="hidden w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm" />
                </div>
            </div>
        </div>`;
    });
    return html;
}

function autoFillKeterangan(radio, itemText) {
    const status = radio.value;
    const ketName = radio.name.replace('_status', '_keterangan');
    const ketInput = document.querySelector(`input[name="${ketName}"]`);
    
    if (ketInput && (!ketInput.value || ketInput.dataset.auto === "true")) {
        ketInput.value = generateKeterangan(itemText, status);
        ketInput.dataset.auto = "true";
    }
}

function generateKeterangan(text, status) {
    let t = text.toLowerCase().trim();
    
    if (status === 'Sesuai') {
        if (t.includes("mudah dilihat dan jelas")) return "Kondisi dapat terlihat dengan mudah dan jelas tanpa halangan.";
        if (t.includes("terdapat tanda lokasi")) return "Tanda lokasi terpasang dengan baik dan terlihat jelas.";
        if (t.includes("tinggi pemasangan")) return "Tinggi pemasangan sudah sesuai dengan standar (50 cm - 125 cm).";
        if (t.includes("kondisi fisik tabung")) return "Kondisi fisik tabung dalam keadaan baik, tidak berkarat atau penyok.";
        if (t.includes("pin pengaman")) return "Pin pengaman terpasang dengan baik dan tidak rusak.";
        if (t.includes("label jenis dan petunjuk")) return "Label jenis dan petunjuk penggunaan terbaca dengan jelas.";
        if (t.includes("tanggal kadaluarsa terbaca")) return "Tanggal kadaluarsa terbaca jelas dan belum melewati batas waktu.";
        if (t.includes("manometer normal")) return "Manometer menunjuk pada zona hijau (tekanan normal).";
        if (t.includes("nozzle pada kondisi normal")) return "Nozzle dalam kondisi bersih, tidak tersumbat, dan tidak rusak.";
        if (t.includes("hose (selang) pada kondisi normal")) return "Selang (hose) dalam kondisi baik, tidak retak atau bocor.";
        if (t.includes("kartu inspeksi tersedia")) return "Kartu inspeksi tersedia di lokasi dan telah diisi secara berkala.";
        if (t.includes("terdapat kerusakan fisik")) return "Terpasang dengan baik dan tidak terdapat kerusakan fisik.";
        if (t.includes("tidak tertutup debu")) return "Kondisi bersih, tidak tertutup oleh debu maupun cat.";
        if (t.includes("berfungsi saat diuji")) return "Berfungsi dengan normal saat dilakukan pengujian.";
        if (t.includes("berbunyi saat pengujian")) return "Dapat berbunyi keras dan normal saat dilakukan pengujian.";
        if (t.includes("berfungsi normal") || t.includes("berfungsi dengan baik") || t.includes("berfungsi") || t.includes("menyala")) return "Berfungsi dengan normal dan baik.";
        if (t.includes("tersedia") || t.includes("terpasang") || t.includes("jelas")) return "Kondisi memadai dan terpasang dengan jelas sesuai standar.";
        return `Kondisi ${t} sudah sesuai dengan standar operasional.`;
    } else {
        if (t.includes("mudah dilihat dan jelas")) return "Kondisi terhalang atau tidak dapat terlihat dengan jelas.";
        if (t.includes("terdapat tanda lokasi")) return "Tidak terdapat tanda lokasi yang memadai.";
        if (t.includes("tinggi pemasangan")) return "Tinggi pemasangan tidak sesuai standar (terlalu rendah/tinggi).";
        if (t.includes("kondisi fisik tabung")) return "Terdapat kerusakan fisik pada tabung (karat/penyok/bocor).";
        if (t.includes("pin pengaman")) return "Pin pengaman hilang atau mengalami kerusakan.";
        if (t.includes("label jenis dan petunjuk")) return "Label jenis atau petunjuk penggunaan pudar/hilang/tidak jelas.";
        if (t.includes("tanggal kadaluarsa terbaca")) return "Tanggal kadaluarsa sudah terlewat atau tidak dapat terbaca.";
        if (t.includes("manometer normal")) return "Tekanan tidak normal (manometer tidak menunjuk ke zona hijau).";
        if (t.includes("nozzle pada kondisi normal")) return "Nozzle kotor, tersumbat, atau mengalami kerusakan.";
        if (t.includes("hose (selang) pada kondisi normal")) return "Selang (hose) retak, bocor, atau mengalami kerusakan.";
        if (t.includes("kartu inspeksi tersedia")) return "Kartu inspeksi tidak tersedia atau tidak diisi secara rutin.";
        if (t.includes("terdapat kerusakan fisik")) return "Terdapat indikasi kerusakan fisik pada unit.";
        if (t.includes("tidak tertutup debu")) return "Kondisi unit kotor, tertutup debu, atau terkena cipratan cat.";
        if (t.includes("berfungsi saat diuji")) return "Tidak berfungsi atau tidak merespon saat dilakukan pengujian.";
        if (t.includes("berbunyi saat pengujian")) return "Tidak mengeluarkan bunyi saat dilakukan pengujian.";
        if (t.includes("berfungsi normal") || t.includes("berfungsi dengan baik") || t.includes("berfungsi") || t.includes("menyala")) return "Ditemukan malfungsi atau tidak berfungsi dengan semestinya.";
        if (t.includes("tersedia") || t.includes("terpasang") || t.includes("jelas")) return "Kondisi tidak memadai, tidak terpasang, atau tidak terbaca jelas.";
        return `Kondisi ${t} ditemukan belum sesuai atau bermasalah.`;
    }
}

function addApar() {
    aparCount++;
    const container = document.getElementById('apar-container');
    const div = document.createElement('div');
    div.id = `apar_card_${aparCount}`;
    div.className = "bg-white p-6 md:p-8 rounded-2xl border border-gray-200 mb-6 relative group";
    
    let checklistHTML = '';
    checklists.apar.forEach((item, index) => {
        checklistHTML += `
        <div class="flex flex-col lg:flex-row gap-4 py-6 border-t border-gray-50 w-full items-start">
            <div class="w-full lg:w-1/3 text-sm font-medium text-dark leading-relaxed pr-4">
                ${index + 1}. <span class="text-gray-600 font-normal">${item}</span>
            </div>
            
            <div class="flex flex-wrap items-center gap-4 w-full lg:w-2/3">
                <div class="flex items-center gap-5 shrink-0">
                    <label class="inline-flex items-center cursor-pointer group">
                        <input type="radio" name="apar_${aparCount}_item_${index}_status" value="Sesuai" class="w-5 h-5 border-gray-300 text-primary focus:ring-primary" onchange="updateAparScore(${aparCount}); autoFillKeterangan(this, \`${item}\`)">
                        <span class="ml-2 text-sm text-gray-700 group-hover:text-dark transition">Sesuai</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer group">
                        <input type="radio" name="apar_${aparCount}_item_${index}_status" value="Tidak Sesuai" class="w-5 h-5 border-gray-300 text-red-600 focus:ring-red-600" onchange="updateAparScore(${aparCount}); autoFillKeterangan(this, \`${item}\`)">
                        <span class="ml-2 text-sm text-gray-700 group-hover:text-dark transition">Tidak Sesuai</span>
                    </label>
                </div>

                <div class="flex-1 min-w-[150px]">
                    <input type="text" name="apar_${aparCount}_item_${index}_keterangan" oninput="this.removeAttribute('data-auto')" placeholder="Keterangan..." class="w-full px-4 py-2 text-sm border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-primary focus:ring-primary transition shadow-sm">
                </div>

                <div class="w-full sm:w-auto shrink-0 flex flex-col gap-2">
                    <input type="file" name="apar_${aparCount}_item_${index}_foto" accept="image/*" class="w-full max-w-[200px] sm:max-w-xs text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer transition-colors overflow-hidden" onchange="showPreview(this, 'apar_${aparCount}_item_${index}_preview')">
                    <img id="apar_${aparCount}_item_${index}_preview" class="hidden w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm" />
                </div>
            </div>
        </div>`;
    });

    div.innerHTML = `
        <button type="button" onclick="removeApar(${aparCount})" class="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors" title="Hapus APAR">
            <i class="fa-solid fa-trash-can text-2xl"></i>
        </button>
        <h3 class="text-xl font-bold text-dark mb-6 flex items-center gap-3">
            <div class="bg-gray-100 p-2 rounded-lg"><i class="fa-solid fa-fire-extinguisher text-primary"></i></div> 
            <span class="apar-card-title">Data APAR</span>
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Nomor APAR</label>
                <input type="text" name="apar_${aparCount}_nomor" class="w-full px-4 py-2 border-gray-300 rounded-xl focus:border-primary focus:ring-primary transition">
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Lokasi Spesifik</label>
                <input type="text" name="apar_${aparCount}_lokasi" class="w-full px-4 py-2 border-gray-300 rounded-xl focus:border-primary focus:ring-primary transition">
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Media APAR</label>
                <select name="apar_${aparCount}_media" class="w-full px-4 py-2 border-gray-300 rounded-xl focus:border-primary focus:ring-primary transition">
                    <option value="">Pilih Media...</option>
                    <option value="Water">Water</option>
                    <option value="Foam">Foam</option>
                    <option value="Powder">Dry Chemical Powder</option>
                    <option value="CO2">CO2</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Kapasitas (Kg)</label>
                <input type="number" step="any" name="apar_${aparCount}_kapasitas" class="w-full px-4 py-2 border-gray-300 rounded-xl focus:border-primary focus:ring-primary transition">
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center justify-between">
                    <span>Tgl Produksi (mm/yyyy)</span>
                    <span class="font-normal normal-case opacity-75">(Opsional)</span>
                </label>
                <input type="month" name="apar_${aparCount}_produksi" class="w-full px-4 py-2 border-gray-300 rounded-xl focus:border-primary focus:ring-primary transition">
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center justify-between">
                    <span>Tgl Kadaluarsa <span class="font-normal normal-case opacity-75">(dd/mm/yyyy)</span></span>
                    <span class="font-normal normal-case opacity-75">(Opsional)</span>
                </label>
                <input type="date" name="apar_${aparCount}_kadaluarsa" class="w-full px-4 py-2 border-gray-300 rounded-xl focus:border-primary focus:ring-primary transition">
            </div>
        </div>

        <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between bg-green-50 p-6 rounded-2xl border border-green-100">
            <span class="font-bold text-green-800 text-lg">Tingkat Kesesuaian APAR:</span>
            <span class="text-4xl font-black text-gray-400 mt-2 sm:mt-0" id="apar_${aparCount}_score">0%</span>
        </div>

        <div class="space-y-0">
            ${checklistHTML}
        </div>
    `;
    container.appendChild(div);
    reindexApar();
}

function removeApar(index) {
    if(confirm('Yakin ingin menghapus data APAR ini?')) {
        const el = document.getElementById(`apar_card_${index}`);
        if(el) {
            el.remove();
            deletedApars.add(index);
            reindexApar();
        }
    }
}

function reindexApar() {
    const titles = document.querySelectorAll('.apar-card-title');
    titles.forEach((el, idx) => {
        el.innerText = `Data APAR #${idx + 1}`;
    });
}

function updateAparScore(index) {
    const totalItems = checklists.apar.length;
    let sesuaiCount = 0;
    for (let i = 0; i < totalItems; i++) {
        const radio = document.querySelector(`input[name="apar_${index}_item_${i}_status"]:checked`);
        if (radio && radio.value === 'Sesuai') {
            sesuaiCount++;
        }
    }
    const percentage = Math.round((sesuaiCount / totalItems) * 100);
    const scoreEl = document.getElementById(`apar_${index}_score`);
    if (scoreEl) {
        scoreEl.innerText = `${percentage}%`;
        if (percentage < 50) {
            scoreEl.className = 'text-4xl font-black text-red-600 mt-2 sm:mt-0';
        } else if (percentage < 80) {
            scoreEl.className = 'text-4xl font-black text-yellow-500 mt-2 sm:mt-0';
        } else {
            scoreEl.className = 'text-4xl font-black text-primary mt-2 sm:mt-0';
        }
    }
}

function toggleSection(cbId, containerId) {
    const cb = document.getElementById(cbId);
    const container = document.getElementById(containerId);
    if (cb && cb.checked) {
        container.style.display = 'none';
    } else if (container) {
        container.style.display = 'block';
    }
}

// Removed obsolete toggleRekomendasi functions

function showPreview(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 600;
                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Kompres menjadi JPEG 60% agar muat di database
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                preview.src = dataUrl;
                preview.classList.remove('hidden');
            };
            img.src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.src = '';
        preview.classList.add('hidden');
    }
}

let isSaving = false;

async function saveToFirestore(statusStr, showAlert = true) {
    if (isSaving) return false;
    
    syncQuillToInputs();
    const form = document.getElementById('inspection-form');
    
    if (statusStr === 'final') {
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }
    }
    
    isSaving = true;
    const btnSave = document.getElementById('btn-save');
    
    if (btnSave) { btnSave.disabled = true; btnSave.innerHTML = 'Menyimpan...'; }
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    for (let key in data) {
        if (data[key] instanceof File) {
            const previewId = key.replace('_foto', '_preview');
            const previewImg = document.getElementById(previewId);
            if (previewImg && previewImg.src && previewImg.src.startsWith('data:image')) {
                data[key + '_base64'] = previewImg.src; // Simpan versi terkompresi
            }
            delete data[key];
        }
    }
    
    data.aparCount = aparCount;
    data.deletedApars = Array.from(deletedApars);
    data.status = statusStr;
    
    // Jangan menimpa report_id jika sudah ada, buat baru HANYA JIKA belum punya ID (inspeksi baru)
    if (!currentDocId || !data.report_id) {
        data.report_id = Date.now().toString();
    }
    
    try {
        let docRef;
        if(currentDocId) {
            docRef = db.collection('reports').doc(currentDocId);
        } else {
            docRef = db.collection('reports').doc();
            currentDocId = docRef.id;
        }
        
        // Simpan ke database (berkat enablePersistence, ini akan otomatis masuk cache lokal dan tersinkron ke server di background tanpa loading lama!)
        docRef.set(data, {merge: true}).catch(err => console.error("Background sync error:", err));
        
        if(showAlert) {
            alert('Data berhasil diamankan! ✅\\n\\n(Jika sinyal Anda sedang jelek, data sudah tersimpan di memori HP dan akan otomatis terkirim ke server begitu sinyal stabil. Anda aman untuk lanjut!)');
        }
        return true;
    } catch(err) {
        console.error("Error saving report: ", err);
        if(showAlert) alert('Wah, terjadi kendala pada sistem. Tapi tenang, data Anda MASIH ADA di layar ini, jangan di-refresh ya!');
        return false;
    } finally {
        isSaving = false;
        if (btnSave) { btnSave.disabled = false; btnSave.innerHTML = 'Simpan Data'; }
    }
}

async function saveDraft() {
    await saveToFirestore('draft', true);
}

function loadDraft() {
    // Dipanggil hanya jika tidak ada draft (Inspeksi Baru)
    addApar();
}

function resetForm() {
    if(confirm('Yakin ingin mereset seluruh isian form? (Jika ini Draf tersimpan, Anda tidak akan menghapusnya dari server, hanya mengosongkan layar).')) {
        document.getElementById('inspection-form').reset();
        document.getElementById('apar-container').innerHTML = '';
        aparCount = 0;
        deletedApars.clear();
        
        toggleAparRekomendasi();
        togglePasifRekomendasi();
        window.scrollTo(0, 0);
    }
}

function syncQuillToInputs() {
    if(window.quillEditors) {
        for(const key in window.quillEditors) {
            const el = document.getElementById(`input-${key.replace('_', '-')}`);
            if(el) {
                el.value = window.quillEditors[key].root.innerHTML;
            }
        }
    }
}

async function exportPDF(skipSave = false) {
    const form = document.getElementById('inspection-form');
    syncQuillToInputs();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!skipSave) {
        const btn = document.getElementById('btn-export');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Menyimpan...';
        btn.disabled = true;
        
        await saveToFirestore('final', false);
        
        btn.innerHTML = originalText;
        btn.disabled = false;
    }

    const html = getReportHTML(data);
    
    let printContainer = document.getElementById('print-container');
    if (!printContainer) {
        printContainer = document.createElement('div');
        printContainer.id = 'print-container';
        document.body.appendChild(printContainer);
    }
    
    // Inject final html with styles
    printContainer.innerHTML = `
        <style>
            .ql-align-center { text-align: center; }
            .ql-align-right { text-align: right; }
            .ql-align-justify { text-align: justify; }
            ol { list-style-type: decimal; padding-left: 20px; }
            ul { list-style-type: disc; padding-left: 20px; }
            li { margin-bottom: 5px; }
            img { max-width: 100%; height: auto; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        </style>
        ${html}
    `;
    
    let printStyle = document.getElementById('print-style-global');
    if (!printStyle) {
        printStyle = document.createElement('style');
        printStyle.id = 'print-style-global';
        printStyle.innerHTML = `
            #print-container {
                display: none;
            }
            @media print {
                body > *:not(#print-container) {
                    display: none !important;
                }
                #print-container {
                    display: block !important;
                    width: 100%;
                    background: white;
                    color: black;
                    margin: 0;
                    padding: 0;
                }
                @page {
                    size: A4 portrait;
                    margin: 15mm;
                }
            }
        `;
        document.head.appendChild(printStyle);
    }
    
    // Set title for PDF filename
    const originalTitle = document.title;
    document.title = `Laporan_Inspeksi_K3_${data.fakultas ? data.fakultas : 'Draf'}_${data.tanggal || 'Date'}`;
    
    // Wait for images to load
    const images = printContainer.getElementsByTagName('img');
    const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    });
    
    // Show loading state if called from preview
    const btnPreview = document.querySelector('#preview-modal button');
    let originalPreviewBtn = '';
    if (skipSave && btnPreview) {
        originalPreviewBtn = btnPreview.innerHTML;
        btnPreview.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Menyiapkan Dokumen...';
        btnPreview.disabled = true;
    }

    await Promise.all(imagePromises);
    
    setTimeout(() => {
        window.print();
        document.title = originalTitle;
        if (skipSave && btnPreview) {
            btnPreview.innerHTML = originalPreviewBtn;
            btnPreview.disabled = false;
        }
    }, 500);
}

function previewReport() {
    const form = document.getElementById('inspection-form');
    syncQuillToInputs();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const html = getReportHTML(data);
    
    document.getElementById('preview-paper').innerHTML = html;
    document.getElementById('preview-modal').classList.remove('hidden');
}

function downloadFromPreview() {
    exportPDF(true);
}

function getReportHTML(data) {
    let formattedDate = '-';
    if(data.tanggal) {
        const parts = data.tanggal.split('-');
        if(parts.length === 3) formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        else formattedDate = data.tanggal;
    }

    const formatAparDate = (d) => {
        if(!d) return 'N/A';
        const pts = d.split('-');
        if(pts.length === 3) return `${pts[2]}/${pts[1]}/${pts[0]}`;
        if(pts.length === 2) return `${pts[1]}/${pts[0]}`;
        return d;
    };

    let html = `
    <style>
        .report-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .report-table th, .report-table td { border: 1px solid #000; padding: 6px; }
        .report-table th { text-align: center; }
    </style>
    <div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000; line-height: 1.5;">`;

    // 1. APAR
    for(let i=1; i<=aparCount; i++) {
        if(deletedApars.has(i)) continue;
        
        let sesuaiCount = 0;
        let totalCount = 0;
        let checklistRows = '';
        
        checklists.apar.forEach((item, idx) => {
            const status = data[`apar_${i}_item_${idx}_status`] || '';
            const ket = data[`apar_${i}_item_${idx}_keterangan`] || '';
            const isSesuai = status === 'Sesuai';
            const isTidak = status === 'Tidak Sesuai';
            if(status) totalCount++;
            if(isSesuai) sesuaiCount++;
            
            let imgHtml = '';
            const previewId = `apar_${i}_item_${idx}_preview`;
            const previewImg = document.getElementById(previewId);
            if (previewImg && previewImg.src && previewImg.src.startsWith('data:image')) {
                imgHtml = `<img src="${previewImg.src}" style="max-height: 80px; width: auto; border-radius: 4px; display: block; margin: 0 auto;" />`;
            } else if (data[`apar_${i}_item_${idx}_foto_base64`]) {
                imgHtml = `<img src="${data[`apar_${i}_item_${idx}_foto_base64`]}" style="max-height: 80px; width: auto; border-radius: 4px; display: block; margin: 0 auto;" />`;
            }
            
            checklistRows += `
            <tr>
                <td style="text-align:center;">${idx+1}.</td>
                <td>${item}</td>
                <td style="text-align:center;">${isSesuai ? '✓' : ''}</td>
                <td style="text-align:center;">${isTidak ? '✓' : ''}</td>
                <td>${ket}</td>
                <td style="text-align:center;">${imgHtml}</td>
            </tr>`;
        });
        
        const pct = totalCount > 0 ? ((sesuaiCount/totalCount)*100).toFixed(1) + '%' : '0%';

        html += `
        <div style="page-break-after: always; margin-bottom: 30px;">
            <table class="report-table">
                <tr><td colspan="2" style="text-align: center; font-weight: bold;">FORM HASIL INSPEKSI APAR</td></tr>
                <tr><td style="width: 30%;"><b>Lokasi</b></td><td>${data.lokasi || '-'}</td></tr>
                <tr><td><b>Nomor APAR</b></td><td>${data[`apar_${i}_nomor`] || 'N/A'}</td></tr>
                <tr><td><b>Media APAR</b></td><td>${data[`apar_${i}_media`] || 'N/A'}</td></tr>
                <tr><td><b>Kapasitas</b></td><td>${data[`apar_${i}_kapasitas`] ? data[`apar_${i}_kapasitas`] + ' kg' : 'N/A'}</td></tr>
                <tr><td><b>Tahun Produksi Tabung APAR</b></td><td>${formatAparDate(data[`apar_${i}_produksi`])}</td></tr>
                <tr><td><b>Tanggal Inspeksi</b></td><td>${formattedDate}</td></tr>
                <tr><td><b>Tanggal Kadaluarsa</b></td><td>${formatAparDate(data[`apar_${i}_kadaluarsa`])}</td></tr>
            </table>

            <table class="report-table">
                <tr>
                    <th rowspan="2">No</th>
                    <th rowspan="2">Bagian</th>
                    <th colspan="2">Kesesuaian APAR</th>
                    <th rowspan="2">Keterangan</th>
                    <th rowspan="2">Dokumentasi</th>
                </tr>
                <tr>
                    <th>Sesuai</th>
                    <th>Tidak Sesuai</th>
                </tr>
                ${checklistRows}
                <tr>
                    <td colspan="2" style="font-weight:bold;">Persentase Kesesuaian<br>Pemasangan APAR</td>
                    <td colspan="4" style="font-weight:bold;">${pct}</td>
                </tr>
            </table>
        </div>`;
    }

    // Add global APAR conclusion if exists
    if(data.kesimpulan_apar || data.rekomendasi_apar) {
        html += `<div style="page-break-after: always; padding-top: 20px; margin-bottom: 30px;">`;
        if(data.kesimpulan_apar) {
            html += `<p style="font-weight:bold; margin-bottom:10px;">Kesimpulan hasil Inspeksi APAR:</p><div style="margin-bottom:20px; padding-left:20px;">${data.kesimpulan_apar}</div>`;
        }
        if(data.rekomendasi_apar) {
            html += `<p style="font-weight:bold; margin-bottom:10px;">Rekomendasi APAR:</p><div style="margin-bottom:20px; padding-left:20px;">${data.rekomendasi_apar}</div>`;
        }
        html += `</div>`;
    }

    // 2. PASSIVES
    const buildPassiveSection = (prefix, title, desc, list, hasHeaderTable) => {
        if(data[`no_${prefix}`] === '1') return;

        html += `<div style="page-break-after: always; margin-bottom: 30px;">`;
        if(hasHeaderTable) {
            html += `<div style="text-align: center; font-weight: bold; margin-bottom: 20px;">HASIL INSPEKSI PROTEKSI PASIF</div>`;
            html += `<table class="report-table">
                <tr><td colspan="2" style="text-align: center; font-weight: bold;">${title}</td></tr>
                <tr><td style="width: 30%;"><b>Lokasi</b></td><td>${data.lokasi || '-'}</td></tr>
                <tr><td><b>Tanggal Inspeksi</b></td><td>${formattedDate}</td></tr>
            </table>`;
            if(desc) html += `<p style="margin-bottom: 10px;">${desc}</p>`;
        } else {
            html += `<div style="text-align: center; font-weight: bold; margin-bottom: 20px;">${title}</div>`;
            if(desc) html += `<p style="margin-bottom: 20px; text-align: justify;">${desc}</p>`;
        }

        html += `<table class="report-table">`;
        
        let aspectCol = prefix === 'detector' ? 'Aspek yang Diperiksa' : 'Item Pemeriksaan';
        if(prefix === 'evakuasi') aspectCol = 'Bagian/indikator';

        html += `
        <tr>
            ${prefix === 'evakuasi' ? '' : '<th>No</th>'}
            <th>${aspectCol}</th>
            <th>Sesuai</th>
            <th>Tidak Sesuai</th>
            <th>Keterangan</th>
            <th>Dokumentasi</th>
        </tr>`;

        list.forEach((item, idx) => {
            const status = data[`${prefix}_${idx}_status`] || '';
            const ket = data[`${prefix}_${idx}_keterangan`] || '';
            const numStr = prefix === 'evakuasi' ? String.fromCharCode(97 + idx) + '.' : (idx + 1);
            
            let imgHtml = '';
            const previewId = `${prefix}_${idx}_preview`;
            const previewImg = document.getElementById(previewId);
            if (previewImg && previewImg.src && previewImg.src.startsWith('data:image')) {
                imgHtml = `<img src="${previewImg.src}" style="max-height: 80px; width: auto; border-radius: 4px; display: block; margin: 0 auto;" />`;
            } else if (data[`${prefix}_${idx}_foto_base64`]) {
                imgHtml = `<img src="${data[`${prefix}_${idx}_foto_base64`]}" style="max-height: 80px; width: auto; border-radius: 4px; display: block; margin: 0 auto;" />`;
            }

            html += `
            <tr>
                ${prefix === 'evakuasi' ? '' : `<td style="text-align:center;">${numStr}</td>`}
                <td>${prefix === 'evakuasi' ? numStr + ' ' : ''}${item}</td>
                <td style="text-align:center;">${status==='Sesuai'?'✓':''}</td>
                <td style="text-align:center;">${status==='Tidak Sesuai'?'✓':''}</td>
                <td>${ket}</td>
                <td style="text-align:center;">${imgHtml}</td>
            </tr>`;
        });
        html += `</table>`;

        const kesimpulan = data[`kesimpulan_${prefix}`];
        const rekomendasi = data[`rekomendasi_${prefix}`];
        if(kesimpulan || rekomendasi) {
            html += `<div style="margin-top: 20px;">`;
            if(kesimpulan) {
                html += `<p style="font-weight:bold; margin-bottom:10px;">Kesimpulan hasil Inspeksi:</p><div style="margin-bottom:20px; padding-left: 20px;">${kesimpulan}</div>`;
            }
            if(rekomendasi) {
                html += `<p style="font-weight:bold; margin-bottom:10px;">Rekomendasi:</p><div style="margin-bottom:20px; padding-left: 20px;">${rekomendasi}</div>`;
            }
            html += `</div>`;
        }
        html += `</div>`;
    };

    buildPassiveSection('evakuasi', 'FORM HASIL INSPEKSI JALUR EVAKUASI/ PINTU DARURAT/ TANGGA DARURAT/PETA APAR/ PETA JALUR EVAKUASI', 'Kesesuaian jalur evakuasi dan safety sign :', checklists.evakuasi, true);
    buildPassiveSection('detector', 'DETEKTOR', 'Indikator pemeriksaan detektor kebakaran (smoke detector/heat detector) sesuai peraturan dan standar yang berlaku di Indonesia, maka acuan utamanya adalah SNI 03-3985-2000 tentang tata cara perencanaan, pemasangan, pengujian, dan pemeliharaan sistem deteksi dan alarm kebakaran serta Permen PUPR No. 26/PRT/M/2008 tentang Persyaratan Teknis Sistem Proteksi Kebakaran pada Bangunan Gedung.', checklists.detector, false);
    buildPassiveSection('firealarm', 'FIRE ALARM', 'Indikator pemeriksaan Fire Alarm (Sistem Alarm Kebakaran) mengacu pada SNI 03-3985-2000 tentang Tata Cara Perencanaan, Pemasangan, Pengujian, dan Pemeliharaan Sistem Deteksi dan Alarm Kebakaran, Permen PUPR No. 26/PRT/M/2008, serta Permenaker No. PER.04/MEN/1980 tentang Syarat-Syarat Pemasangan dan Pemeliharaan APAR yang secara umum mengatur sistem proteksi kebakaran di tempat kerja.', checklists.firealarm, false);
    buildPassiveSection('pintudarurat', 'PINTU DARURAT', 'Indikator pemeriksaan pintu darurat (emergency exit door) dapat mengacu pada Permen PUPR No. 26/PRT/M/2008 tentang Persyaratan Teknis Sistem Proteksi Kebakaran pada Bangunan Gedung dan Lingkungan, SNI 03-1746-2000 tentang Tata Cara Perencanaan dan Pemasangan Sarana Jalan Keluar untuk Penyelamatan terhadap Bahaya Kebakaran pada Bangunan Gedung', checklists.pintudarurat, false);
    buildPassiveSection('tanggadarurat', 'TANGGA DARURAT', 'Indikator pemeriksaan tangga darurat dapat disusun berdasarkan Permen PU No. 26/PRT/M/2008 tentang Persyaratan Teknis Sistem Proteksi Kebakaran pada Bangunan Gedung dan Lingkungan serta SNI 03-1746-2000 tentang Sarana Jalan Keluar.', checklists.tanggadarurat, false);

    html += `</div>`;
    return html;
}

// ----------------- HISTORY & STATS LOGIC -----------------

async function getReports() {
    try {
        const snapshot = await db.collection('reports').get();
        const reports = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id; // doc id from firestore
            reports.push(data);
        });
        return reports;
    } catch(err) {
        console.error("Error getting reports: ", err);
        return [];
    }
}

async function saveReport(showAlert = true) {
    await saveToFirestore('final', showAlert);
}

async function saveReportAndAlert() {
    await saveReport(true);
}

let riwayatReportsCache = [];

async function renderRiwayat() {
    const container = document.getElementById('riwayat-container');
    const emptyState = document.getElementById('riwayat-empty');
    
    container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-10"><i class="fa-solid fa-spinner fa-spin text-3xl"></i><p class="mt-2">Memuat data dari Firebase...</p></div>';
    emptyState.classList.add('hidden');
    container.classList.remove('hidden');

    riwayatReportsCache = await getReports();
    
    const select = document.getElementById('filter-fakultas');
    if (select) {
        const currentVal = select.value;
        const fakSet = new Set();
        riwayatReportsCache.forEach(r => {
            if (r.fakultas) fakSet.add(r.fakultas);
        });
        select.innerHTML = '<option value="">Semua Fakultas</option>';
        Array.from(fakSet).sort().forEach(f => {
            const opt = document.createElement('option');
            opt.value = f;
            opt.innerText = f;
            select.appendChild(opt);
        });
        select.value = currentVal;
    }
    
    applyRiwayatFilter();
}

function applyRiwayatFilter() {
    const container = document.getElementById('riwayat-container');
    const emptyState = document.getElementById('riwayat-empty');
    const filterValue = document.getElementById('filter-fakultas') ? document.getElementById('filter-fakultas').value : '';
    
    let reports = [...riwayatReportsCache];
    if (filterValue) {
        reports = reports.filter(r => r.fakultas === filterValue);
    }
    
    container.innerHTML = '';
    
    if(reports.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    // Sort descending by id (timestamp)
    reports.sort((a, b) => b.report_id - a.report_id);
    
    reports.forEach(report => {
        const isDraft = report.status === 'draft';
        const missing = isDraft ? getMissingFields(report) : [];
        const missingText = missing.length > 0 ? `<p class="text-xs font-bold text-red-500 mt-2"><i class="fa-solid fa-triangle-exclamation"></i> Belum diisi: ${missing.join(', ')}</p>` : '';
        
        const div = document.createElement('div');
        div.className = "bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition relative";
        if (isDraft) {
            div.classList.add('border-orange-300', 'bg-orange-50/30');
        }
        
        div.innerHTML = `
            ${isDraft ? '<div class="absolute top-0 right-0 bg-orange-100 text-orange-600 text-xs font-black px-3 py-1 rounded-bl-xl rounded-tr-xl">DRAF</div>' : ''}
            <div class="flex justify-between items-start mb-4">
                <div class="${isDraft ? 'bg-orange-100' : 'bg-green-50 text-green-600'} text-orange-600 p-2 rounded-lg">
                    <i class="fa-solid ${isDraft ? 'fa-file-pen' : 'fa-file-contract'}"></i>
                </div>
                <span class="text-xs font-bold text-gray-400 mt-1 mr-8">${new Date(parseInt(report.report_id)).toLocaleDateString('id-ID')}</span>
            </div>
            <h3 class="font-bold text-dark text-lg mb-1 line-clamp-1">${report.fakultas || 'Tanpa Fakultas'}</h3>
            <p class="text-sm text-gray-500 mb-2">${report.lokasi || '-'}</p>
            ${missingText}
            
            <div class="pt-4 mt-4 border-t border-gray-100 flex gap-2">
                <button onclick="loadReport('${report.id}')" class="flex-1 bg-gray-100 hover:bg-gray-200 text-dark py-2 rounded-lg text-sm font-bold transition">
                    Buka Data
                </button>
                <button onclick="deleteReport('${report.id}')" class="px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition" title="Hapus">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        container.appendChild(div);
    });
}

async function loadReport(id) {
    if(!confirm('Data form saat ini akan tertimpa. Lanjutkan?')) return;
    
    const reports = await getReports();
    const data = reports.find(r => r.id === id);
    if(data) {
        currentDocId = id;
        
        document.getElementById('dashboard-view').classList.add('hidden');
        document.getElementById('riwayat-view').classList.add('hidden');
        document.getElementById('statistik-view').classList.add('hidden');
        document.getElementById('form-view').classList.remove('hidden');
        window.scrollTo(0, 0);
        
        document.getElementById('apar-container').innerHTML = '';
        aparCount = 0;
        deletedApars.clear();
        
        if (data.deletedApars) deletedApars = new Set(data.deletedApars);
        if (data.aparCount) {
            for (let i = 1; i <= data.aparCount; i++) {
                if(!deletedApars.has(i)) addApar();
                else aparCount++;
            }
        } else {
            addApar();
        }

        for (const key in data) {
            const element = document.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'radio' || element.type === 'checkbox') {
                    const el = document.querySelector(`[name="${key}"][value="${data[key]}"]`);
                    if(el) el.checked = true;
                } else if (element.type !== 'file') {
                    element.value = data[key];
                }
            }
            
            // Set Quill content
            if (key.startsWith('kesimpulan_') || key.startsWith('rekomendasi_')) {
                if (window.quillEditors && window.quillEditors[key]) {
                    window.quillEditors[key].root.innerHTML = data[key];
                }
            }

            // Restore image previews from base64
            if (key.endsWith('_base64')) {
                const previewId = key.replace('_foto_base64', '_preview');
                const previewImg = document.getElementById(previewId);
                if (previewImg && data[key]) {
                    previewImg.src = data[key];
                    previewImg.classList.remove('hidden');
                }
            }
        }
        
        for(let i=1; i<=aparCount; i++) {
            if(!deletedApars.has(i)) updateAparScore(i);
        }
        
        toggleSection('no-detector-cb', 'detector-checklist-container');
        toggleSection('no-firealarm-cb', 'firealarm-checklist-container');
        toggleSection('no-evakuasi-cb', 'evakuasi-checklist-container');
        toggleSection('no-pintu-cb', 'pintudarurat-checklist-container');
        toggleSection('no-tangga-cb', 'tanggadarurat-checklist-container');
        
        renderSurveyorDropdown();
    }
}

async function deleteReport(id) {
    if(confirm('Yakin ingin menghapus riwayat laporan ini permanen dari Cloud?')) {
        try {
            await db.collection('reports').doc(id).delete();
            renderRiwayat();
        } catch(err) {
            console.error("Error deleting document: ", err);
            alert("Gagal menghapus laporan dari Firebase.");
        }
    }
}

async function renderStatistik() {
    const container = document.getElementById('statistik-container');
    const emptyState = document.getElementById('statistik-empty');
    
    container.innerHTML = '<div class="text-center text-gray-500 py-10"><i class="fa-solid fa-spinner fa-spin text-3xl"></i><p class="mt-2">Memuat statistik dari Firebase...</p></div>';
    emptyState.classList.add('hidden');
    container.classList.remove('hidden');

    const reports = await getReports();    
    container.innerHTML = '';
    if(reports.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    const stats = {};
    
    reports.forEach(report => {
        const fak = report.fakultas || 'Lainnya';
        if(!stats[fak]) {
            stats[fak] = { sesuai: 0, total: 0 };
        }
        
        for(let i=1; i<=report.aparCount; i++) {
            if(report.deletedApars && report.deletedApars.includes(i)) continue;
            checklists.apar.forEach((_, idx) => {
                const status = report[`apar_${i}_item_${idx}_status`];
                if(status) {
                    stats[fak].total++;
                    if(status === 'Sesuai') stats[fak].sesuai++;
                }
            });
        }
        
        const countPassive = (prefix, list) => {
            if(report[`no_${prefix}`] === '1') return;
            list.forEach((_, idx) => {
                const status = report[`${prefix}_${idx}_status`];
                if(status) {
                    stats[fak].total++;
                    if(status === 'Sesuai') stats[fak].sesuai++;
                }
            });
        };
        
        countPassive('detector', checklists.detector);
        countPassive('firealarm', checklists.firealarm);
        countPassive('evakuasi', checklists.evakuasi);
        countPassive('pintudarurat', checklists.pintudarurat);
        countPassive('tanggadarurat', checklists.tanggadarurat);
    });
    
    for(const fak in stats) {
        const s = stats[fak];
        const pct = s.total > 0 ? Math.round((s.sesuai / s.total) * 100) : 0;
        let colorClass = 'bg-primary';
        if(pct < 50) colorClass = 'bg-red-500';
        else if(pct < 80) colorClass = 'bg-yellow-400';
        
        const div = document.createElement('div');
        div.className = "mb-4";
        div.innerHTML = `
            <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-bold text-gray-700">${fak}</span>
                <span class="text-sm font-bold ${pct < 50 ? 'text-red-600' : 'text-gray-700'}">${pct}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-3">
                <div class="${colorClass} h-3 rounded-full transition-all duration-1000" style="width: ${pct}%"></div>
            </div>
            <p class="text-xs text-gray-400 mt-1">${s.sesuai} Sesuai dari total ${s.total} titik inspeksi</p>
        `;
        container.appendChild(div);
    }
}


const GEMINI_API_KEY = "ISI_API_KEY_ANDA";

async function generateWithGemini(section, type) {
    if (GEMINI_API_KEY === "ISI_API_KEY_ANDA") {
        alert("Peringatan: API Key Gemini belum diatur. Buka file app.js dan isi variabel GEMINI_API_KEY di baris paling bawah dengan kunci Anda.");
        return;
    }

    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Memproses...';
    btn.disabled = true;

    try {
        let dataContext = "Data Inspeksi:\n";
        const fakultas = document.querySelector('select[name="fakultas"]').value || 'Fakultas Belum Dipilih';
        const lokasi = document.querySelector('input[name="lokasi"]').value || 'Lokasi Belum Diisi';
        
        dataContext += `Fakultas/Unit: ${fakultas}\nLokasi/Gedung: ${lokasi}\n\n`;

        if (section === 'apar') {
            const aparItems = [];
            for (let i = 1; i <= aparCount; i++) {
                if (deletedApars.has(i)) continue;
                let itemDetails = [];
                for (let j = 0; j < checklists.apar.length; j++) {
                    const status = document.querySelector(`input[name="apar_${i}_item_${j}_status"]:checked`)?.value;
                    const ket = document.querySelector(`input[name="apar_${i}_item_${j}_keterangan"]`)?.value;
                    if (status) itemDetails.push(`- ${checklists.apar[j]}: ${status} (Keterangan: ${ket || '-'}) `);
                }
                aparItems.push(`APAR ${i}:\n${itemDetails.join('\n')}`);
            }
            dataContext += aparItems.join('\n\n');
        } else {
            const items = [];
            for (let j = 0; j < checklists[section].length; j++) {
                const status = document.querySelector(`input[name="${section}_${j}_status"]:checked`)?.value;
                const ket = document.querySelector(`input[name="${section}_${j}_keterangan"]`)?.value;
                if (status) items.push(`- ${checklists[section][j]}: ${status} (Keterangan: ${ket || '-'}) `);
            }
            dataContext += items.join('\n');
        }

        let sysPrompt = `Anda adalah seorang ahli K3 profesional. Berdasarkan Data Inspeksi yang diberikan, buatkan ${type} inspeksi ${section.toUpperCase()} dalam bahasa Indonesia yang baku, profesional, dan to the point.

Format output HARUS menggunakan tag HTML dasar (<ul>, <li>, <p>, <strong>) agar kompatibel dengan rich text editor. JANGAN gunakan tag markdown (```html) dalam respons Anda. Langsung keluarkan HTML murninya.

`;

        if (section === 'apar') {
            if (type === 'kesimpulan') {
                sysPrompt += `CONTOH GAYA BAHASA KESIMPULAN APAR:
<p><strong>Kesimpulan hasil Inspeksi ${lokasi} ${fakultas}:</strong></p>
<p><strong>Jarak antar APAR berdasarkan standar (±15m jangkauan):</strong></p>
<p>Belum sesuai, karena panjang koridor antara APAR No.2 (belakang pintu) dan APAR No.3 (dekat panel) adalah sepanjang kurang lebih 48 m.</p>
<p><strong>Kesesuaian Jumlah APAR:</strong></p>
<p>Belum sesuai, karena jika panjang koridor sepanjang 48m, maka setidaknya memerlukan 3 APAR.</p>
<p><strong>Kesesuaian Jenis APAR dengan potensi bahaya:</strong></p>
<ul>
<li>APAR No.1 (Powder), sesuai karena berfokus untuk memberikan proteksi pada ruang yang berisi dokumen.</li>
<li>APAR No.2 (Liquid Gas) dan APAR 3 (Powder), menukar posisinya karena...</li>
</ul>`;
            } else {
                sysPrompt += `CONTOH GAYA BAHASA REKOMENDASI APAR:
<ul>
<li>Memperbarui denah ruangan dan denah APAR dengan mencantumkan jenis APAR-nya.</li>
<li>Mengganti tanda penunjuk posisi APAR dengan penanda yang telah diatur pada lampiran 1 Permenaker 04/1980.</li>
<li>Mengoreksi pemasangan ketinggian APAR dari lantai menjadi setinggi 120-125 cm dari permukaan lantai.</li>
<li>Memindahkan APAR 4 ke depan ruangan.</li>
<li>Menambahkan 1 APAR jenis powder di koridor pada jarak 15 meter.</li>
</ul>`;
            }
        } else {
            sysPrompt += `Buat kesimpulan/rekomendasi yang terstruktur dan analitis. Jangan terlalu panjang, fokus pada poin-poin krusial yang perlu diperbaiki (jika ada yang Tidak Sesuai). Jika semuanya Sesuai, berikan apresiasi dan sarankan pemeliharaan berkelanjutan.`;
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: sysPrompt + "\n\n" + dataContext }] }]
            })
        });
        
        const resJson = await response.json();
        if (resJson.error) {
            throw new Error(resJson.error.message);
        }
        
        let text = resJson.candidates[0].content.parts[0].text;
        text = text.replace(/```html/gi, '').replace(/```/g, '').trim();
        
        if (window.quillEditors && window.quillEditors[`${type}_${section}`]) {
            window.quillEditors[`${type}_${section}`].root.innerHTML = text;
        }
    } catch(err) {
        console.error(err);
        alert("Gagal generate dengan Gemini AI. Pastikan API Key valid dan koneksi internet stabil. Error: " + err.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}
