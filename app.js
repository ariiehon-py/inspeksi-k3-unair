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

// Disable Firebase Persistence agar save lokal sepenuhnya dikendalikan manual
// db.enablePersistence({ synchronizeTabs: true }).catch(err => {
//     console.error("Firebase persistence error:", err.code);
// });

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

let firealarmCount = 0;
let deletedFirealarms = new Set();

let evakuasiCount = 0;
let deletedEvakuasis = new Set();

let pintudaruratCount = 0;
let deletedPintudarurats = new Set();

let tanggadaruratCount = 0;
let deletedTanggadarurats = new Set();

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

function toggleSidebar() {
    if (window.innerWidth >= 768) return; // Do not toggle on desktop
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar || !overlay) return;
    
    if(sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    } else {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }
}

function updateSidebarActive(activeId) {
    const navs = ['nav-dashboard', 'nav-riwayat', 'nav-statistik'];
    navs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === activeId) {
                el.classList.add('bg-gray-100', 'text-gray-900');
                el.classList.remove('text-gray-500', 'hover:bg-gray-50');
                el.querySelector('i').classList.add('text-gray-500');
            } else {
                el.classList.remove('bg-gray-100', 'text-gray-900');
                el.classList.add('text-gray-500', 'hover:bg-gray-50', 'hover:text-gray-900');
                el.querySelector('i').classList.remove('text-gray-500');
            }
        }
    });
}

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
    
    updateSidebarActive('nav-dashboard');
    updateDashboardOverview();
    renderDashboardRiwayat();
}

async function renderDashboardRiwayat() {
    const container = document.getElementById('dashboard-riwayat-list');
    if (!container) return;
    container.innerHTML = '<div class="col-span-full text-center text-gray-400 py-10"><i class="fa-solid fa-spinner fa-spin text-2xl"></i><p class="mt-2 text-sm">Memuat data...</p></div>';
    
    let reports = await getReports();
    reports.sort((a, b) => b.report_id - a.report_id);
    reports = reports.slice(0, 10);
    
    container.innerHTML = '';
    
    if(reports.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-100 border-dashed text-sm">Belum ada riwayat laporan.</div>';
        return;
    }
    
    // Add header row for the list
    container.innerHTML = `
        <div class="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 hidden md:grid">
            <div class="col-span-3">Fakultas</div>
            <div class="col-span-4">Lokasi / Area</div>
            <div class="col-span-2">Tanggal</div>
            <div class="col-span-2">Status</div>
            <div class="col-span-1 text-right">Aksi</div>
        </div>
        <div class="space-y-2" id="dashboard-riwayat-items"></div>
    `;
    
    const listContainer = document.getElementById('dashboard-riwayat-items');
    
    reports.forEach(report => {
        const isDraft = report.status === 'draft';
        const missing = isDraft ? getMissingFields(report) : [];
        const missingCount = missing.length;
        
        const div = document.createElement('div');
        div.className = "bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-sm transition flex flex-col md:grid md:grid-cols-12 gap-4 md:items-center cursor-pointer group";
        div.onclick = () => showRiwayat();
        
        div.innerHTML = `
            <div class="col-span-3 flex items-center gap-3">
                <i class="fa-solid ${isDraft ? 'fa-file-pen text-gray-400' : 'fa-file-contract text-gray-700'}"></i>
                <h3 class="font-bold text-gray-900 text-sm line-clamp-1">${report.fakultas || 'Tanpa Fakultas'}</h3>
            </div>
            <div class="col-span-4 text-sm text-gray-500 line-clamp-1">
                ${report.lokasi || '-'}
            </div>
            <div class="col-span-2 text-xs font-medium text-gray-500">
                ${new Date(parseInt(report.report_id)).toLocaleDateString('id-ID')}
            </div>
            <div class="col-span-2">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${isDraft ? 'bg-gray-100 text-gray-600' : 'bg-gray-900 text-white'}">
                    ${isDraft ? missingCount + ' Incomplete' : 'Selesai'}
                </span>
            </div>
            <div class="col-span-1 flex justify-end">
                <i class="fa-solid fa-arrow-right text-gray-300 group-hover:text-gray-900 transition-colors"></i>
            </div>
        `;
        listContainer.appendChild(div);
    });
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
    
    const labels = [];
    const dataSesuai = [];
    const dataTidakSesuai = [];
    
    let globalSesuai = 0;
    let globalTotal = 0;
    
    for(const fak in statsByFak) {
        labels.push(fak.replace('Fakultas ', '').replace('Sekolah ', ''));
        const s = statsByFak[fak];
        
        globalSesuai += s.sesuai;
        globalTotal += s.total;
        
        dataSesuai.push(s.sesuai);
        dataTidakSesuai.push(s.total - s.sesuai);
    }
    
    // Pattern generation for hatched bars
    const createStripePattern = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 10, 10);
        ctx.strokeStyle = '#d1d5db'; // gray-300
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 10); ctx.lineTo(10, 0);
        ctx.moveTo(-5, 5); ctx.lineTo(5, -5);
        ctx.moveTo(5, 15); ctx.lineTo(15, 5);
        ctx.stroke();
        return ctx.createPattern(canvas, 'repeat');
    };

    const barCtx = document.getElementById('barChart');
    if (barCtx) {
        if(window.dashboardBarChart) window.dashboardBarChart.destroy();
        
        window.dashboardBarChart = new Chart(barCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels.length > 0 ? labels : ['Belum Ada Data'],
                datasets: [
                    {
                        label: 'Sesuai',
                        data: labels.length > 0 ? dataSesuai : [0],
                        backgroundColor: '#111827', // gray-900 (black)
                        borderRadius: 4,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Tidak Sesuai',
                        data: labels.length > 0 ? dataTidakSesuai : [0],
                        backgroundColor: createStripePattern(),
                        borderColor: '#e5e7eb', // gray-200
                        borderWidth: 1,
                        borderRadius: 4,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#111827',
                        padding: 12,
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: { grid: { display: false }, border: { display: false } },
                    y: { border: { display: false }, ticks: { stepSize: 5 } }
                }
            }
        });
    }

    const gaugeCtx = document.getElementById('gaugeChart');
    const gaugePct = document.getElementById('gauge-percentage');
    
    if (gaugeCtx && gaugePct) {
        if(window.dashboardGaugeChart) window.dashboardGaugeChart.destroy();
        
        const pct = globalTotal > 0 ? Math.round((globalSesuai / globalTotal) * 100) : 0;
        gaugePct.innerText = pct + '%';
        
        // Create 50 segments for the gauge
        const segments = 50;
        const ticksData = Array(segments).fill(1);
        const ticksColors = ticksData.map((_, i) => {
            const currentPct = (i / segments) * 100;
            return currentPct < pct ? '#111827' : '#e5e7eb';
        });
        
        window.dashboardGaugeChart = new Chart(gaugeCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ticksData.map(()=>''),
                datasets: [{
                    data: ticksData,
                    backgroundColor: ticksColors,
                    borderWidth: 2,
                    borderColor: '#f9f9f8', // match container background
                    hoverBorderColor: '#f9f9f8',
                    hoverBackgroundColor: ticksColors,
                    circumference: 180,
                    rotation: 270
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '80%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                layout: {
                    padding: { bottom: 10 }
                }
            }
        });
    }
}

