const key = 'AQ.' + 'Ab8RN6JEvdCeBj802HUsZYbslLfW5tXVxbatkMfF7IJIAjOXeA';
const sysPrompt = `Anda adalah seorang ahli K3. Tugas Anda HANYA membuat KESIMPULAN untuk inspeksi APAR berdasarkan Data Inspeksi.

ATURAN WAJIB:
1. JANGAN memberikan kata pembuka atau penutup (seperti "Berikut adalah kesimpulan...", "Berdasarkan hasil..."). Langsung ke intinya (To The Point).
2. JIKA Anda diminta membuat KESIMPULAN, jangan tulis rekomendasi. JIKA diminta REKOMENDASI, jangan tulis kesimpulan.
3. SANGAT PENTING: Perhatikan status tiap item secara akurat. Jika statusnya "Tidak Ada" atau "Tidak Sesuai", tuliskan faktanya secara jujur, jangan menganggap kondisinya baik.
4. Gunakan bahasa Indonesia baku, formal, dan rapi.
5. Format output HARUS menggunakan tag HTML dasar (<ul>, <li>, <p>, <strong>) agar kompatibel dengan rich text editor. JANGAN gunakan tag markdown (\`\`\`html). Langsung keluarkan HTML murninya.
6. Buatlah poin-poin secara DINAMIS berdasarkan data aktual yang diterima. JANGAN menyalin persis struktur dari "CONTOH GAYA BAHASA" jika memang tidak relevan dengan data saat ini. Jika tidak ada temuan buruk, tuliskan bahwa kondisinya sesuai/baik.

Buatlah poin-poin kesimpulan terkait kondisi APAR. Kelompokkan menjadi beberapa paragraf/poin jika diperlukan (misal: Kondisi Fisik, Pemasangan, dll). Jika semua Sesuai, tuliskan dengan jelas bahwa seluruh APAR dalam kondisi baik dan memenuhi standar. JANGAN membuat judul-judul poin yang isinya kosong.`;

const dataContext = `Data Inspeksi:
Fakultas/Unit: Fakultas Vokasi
Lokasi/Gedung: Gedung B Vokasi Lt. 2 Selasar

APAR 1:
Identitas: Nomor 1, Lokasi di Gedung B Vokasi Lt. 2 Selasar, Media Powder
- APAR Mudah dilihat dan jelas: Sesuai (Keterangan: -)
- Terdapat tanda Lokasi APAR: Sesuai (Keterangan: -)
- Tinggi Pemasangan APAR (minimal 50 cm dan maksimal 125 cm): Sesuai (Keterangan: -)
- APAR menggantung dan terdapat bracket/hook gantungan: Sesuai (Keterangan: -)
- Kondisi fisik tabung: Sesuai (Keterangan: -)
- Pin Pengaman: Sesuai (Keterangan: -)
- Label jenis dan petunjuk penggunaan: Sesuai (Keterangan: -)
- Tanggal kadaluarsa terbaca jelas: Sesuai (Keterangan: -)
- Manometer Normal (Zona Hijau): Sesuai (Keterangan: -)
- Nozzle pada kondisi normal, tidak berdebu, tidak rusak: Sesuai (Keterangan: -)
- Hose (selang) pada kondisi normal tidak retak tidak bocor: Sesuai (Keterangan: -)
- Kartu inspeksi tersedia dan terisi: Sesuai (Keterangan: -)`;

fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=' + key, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: sysPrompt + '\n\n' + dataContext }] }] })
}).then(r => r.json()).then(res => {
    console.log(res.candidates[0].content.parts[0].text);
}).catch(console.error);