function startInspection() {
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('riwayat-view').classList.add('hidden');
    document.getElementById('statistik-view').classList.add('hidden');
    document.getElementById('form-view').classList.remove('hidden');
    window.scrollTo(0, 0);
}

function showRiwayat() {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('app-view').classList.remove('hidden');
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('form-view').classList.add('hidden');
    document.getElementById('riwayat-view').classList.remove('hidden');
    document.getElementById('statistik-view').classList.add('hidden');
    
    updateSidebarActive('nav-riwayat');
    renderRiwayat();
}

function showStatistik() {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('app-view').classList.remove('hidden');
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('form-view').classList.add('hidden');
    document.getElementById('riwayat-view').classList.add('hidden');
    document.getElementById('statistik-view').classList.remove('hidden');
    
    updateSidebarActive('nav-statistik');
    renderStatistik();
}


// Initialize application
window.quillEditors = {};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('detector-checklist-container').innerHTML = generateChecklistHTML(checklists.detector, 'detector');
    
    // Inisialisasi awal 1 card untuk masing-masing pasif dinamis
    addPassiveItem('firealarm', 'Fire Alarm');
    addPassiveItem('evakuasi', 'Jalur Evakuasi');
    addPassiveItem('pintudarurat', 'Pintu Darurat');
    addPassiveItem('tanggadarurat', 'Tangga Darurat');
    
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
                    <input type="file" multiple name="${prefix}_${index}_foto" accept="image/*" class="w-full max-w-[200px] sm:max-w-xs text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer transition-colors overflow-hidden" onchange="showPreviews(this, '${prefix}_${index}_preview_container')">
                    <div id="${prefix}_${index}_preview_container" class="flex flex-wrap gap-2 mt-2"></div>
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
                    <input type="file" multiple name="apar_${aparCount}_item_${index}_foto" accept="image/*" class="w-full max-w-[200px] sm:max-w-xs text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer transition-colors overflow-hidden" onchange="showPreviews(this, 'apar_${aparCount}_item_${index}_preview_container')">
                    <div id="apar_${aparCount}_item_${index}_preview_container" class="flex flex-wrap gap-2 mt-2"></div>
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

function addPassiveItem(prefix, title) {
    let countVar, deletedSet, container;
    
    if (prefix === 'firealarm') { firealarmCount++; countVar = firealarmCount; deletedSet = deletedFirealarms; }
    else if (prefix === 'evakuasi') { evakuasiCount++; countVar = evakuasiCount; deletedSet = deletedEvakuasis; }
    else if (prefix === 'pintudarurat') { pintudaruratCount++; countVar = pintudaruratCount; deletedSet = deletedPintudarurats; }
    else if (prefix === 'tanggadarurat') { tanggadaruratCount++; countVar = tanggadaruratCount; deletedSet = deletedTanggadarurats; }
    
    container = document.getElementById(`${prefix}-checklist-container`);
    const div = document.createElement('div');
    div.id = `${prefix}_card_${countVar}`;
    div.className = "bg-white p-6 md:p-8 rounded-2xl border border-gray-200 mb-6 relative group";
    
    let checklistHTML = '';
    checklists[prefix].forEach((item, index) => {
        checklistHTML += `
        <div class="flex flex-col lg:flex-row gap-4 py-6 border-t border-gray-50 w-full items-start">
            <div class="w-full lg:w-1/3 text-sm font-medium text-dark leading-relaxed pr-4">
                ${index + 1}. <span class="text-gray-600 font-normal">${item}</span>
            </div>
            
            <div class="flex flex-wrap items-center gap-4 w-full lg:w-2/3">
                <div class="flex items-center gap-5 shrink-0">
                    <label class="inline-flex items-center cursor-pointer group">
                        <input type="radio" name="${prefix}_${countVar}_item_${index}_status" value="Sesuai" class="w-5 h-5 border-gray-300 text-primary focus:ring-primary" onchange="autoFillKeterangan(this, \`${item}\`)">
                        <span class="ml-2 text-sm text-gray-700 group-hover:text-dark transition">Sesuai</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer group">
                        <input type="radio" name="${prefix}_${countVar}_item_${index}_status" value="Tidak Sesuai" class="w-5 h-5 border-gray-300 text-red-600 focus:ring-red-600" onchange="autoFillKeterangan(this, \`${item}\`)">
                        <span class="ml-2 text-sm text-gray-700 group-hover:text-dark transition">Tidak Sesuai</span>
                    </label>
                </div>

                <div class="flex-1 min-w-[150px]">
                    <input type="text" name="${prefix}_${countVar}_item_${index}_keterangan" oninput="this.removeAttribute('data-auto')" placeholder="Keterangan..." class="w-full px-4 py-2 text-sm border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-primary focus:ring-primary transition shadow-sm">
                </div>

                <div class="w-full sm:w-auto shrink-0 flex flex-col gap-2">
                    <input type="file" multiple name="${prefix}_${countVar}_item_${index}_foto" accept="image/*" class="w-full max-w-[200px] sm:max-w-xs text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer transition-colors overflow-hidden" onchange="showPreviews(this, '${prefix}_${countVar}_item_${index}_preview_container')">
                    <div id="${prefix}_${countVar}_item_${index}_preview_container" class="flex flex-wrap gap-2 mt-2"></div>
                </div>
            </div>
        </div>`;
    });

    let iconClass = 'fa-check';
    if (prefix === 'firealarm') iconClass = 'fa-bell';
    else if (prefix === 'evakuasi') iconClass = 'fa-person-running';
    else if (prefix === 'pintudarurat') iconClass = 'fa-door-open';
    else if (prefix === 'tanggadarurat') iconClass = 'fa-stairs';

    div.innerHTML = `
        <button type="button" onclick="removePassiveItem('${prefix}', ${countVar})" class="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors" title="Hapus ${title}">
            <i class="fa-solid fa-trash-can text-2xl"></i>
        </button>
        <h3 class="text-xl font-bold text-dark mb-6 flex items-center gap-3">
            <div class="bg-gray-100 p-2 rounded-lg"><i class="fa-solid ${iconClass} text-primary"></i></div> 
            <span class="apar-card-title">Data ${title} ${countVar}</span>
        </h3>
        
        <div class="mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Lokasi Spesifik</label>
            <input type="text" name="${prefix}_${countVar}_lokasi" class="w-full px-4 py-2 border-gray-300 rounded-xl focus:border-primary focus:ring-primary transition" placeholder="Contoh: Sayap Kiri, Dekat Toilet...">
        </div>
        
        <div class="space-y-0 divide-y divide-gray-100">
            ${checklistHTML}
        </div>
    `;
    container.appendChild(div);
}

function removePassiveItem(prefix, id) {
    if (confirm('Yakin ingin menghapus item ini?')) {
        document.getElementById(`${prefix}_card_${id}`).style.display = 'none';
        if (prefix === 'firealarm') deletedFirealarms.add(id);
        else if (prefix === 'evakuasi') deletedEvakuasis.add(id);
        else if (prefix === 'pintudarurat') deletedPintudarurats.add(id);
        else if (prefix === 'tanggadarurat') deletedTanggadarurats.add(id);
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

function showPreviews(input, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Bersihkan container sebelumnya, atau biarkan append?
    // Lebih baik dibersihkan agar setiap milih file, yang tampil adalah yang dipilih
    container.innerHTML = '';
    
    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach((file, index) => {
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
                    
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                    
                    const previewImg = document.createElement('img');
                    previewImg.src = dataUrl;
                    previewImg.className = "w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm";
                    container.appendChild(previewImg);
                    
                    // OTOMATIS DOWNLOAD FOTO SEBAGAI BACKUP KE HP
                    const a = document.createElement('a');
                    a.href = dataUrl;
                    a.download = `Backup_Foto_${containerId}_${index}_${Date.now()}.jpg`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                };
                img.src = e.target.result;
            }
            reader.readAsDataURL(file);
        });
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
            delete data[key]; // Hapus file object
        }
    }
    
    // Ambil semua foto dari kontainer preview
    const previewContainers = document.querySelectorAll('[id$="_preview_container"]');
    previewContainers.forEach(container => {
        const imgs = container.querySelectorAll('img');
        const keyBase = container.id.replace('_preview_container', ''); // apar_1_item_0
        if (imgs.length > 0) {
            data[keyBase + '_foto_base64'] = Array.from(imgs).map(img => img.src);
        }
    });
    
    data.aparCount = aparCount;
    data.deletedApars = Array.from(deletedApars);
    
    data.firealarmCount = firealarmCount;
    data.deletedFirealarms = Array.from(deletedFirealarms);
    data.evakuasiCount = evakuasiCount;
    data.deletedEvakuasis = Array.from(deletedEvakuasis);
    data.pintudaruratCount = pintudaruratCount;
    data.deletedPintudarurats = Array.from(deletedPintudarurats);
    data.tanggadaruratCount = tanggadaruratCount;
    data.deletedTanggadarurats = Array.from(deletedTanggadarurats);
    
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
        
        // Timeout 10 detik untuk simulasi network error atau server down
        const savePromise = docRef.set(data, {merge: true});
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('TIMEOUT_NO_INTERNET')), 10000);
        });
        
        await Promise.race([savePromise, timeoutPromise]);
        
        if(showAlert) {
            alert('Data berhasil diamankan ke server! ✅');
        }
        document.getElementById('network-error-actions')?.classList.add('hidden');
        return true;
    } catch(err) {
        console.error("Error saving report: ", err);
        const errorDiv = document.getElementById('network-error-actions');
        if (errorDiv) errorDiv.classList.remove('hidden');
        
        if(showAlert) {
            setTimeout(() => {
                alert('Gagal terhubung ke server! Koneksi internet bermasalah. Silakan scroll ke bawah dan gunakan fitur "Save Local" atau "Download Backup" untuk menyelamatkan data Anda.');
            }, 100);
        }
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
    const localAparCount = data.aparCount !== undefined ? data.aparCount : aparCount;
    const localDeletedApars = data.deletedApars ? new Set(data.deletedApars) : deletedApars;

    for(let i=1; i<=localAparCount; i++) {
        if(localDeletedApars.has(i)) continue;
        
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
            if (Array.isArray(data[`apar_${i}_item_${idx}_foto_base64`])) {
                imgHtml = data[`apar_${i}_item_${idx}_foto_base64`].map(src => `<img src="${src}" style="max-height: 80px; width: auto; border-radius: 4px; display: inline-block; margin: 2px;" />`).join('');
            } else if (typeof data[`apar_${i}_item_${idx}_foto_base64`] === 'string') {
                imgHtml = `<img src="${data[`apar_${i}_item_${idx}_foto_base64`]}" style="max-height: 80px; width: auto; border-radius: 4px; display: inline-block; margin: 2px;" />`;
            } else {
                // Fallback to DOM elements for unsaved preview
                const containerId = `apar_${i}_item_${idx}_preview_container`;
                const container = document.getElementById(containerId);
                if (container && container.querySelectorAll('img').length > 0) {
                    const imgs = Array.from(container.querySelectorAll('img'));
                    imgHtml = imgs.map(img => `<img src="${img.src}" style="max-height: 80px; width: auto; border-radius: 4px; display: inline-block; margin: 2px;" />`).join('');
                } else {
                    // Fallback backward compatibility
                    const previewId = `apar_${i}_item_${idx}_preview`;
                    const previewImg = document.getElementById(previewId);
                    if (previewImg && previewImg.src && previewImg.src.startsWith('data:image')) {
                        imgHtml = `<img src="${previewImg.src}" style="max-height: 80px; width: auto; border-radius: 4px; display: inline-block; margin: 2px;" />`;
                    }
                }
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

        let bkpDel = new Set(data[`deleted${prefix.charAt(0).toUpperCase() + prefix.slice(1)}s`] || []);
        let bkpCount = data[`${prefix}Count`] || (prefix === 'detector' ? 1 : 0);

        // Jika detector, paksa loop 1 kali
        if (prefix === 'detector') {
            bkpCount = 1;
            bkpDel = new Set();
        }

        for (let j = 1; j <= bkpCount; j++) {
            if (bkpDel.has(j)) continue;

            const locText = prefix !== 'detector' && data[`${prefix}_${j}_lokasi`] 
                ? data[`${prefix}_${j}_lokasi`] 
                : (data.lokasi || '-');

            html += `<div style="page-break-after: always; margin-bottom: 30px;">`;
            if(hasHeaderTable) {
                if (j === 1) html += `<div style="text-align: center; font-weight: bold; margin-bottom: 20px;">HASIL INSPEKSI PROTEKSI PASIF</div>`;
                html += `<table class="report-table">
                    <tr><td colspan="2" style="text-align: center; font-weight: bold;">${title} ${prefix !== 'detector' ? j : ''}</td></tr>
                    <tr><td style="width: 30%;"><b>Lokasi</b></td><td>${locText}</td></tr>
                    <tr><td><b>Tanggal Inspeksi</b></td><td>${formattedDate}</td></tr>
                </table>`;
                if(desc) html += `<p style="margin-bottom: 10px;">${desc}</p>`;
            } else {
                html += `<div style="text-align: center; font-weight: bold; margin-bottom: 20px;">${title} ${prefix !== 'detector' ? j : ''}</div>`;
                if(desc) html += `<p style="margin-bottom: 20px; text-align: justify;">${desc}</p>`;
                if (prefix !== 'detector') {
                    html += `<p style="margin-bottom: 10px;"><b>Lokasi:</b> ${locText}</p>`;
                }
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
                const keyPrefix = prefix === 'detector' ? `${prefix}_${idx}` : `${prefix}_${j}_item_${idx}`;
                
                const status = data[`${keyPrefix}_status`] || '';
                const ket = data[`${keyPrefix}_keterangan`] || '';
                const numStr = prefix === 'evakuasi' ? String.fromCharCode(97 + idx) + '.' : (idx + 1);
                
                let imgHtml = '';
                if (Array.isArray(data[`${keyPrefix}_foto_base64`])) {
                    imgHtml = data[`${keyPrefix}_foto_base64`].map(src => `<img src="${src}" style="max-height: 80px; width: auto; border-radius: 4px; display: inline-block; margin: 2px;" />`).join('');
                } else if (typeof data[`${keyPrefix}_foto_base64`] === 'string') {
                    imgHtml = `<img src="${data[`${keyPrefix}_foto_base64`]}" style="max-height: 80px; width: auto; border-radius: 4px; display: inline-block; margin: 2px;" />`;
                } else {
                    const containerId = `${keyPrefix}_preview_container`;
                    const container = document.getElementById(containerId);
                    if (container && container.querySelectorAll('img').length > 0) {
                        const imgs = Array.from(container.querySelectorAll('img'));
                        imgHtml = imgs.map(img => `<img src="${img.src}" style="max-height: 80px; width: auto; border-radius: 4px; display: inline-block; margin: 2px;" />`).join('');
                    } else {
                        const previewId = `${keyPrefix}_preview`;
                        const previewImg = document.getElementById(previewId);
                        if (previewImg && previewImg.src && previewImg.src.startsWith('data:image')) {
                            imgHtml = `<img src="${previewImg.src}" style="max-height: 80px; width: auto; border-radius: 4px; display: inline-block; margin: 2px;" />`;
                        }
                    }
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
            
            // Render kesimpulan & rekomendasi di bawah tabel terakhir
            if (j === bkpCount) {
                const kesimpulan = data[`kesimpulan_${prefix}`];
                const rekomendasi = data[`rekomendasi_${prefix}`];
                if(kesimpulan || rekomendasi) {
                    html += `<div style="padding-top: 10px;">`;
                    if(kesimpulan) html += `<p style="font-weight:bold; margin-bottom:10px;">Kesimpulan:</p><div style="margin-bottom:20px; padding-left:20px;">${kesimpulan}</div>`;
                    if(rekomendasi) html += `<p style="font-weight:bold; margin-bottom:10px;">Rekomendasi:</p><div style="margin-bottom:20px; padding-left:20px;">${rekomendasi}</div>`;
                    html += `</div>`;
                }
            }
            
            html += `</div>`;
        }
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
    const btnDownloadAll = document.getElementById('btn-download-all');
    
    if (filterValue) {
        reports = reports.filter(r => r.fakultas === filterValue);
        if (btnDownloadAll) btnDownloadAll.classList.remove('hidden');
    } else {
        if (btnDownloadAll) btnDownloadAll.classList.add('hidden');
    }
    
    container.innerHTML = '';
    
    if(reports.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    // Add header row for the list
    container.innerHTML = `
        <div class="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 hidden md:grid">
            <div class="col-span-3">Fakultas</div>
            <div class="col-span-3">Lokasi / Area</div>
            <div class="col-span-2">Tanggal</div>
            <div class="col-span-2">Status</div>
            <div class="col-span-2 text-right">Aksi</div>
        </div>
        <div class="space-y-2" id="riwayat-items"></div>
    `;
    
    const listContainer = document.getElementById('riwayat-items');
    
    reports.forEach(report => {
        const isDraft = report.status === 'draft';
        const missing = isDraft ? getMissingFields(report) : [];
        const missingCount = missing.length;
        
        const div = document.createElement('div');
        div.className = "bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-sm transition flex flex-col md:grid md:grid-cols-12 gap-4 md:items-center";
        
        div.innerHTML = `
            <div class="col-span-3 flex items-center gap-3">
                <i class="fa-solid ${isDraft ? 'fa-file-pen text-gray-400' : 'fa-file-contract text-gray-700'}"></i>
                <div>
                    <h3 class="font-bold text-gray-900 text-sm line-clamp-1">${report.fakultas || 'Tanpa Fakultas'}</h3>
                    ${missing.length > 0 ? `<p class="text-[10px] font-bold text-red-500 mt-0.5"><i class="fa-solid fa-triangle-exclamation"></i> ${missingCount} form kosong</p>` : ''}
                </div>
            </div>
            <div class="col-span-3 text-sm text-gray-500 line-clamp-1">
                ${report.lokasi || '-'}
            </div>
            <div class="col-span-2 text-xs font-medium text-gray-500">
                ${new Date(parseInt(report.report_id)).toLocaleDateString('id-ID')}
            </div>
            <div class="col-span-2">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${isDraft ? 'bg-gray-100 text-gray-600' : 'bg-gray-900 text-white'}">
                    ${isDraft ? 'Draf' : 'Selesai'}
                </span>
            </div>
            <div class="col-span-2 flex justify-end gap-2 mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-0 border-gray-50">
                <button onclick="loadReport('${report.id}')" class="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition">
                    Buka
                </button>
                <button onclick="deleteReport('${report.id}')" class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition" title="Hapus">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
            </div>
        `;
        listContainer.appendChild(div);
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

        // Hapus form pasif saat ini dan restore sesuai data load
        const passiveTypes = [
            { prefix: 'firealarm', count: 'firealarmCount', del: 'deletedFirealarms', title: 'Fire Alarm', varDel: deletedFirealarms },
            { prefix: 'evakuasi', count: 'evakuasiCount', del: 'deletedEvakuasis', title: 'Jalur Evakuasi', varDel: deletedEvakuasis },
            { prefix: 'pintudarurat', count: 'pintudaruratCount', del: 'deletedPintudarurats', title: 'Pintu Darurat', varDel: deletedPintudarurats },
            { prefix: 'tanggadarurat', count: 'tanggadaruratCount', del: 'deletedTanggadarurats', title: 'Tangga Darurat', varDel: deletedTanggadarurats }
        ];
        
        passiveTypes.forEach(pt => {
            document.getElementById(`${pt.prefix}-checklist-container`).innerHTML = '';
            
            if (pt.prefix === 'firealarm') firealarmCount = 0;
            else if (pt.prefix === 'evakuasi') evakuasiCount = 0;
            else if (pt.prefix === 'pintudarurat') pintudaruratCount = 0;
            else if (pt.prefix === 'tanggadarurat') tanggadaruratCount = 0;
            
            pt.varDel.clear();
            
            let bkpDel = new Set(data[pt.del] || []);
            let bkpCount = data[pt.count] || 0;
            
            if (pt.prefix === 'firealarm') deletedFirealarms = bkpDel;
            else if (pt.prefix === 'evakuasi') deletedEvakuasis = bkpDel;
            else if (pt.prefix === 'pintudarurat') deletedPintudarurats = bkpDel;
            else if (pt.prefix === 'tanggadarurat') deletedTanggadarurats = bkpDel;
            
            if (bkpCount > 0) {
                for (let i = 1; i <= bkpCount; i++) {
                    if (!bkpDel.has(i)) {
                        addPassiveItem(pt.prefix, pt.title);
                    } else {
                        if (pt.prefix === 'firealarm') firealarmCount++;
                        else if (pt.prefix === 'evakuasi') evakuasiCount++;
                        else if (pt.prefix === 'pintudarurat') pintudaruratCount++;
                        else if (pt.prefix === 'tanggadarurat') tanggadaruratCount++;
                    }
                }
            } else {
                addPassiveItem(pt.prefix, pt.title);
            }
        });

        for (const key in data) {
            if (key.endsWith('_foto_base64')) {
                const originalKey = key.replace('_foto_base64', '');
                const previewContainerId = `${originalKey}_preview_container`;
                const container = document.getElementById(previewContainerId);
                
                if (container && Array.isArray(data[key])) {
                    container.innerHTML = '';
                    data[key].forEach(base64Str => {
                        const img = document.createElement('img');
                        img.src = base64Str;
                        img.className = "w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm";
                        container.appendChild(img);
                    });
                }
                continue;
            }
            
            if (key.endsWith('_base64')) {
                const originalKey = key.replace('_base64', '');
                const previewContainerId = `${originalKey}_preview_container`;
                const container = document.getElementById(previewContainerId);
                if (container && typeof data[key] === 'string') {
                    container.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = data[key];
                    img.className = "w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm";
                    container.appendChild(img);
                } else {
                    const previewId = originalKey.replace('_foto', '_preview');
                    const previewImg = document.getElementById(previewId);
                    if (previewImg) {
                        previewImg.src = data[key];
                        previewImg.classList.remove('hidden');
                    }
                }
                continue;
            }

            const element = document.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'radio' || element.type === 'checkbox') {
                    const el = document.querySelector(`[name="${key}"][value="${data[key]}"]`) || 
                               document.querySelector(`[name="${key}"]`);
                               
                    if (element.type === 'checkbox') {
                        element.checked = !!data[key];
                        if (element.onchange) {
                            element.dispatchEvent(new Event('change'));
                        }
                    } else if (el && el.type === 'radio') {
                        el.checked = true;
                    }
                } else if (element.type !== 'file') {
                    element.value = data[key];
                }
            }
            
            if (key.includes('_keterangan')) {
                const ketInput = document.querySelector(`input[name="${key}"]`);
                if (ketInput) {
                    ketInput.value = data[key];
                    ketInput.dataset.auto = "false";
                }
            }
            
            // Set Quill content
            if (key.startsWith('kesimpulan_') || key.startsWith('rekomendasi_')) {
                if (window.quillEditors && window.quillEditors[key]) {
                    window.quillEditors[key].root.innerHTML = data[key];
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


const GEMINI_API_KEY = "AQ." + "Ab8RN6JEvdCeBj802HUsZYbslLfW5tXVxbatkMfF7IJIAjOXeA";

async function generateWithGemini(section, type) {
    if (!GEMINI_API_KEY) {
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
                
                const noApar = document.querySelector(`input[name="apar_${i}_nomor"]`)?.value || i;
                const lokApar = document.querySelector(`input[name="apar_${i}_lokasi"]`)?.value || '-';
                const medApar = document.querySelector(`select[name="apar_${i}_media"]`)?.value || '-';
                
                itemDetails.push(`Identitas: Nomor ${noApar}, Lokasi di ${lokApar}, Media ${medApar}`);

                for (let j = 0; j < checklists.apar.length; j++) {
                    const status = document.querySelector(`input[name="apar_${i}_item_${j}_status"]:checked`)?.value || 'Belum Diinspeksi';
                    const ket = document.querySelector(`input[name="apar_${i}_item_${j}_keterangan"]`)?.value || '-';
                    itemDetails.push(`- ${checklists.apar[j]}: ${status} (Keterangan: ${ket})`);
                }
                aparItems.push(`APAR ${i}:\n${itemDetails.join('\n')}`);
            }
            dataContext += aparItems.join('\n\n');
        } else if (section === 'detector') {
            const items = [];
            for (let j = 0; j < checklists.detector.length; j++) {
                const status = document.querySelector(`input[name="detector_${j}_status"]:checked`)?.value || 'Belum Diinspeksi';
                const ket = document.querySelector(`input[name="detector_${j}_keterangan"]`)?.value || '-';
                items.push(`- ${checklists.detector[j]}: ${status} (Keterangan: ${ket})`);
            }
            dataContext += items.join('\n');
        } else {
            const countMap = { firealarm: firealarmCount, evakuasi: evakuasiCount, pintudarurat: pintudaruratCount, tanggadarurat: tanggadaruratCount };
            const delMap = { firealarm: deletedFirealarms, evakuasi: deletedEvakuasis, pintudarurat: deletedPintudarurats, tanggadarurat: deletedTanggadarurats };
            
            const bkpCount = countMap[section];
            const bkpDel = delMap[section];
            
            const pItems = [];
            for (let i = 1; i <= bkpCount; i++) {
                if (bkpDel.has(i)) continue;
                let itemDetails = [];
                const loc = document.querySelector(`input[name="${section}_${i}_lokasi"]`)?.value || '-';
                itemDetails.push(`Lokasi Spesifik: ${loc}`);
                
                for (let j = 0; j < checklists[section].length; j++) {
                    const status = document.querySelector(`input[name="${section}_${i}_item_${j}_status"]:checked`)?.value || 'Belum Diinspeksi';
                    const ket = document.querySelector(`input[name="${section}_${i}_item_${j}_keterangan"]`)?.value || '-';
                    itemDetails.push(`- ${checklists[section][j]}: ${status} (Keterangan: ${ket})`);
                }
                pItems.push(`${section.toUpperCase()} ${i}:\n${itemDetails.join('\n')}`);
            }
            dataContext += pItems.join('\n\n');
        }

        let sysPrompt = `Anda adalah seorang ahli K3. Tugas Anda HANYA membuat ${type.toUpperCase()} untuk inspeksi ${section.toUpperCase()} berdasarkan Data Inspeksi. 

ATURAN WAJIB:
1. JANGAN memberikan kata pembuka atau penutup (seperti "Berikut adalah kesimpulan...", "Berdasarkan hasil..."). Langsung ke intinya (To The Point).
2. JIKA Anda diminta membuat KESIMPULAN, jangan tulis rekomendasi. JIKA diminta REKOMENDASI, jangan tulis kesimpulan.
3. SANGAT PENTING: Perhatikan status tiap item secara akurat. Jika statusnya "Tidak Ada" atau "Tidak Sesuai", tuliskan faktanya secara jujur, jangan menganggap kondisinya baik.
4. Gunakan bahasa Indonesia baku, formal, dan rapi.
5. Format output HARUS menggunakan tag HTML dasar (<ul>, <li>, <p>, <strong>) agar kompatibel dengan rich text editor. JANGAN gunakan tag markdown (\`\`\`html). Langsung keluarkan HTML murninya.
6. Buatlah poin-poin secara DINAMIS berdasarkan data aktual yang diterima. JANGAN menyalin persis struktur dari "CONTOH GAYA BAHASA" jika memang tidak relevan dengan data saat ini. Jika tidak ada temuan buruk, tuliskan bahwa kondisinya sesuai/baik.

`;

        if (section === 'apar') {
            if (type === 'kesimpulan') {
                sysPrompt += `Buatlah poin-poin kesimpulan terkait kondisi APAR. Kelompokkan menjadi beberapa paragraf/poin jika diperlukan (misal: Kondisi Fisik, Pemasangan, dll). Jika semua Sesuai, tuliskan dengan jelas bahwa seluruh APAR dalam kondisi baik dan memenuhi standar.`;
            } else {
                sysPrompt += `Buatlah poin-poin rekomendasi perbaikan untuk APAR yang berstatus "Tidak Sesuai" atau "Belum Diinspeksi". Jika semua APAR "Sesuai", rekomendasikan untuk sekadar mempertahankan jadwal maintenance rutin.`;
            }
        } else {
            sysPrompt += `Buat ${type} secara to the point. Jangan terlalu panjang, fokus pada fakta di lapangan. Jika semua berstatus "Sesuai", tuliskan apresiasi atau kesimpulan bahwa kondisi telah baik dan penuhi standar.`;
        }
        
        sysPrompt += `\n\nATURAN TAMBAHAN SANGAT PENTING: JANGAN SEKALI-KALI membuat judul, sub-judul, atau poin list yang isinya kosong/blank. Jika suatu kategori tidak memiliki isi/data, abaikan saja kategorinya! Pastikan setiap baris yang Anda tulis memiliki makna dan penjelasan.`;

        const modelsToTry = ['gemini-3.5-flash', 'gemini-3-flash-preview'];
        let success = false;
        let lastError = null;

        for (const model of modelsToTry) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
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
                    const editor = window.quillEditors[`${type}_${section}`];
                    // Kosongkan dulu
                    editor.setText('');
                    // Gunakan API resmi Quill untuk paste HTML
                    editor.clipboard.dangerouslyPasteHTML(0, text);
                }
                
                success = true;
                break; // Berhasil, hentikan loop
            } catch (e) {
                lastError = e;
                console.warn(`Model ${model} gagal:`, e.message);
                // Lanjut ke model berikutnya
            }
        }

        if (!success) {
            throw lastError;
        }
    } catch(err) {
        console.error(err);
        alert("Gagal generate dengan Gemini AI. Pastikan API Key valid dan koneksi internet stabil. Error: " + err.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function downloadAllByFakultas() {
    const filterValue = document.getElementById('filter-fakultas').value;
    if (!filterValue) {
        alert("Pilih salah satu fakultas terlebih dahulu!");
        return;
    }
    
    const btn = document.getElementById('btn-download-all');
    const originalBtn = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Menyiapkan...';
    btn.disabled = true;
    
    // Ambil data yang difilter dan urutkan
    let reports = riwayatReportsCache.filter(r => r.fakultas === filterValue);
    reports.sort((a, b) => b.report_id - a.report_id);
    
    if (reports.length === 0) {
        alert("Tidak ada data untuk fakultas ini.");
        btn.innerHTML = originalBtn;
        btn.disabled = false;
        return;
    }

    let combinedHTML = '';
    
    for (let i = 0; i < reports.length; i++) {
        const data = reports[i];
        let reportHTML = getReportHTML(data);
        
        combinedHTML += reportHTML;
        
        // Tambahkan page break setelah tiap laporan, kecuali laporan terakhir
        if (i < reports.length - 1) {
            combinedHTML += '<div style="page-break-after: always; display: block; height: 0;"></div>';
        }
    }
    
    let printContainer = document.getElementById('print-container');
    if (!printContainer) {
        printContainer = document.createElement('div');
        printContainer.id = 'print-container';
        document.body.appendChild(printContainer);
    }
    
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
        ${combinedHTML}
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
    
    const originalTitle = document.title;
    document.title = `Rekap_Inspeksi_${filterValue.replace(/\s+/g, '_')}_Total_${reports.length}`;
    
    const images = printContainer.getElementsByTagName('img');
    const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    });
    
    await Promise.all(imagePromises);
    
    setTimeout(() => {
        window.print();
        document.title = originalTitle;
        btn.innerHTML = originalBtn;
        btn.disabled = false;
    }, 500);
}


function getFormDataForBackup() {
    syncQuillToInputs();
    const form = document.getElementById('inspection-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Convert files to base64 immediately for backup
    for (let key in data) {
        if (data[key] instanceof File) {
            delete data[key];
        }
    }
    
    // Ambil semua foto dari kontainer preview
    const previewContainers = document.querySelectorAll('[id$="_preview_container"]');
    previewContainers.forEach(container => {
        const imgs = container.querySelectorAll('img');
        const keyBase = container.id.replace('_preview_container', '');
        if (imgs.length > 0) {
            data[keyBase + '_foto_base64'] = Array.from(imgs).map(img => img.src);
        }
    });
    
    data.aparCount = aparCount;
    data.deletedApars = Array.from(deletedApars);
    
    data.firealarmCount = firealarmCount;
    data.deletedFirealarms = Array.from(deletedFirealarms);
    data.evakuasiCount = evakuasiCount;
    data.deletedEvakuasis = Array.from(deletedEvakuasis);
    data.pintudaruratCount = pintudaruratCount;
    data.deletedPintudarurats = Array.from(deletedPintudarurats);
    data.tanggadaruratCount = tanggadaruratCount;
    data.deletedTanggadarurats = Array.from(deletedTanggadarurats);
    if (!data.report_id && currentDocId) data.report_id = currentDocId;
    else if (!data.report_id) data.report_id = Date.now().toString();
    
    return data;
}

function downloadBackup() {
    const data = getFormDataForBackup();
    const jsonStr = JSON.stringify(data);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const fakultas = data.fakultas ? data.fakultas.replace(/\\s+/g, '_') : 'Draft';
    const filename = `Backup_Inspeksi_${fakultas}_${Date.now()}.inspeksi`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('File backup (.inspeksi) berhasil diunduh! Simpan file ini baik-baik. Nanti Anda bisa meng-uploadnya kembali lewat menu Import di bagian atas form.');
}

function saveToLocalBrowser() {
    const data = getFormDataForBackup();
    const jsonStr = JSON.stringify(data);
    
    try {
        localStorage.setItem(`inspeksi_backup_${data.report_id}`, jsonStr);
        alert('Data berhasil disimpan ke memori Local Browser! Anda bisa menutup halaman ini dengan aman. Nanti Anda bisa memulihkannya lewat fitur Import jika diperlukan (hubungi developer untuk panduan local browser). Atau untuk lebih aman, gunakan tombol Download Backup saja.');
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert('Gagal menyimpan ke Local Browser: Memori penuh karena terlalu banyak foto! HARAP GUNAKAN TOMBOL "Download File Backup" SEKARANG JUGA untuk menyelamatkan data Anda.');
        } else {
            alert('Terjadi kesalahan saat menyimpan ke Local Browser: ' + e.message);
        }
    }
}

function importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!confirm('Peringatan: Mengimpor file akan menimpa seluruh isian form saat ini. Lanjutkan?')) {
                event.target.value = '';
                return;
            }
            
            // Masukkan data ke cache riwayat sementara agar bisa diproses oleh fungsi loadReport yang sudah ada
            currentDocId = data.report_id;
            
            // Hapus form apar saat ini
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
            
            // Hapus form pasif saat ini dan restore sesuai backup
            const passiveTypes = [
                { prefix: 'firealarm', count: 'firealarmCount', del: 'deletedFirealarms', title: 'Fire Alarm', varDel: deletedFirealarms },
                { prefix: 'evakuasi', count: 'evakuasiCount', del: 'deletedEvakuasis', title: 'Jalur Evakuasi', varDel: deletedEvakuasis },
                { prefix: 'pintudarurat', count: 'pintudaruratCount', del: 'deletedPintudarurats', title: 'Pintu Darurat', varDel: deletedPintudarurats },
                { prefix: 'tanggadarurat', count: 'tanggadaruratCount', del: 'deletedTanggadarurats', title: 'Tangga Darurat', varDel: deletedTanggadarurats }
            ];
            
            passiveTypes.forEach(pt => {
                document.getElementById(`${pt.prefix}-checklist-container`).innerHTML = '';
                
                // Reset global counters via a quick hack: since we don't have a setter, we just overwrite them in window.
                if (pt.prefix === 'firealarm') firealarmCount = 0;
                else if (pt.prefix === 'evakuasi') evakuasiCount = 0;
                else if (pt.prefix === 'pintudarurat') pintudaruratCount = 0;
                else if (pt.prefix === 'tanggadarurat') tanggadaruratCount = 0;
                
                pt.varDel.clear();
                
                let bkpDel = new Set(data[pt.del] || []);
                let bkpCount = data[pt.count] || 0;
                
                if (pt.prefix === 'firealarm') deletedFirealarms = bkpDel;
                else if (pt.prefix === 'evakuasi') deletedEvakuasis = bkpDel;
                else if (pt.prefix === 'pintudarurat') deletedPintudarurats = bkpDel;
                else if (pt.prefix === 'tanggadarurat') deletedTanggadarurats = bkpDel;
                
                if (bkpCount > 0) {
                    for (let i = 1; i <= bkpCount; i++) {
                        if (!bkpDel.has(i)) {
                            addPassiveItem(pt.prefix, pt.title);
                        } else {
                            if (pt.prefix === 'firealarm') firealarmCount++;
                            else if (pt.prefix === 'evakuasi') evakuasiCount++;
                            else if (pt.prefix === 'pintudarurat') pintudaruratCount++;
                            else if (pt.prefix === 'tanggadarurat') tanggadaruratCount++;
                        }
                    }
                } else {
                    addPassiveItem(pt.prefix, pt.title);
                }
            });

            // Iterate dan isi nilainya
            for (const key in data) {
                if (key.endsWith('_foto_base64')) {
                    // Restore image array ke container
                    const originalKey = key.replace('_foto_base64', '');
                    const previewContainerId = `${originalKey}_preview_container`;
                    const container = document.getElementById(previewContainerId);
                    
                    if (container && Array.isArray(data[key])) {
                        container.innerHTML = ''; // Bersihkan
                        data[key].forEach(base64Str => {
                            const img = document.createElement('img');
                            img.src = base64Str;
                            img.className = "w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm";
                            container.appendChild(img);
                        });
                    }
                    continue;
                }
                
                if (key.endsWith('_base64')) {
                    // Backward compatibility untuk file lama yang base64-nya string
                    const originalKey = key.replace('_base64', '');
                    const previewContainerId = `${originalKey}_preview_container`;
                    const container = document.getElementById(previewContainerId);
                    if (container && typeof data[key] === 'string') {
                        container.innerHTML = '';
                        const img = document.createElement('img');
                        img.src = data[key];
                        img.className = "w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm";
                        container.appendChild(img);
                    } else {
                        // Fallback jika id nya beneran _preview tunggal (untuk detector yg msh belum multiple)
                        const previewId = originalKey.replace('_foto', '_preview');
                        const previewImg = document.getElementById(previewId);
                        if (previewImg) {
                            previewImg.src = data[key];
                            previewImg.classList.remove('hidden');
                        }
                    }
                    continue;
                }
                const element = document.querySelector(`[name="${key}"]`);
                if (element) {
                    if (element.type === 'radio' || element.type === 'checkbox') {
                        // Khusus radio/checkbox, cari elemen spesifik dengan value tersebut
                        // Tangani kasus value boolean/number yang mungkin dikonversi ke string
                        const el = document.querySelector(`[name="${key}"][value="${data[key]}"]`) || 
                                   document.querySelector(`[name="${key}"]`); 
                        
                        if (element.type === 'checkbox') {
                            element.checked = !!data[key]; // Restore state checkbox tunggal seperti no_tanggadarurat
                            // Jika ini checkbox toggle section, trigger change event agar UI update
                            if (element.onchange) {
                                element.dispatchEvent(new Event('change'));
                            }
                        } else if (el && el.type === 'radio') {
                            el.checked = true;
                        }
                    } else if (element.type !== 'file') {
                        element.value = data[key];
                    }
                }
                
                // Set text input khusus untuk keterangan
                if (key.includes('_keterangan')) {
                    const ketInput = document.querySelector(`input[name="${key}"]`);
                    if (ketInput) {
                        ketInput.value = data[key];
                        ketInput.dataset.auto = "false";
                    }
                }
                
                // Set Quill content
                if (key.startsWith('kesimpulan_') || key.startsWith('rekomendasi_')) {
                    if (window.quillEditors && window.quillEditors[key]) {
                        window.quillEditors[key].root.innerHTML = data[key];
                    }
                }
            }
            
            document.getElementById('network-error-actions')?.classList.add('hidden');
            alert('File backup berhasil dipulihkan! Semua data dan foto telah kembali. Anda bisa mencoba menyimpannya lagi ke server.');
            event.target.value = '';
        } catch (error) {
            alert('Gagal membaca file backup. Pastikan file yang diunggah benar-benar berekstensi .inspeksi dan tidak rusak.');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

// Handler untuk tombol import bawaan dari sesi sebelumnya (jika ada)
function importData(event) {
    importBackup(event);
}
