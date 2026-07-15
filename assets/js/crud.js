
const KUNCI_STORAGE = 'wasteless_makanan';
// Kunci untuk menyimpan data makanan di localStorage browser.

// ── State 
let daftarMakanan = muatDariStorage();
let idSedangEdit = null;
let idAkanDihapus = null;

// ── Inisialisasi 
// Render tabel & pasang event listener setelah halaman siap
document.addEventListener('DOMContentLoaded', () => {
  renderTabel();
  pasangEventListener();
  updateRingkasan();
});

// Menambahkan event listener ke semua tombol & input di halaman
function pasangEventListener() {
  const formMakanan = document.getElementById('form-makanan');
  if (formMakanan) {
    formMakanan.addEventListener('submit', simpanMakanan);
  }

  const tombolReset = document.getElementById('tombol-reset');
  if (tombolReset) {
    tombolReset.addEventListener('click', resetForm);
  }

  // Input pencarian real-time
  const inputCari = document.getElementById('input-cari');
  if (inputCari) {
    inputCari.addEventListener('input', (e) => renderTabel(e.target.value)); 
    // Setiap user ketik di kotak pencarian, langsung cari & tampilkan hasilnya
  }

  // Filter dropdown kategori
  const filterKategori = document.getElementById('filter-kategori');
  if (filterKategori) {
    filterKategori.addEventListener('change', () => {
      const cari = document.getElementById('input-cari')?.value || ''; 
      // Cek kotak pencarian ada isi apa gak, kalo kosong di kosongkan saja
      renderTabel(cari);
    });
  }

  // Tombol konfirmasi hapus pada modal
  const tombolKonfirmasiHapus = document.getElementById('tombol-konfirmasi-hapus');
  if (tombolKonfirmasiHapus) {
    tombolKonfirmasiHapus.addEventListener('click', konfirmasiHapus);
  }
}

// ── Storage 
// Ambil data makanan yang tersimpan di browser, kalo gak ada return list kosong
function muatDariStorage() {
  try {
    const data = localStorage.getItem(KUNCI_STORAGE);
    return data ? JSON.parse(data) : []; // Kalo ada data, ubah jadi list, kalo gak ada return list kosong
  } catch {
    return [];
  }
}

// Simpan array daftarMakanan ke localStorage dalam format JSON string
function simpanKeStorage() {
  localStorage.setItem(KUNCI_STORAGE, JSON.stringify(daftarMakanan));
}

// Buat ID unik buat setiap makanan baru (supaya gak ketukar)
function buatId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); // Campurin waktu sekarang + angka random, jadi pasti beda-beda
}

// ── CRUD 
// Simpan atau update makanan berdasarkan form input (trigger dari submit form)
function simpanMakanan(e) {
  e.preventDefault(); // Jangan reload halaman pas form di-submit

  const form = e.target;
  if (!form.checkValidity()) { // Cek apakah semua field form sudah diisi
    form.classList.add('was-validated'); // Tampilkan warning kalo ada yang kosong
    return;
  }

  // Kumpulin semua data makanan dari input form
  const makanan = {
    id: idSedangEdit || buatId(), // Kalo lagi edit, pakai ID lama. Kalo tambah baru, buat ID baru
    nama: document.getElementById('nama-makanan').value.trim(), // Ambil nama & hapus spasi depan-belakang
    kategori: document.getElementById('kategori-makanan').value,
    tanggalKedaluwarsa: document.getElementById('tanggal-kedaluwarsa').value,
    lokasiPenyimpanan: document.getElementById('lokasi-penyimpanan').value.trim(),
    catatan: document.getElementById('catatan-makanan').value.trim(),
    ditambahkan: idSedangEdit
      ? (daftarMakanan.find(m => m.id === idSedangEdit)?.ditambahkan || new Date().toISOString()) // Kalo edit, pakai tanggal lama. Kalo tambah baru, pakai tanggal hari ini
      : new Date().toISOString(),
  };

  if (idSedangEdit) {
    // Kalo lagi edit: cari makanan lama & ganti dengan yang baru
    const idx = daftarMakanan.findIndex(m => m.id === idSedangEdit); // Cari posisi makanan dalam list
    if (idx !== -1) daftarMakanan[idx] = makanan; // Kalo ketemu, ganti datanya
    tampilkanToast('Makanan berhasil diperbarui!', 'sukses');
  } else {
    // Kalo tambah baru: masukin makanan baru ke list
    daftarMakanan.push(makanan);
    tampilkanToast('Makanan berhasil ditambahkan!', 'sukses');
  }

  simpanKeStorage();
  resetForm();
  renderTabel();
  updateRingkasan();

  // Tutup pop-up form setelah simpan
  const modalEl = document.getElementById('modal-makanan');
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl); // Ambil pop-up yang lagi dibuka
    modal?.hide(); // Tutup pop-up jika ada yang dibuka
  }
}

// Isi form dengan data makanan yang dipilih & buka pop-up edit
function editMakanan(id) {
  const makanan = daftarMakanan.find(m => m.id === id); // Cari makanan yang mau diedit dari listnya
  if (!makanan) return; // Kalo gak ketemu, hentikan

  idSedangEdit = id;
  // Isi semua field form dengan data makanan yang lama
  document.getElementById('nama-makanan').value = makanan.nama;
  document.getElementById('kategori-makanan').value = makanan.kategori;
  document.getElementById('tanggal-kedaluwarsa').value = makanan.tanggalKedaluwarsa;
  document.getElementById('lokasi-penyimpanan').value = makanan.lokasiPenyimpanan;
  document.getElementById('catatan-makanan').value = makanan.catatan || ''; // Kalo catatan kosong, isi dengan string kosong aja

  // Ubah tulisan di form jadi "Edit Makanan" (bukan "Tambah Makanan")
  document.getElementById('judul-modal').textContent = 'Edit Makanan';
  document.getElementById('tombol-simpan').textContent = 'Perbarui';

  // Buka pop-up form
  const modalEl = document.getElementById('modal-makanan');
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl); // Buat pop-up baru
    modal.show();
  }
}

// Tanyakan user dulu sebelum hapus makanan (lewat pop-up konfirmasi)
function hapusMakanan(id) {
  const makanan = daftarMakanan.find(m => m.id === id); // Cari makanan yang mau dihapus
  if (!makanan) return;

  idAkanDihapus = id; // Inget ID-nya, nanti dipake saat user klik "Ya, Hapus"

  // Tampilkan nama makanan di pop-up konfirmasi
  const namaEl = document.getElementById('nama-makanan-dihapus');
  if (namaEl) namaEl.textContent = makanan.nama;

  // Buka pop-up konfirmasi
  const modalEl = document.getElementById('modal-konfirmasi-hapus');
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

// Hapus makanan setelah user klik "Ya, Hapus" di pop-up konfirmasi
function konfirmasiHapus() {
  if (!idAkanDihapus) return;

  const makanan = daftarMakanan.find(m => m.id === idAkanDihapus);
  if (!makanan) return;

  // Hapus dari list (buat list baru tanpa makanan yang dihapus)
  daftarMakanan = daftarMakanan.filter(m => m.id !== idAkanDihapus); // Ambil semua kecuali yang ID-nya sama
  simpanKeStorage(); // Simpan ke browser
  renderTabel(); // Refresh tabel
  updateRingkasan(); // Update statistik
  tampilkanToast(`"${makanan.nama}" berhasil dihapus.`, 'gagal'); // Tampilkan notifikasi

  // Tutup pop-up konfirmasi
  const modalEl = document.getElementById('modal-konfirmasi-hapus');
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  }
  idAkanDihapus = null; // Reset
}

// Kosongkan form & kembalikan ke mode "Tambah" (bukan edit)
function resetForm() {
  idSedangEdit = null; // Reset ID yang lagi diedit
  const form = document.getElementById('form-makanan');
  if (!form) return;
  form.reset(); // Kosongkan semua input
  form.classList.remove('was-validated'); // Hilangkan warning merah yang muncul pas validasi
  document.getElementById('judul-modal').textContent = 'Tambah Makanan'; // Ganti judul jadi "Tambah" (dari "Edit")
  document.getElementById('tombol-simpan').textContent = 'Simpan'; // Ganti tombol jadi "Simpan" (dari "Perbarui")
}

// ── Render 
// Tampilkan tabel makanan dengan filter & pencarian yang user pilih
function renderTabel(cari = '') { // cari = parameter opsional, kalo gak diberikan default jadi string kosong
  const tbody = document.getElementById('tbody-makanan');
  const emptyState = document.getElementById('empty-state');
  if (!tbody) return;

  const katFilter = document.getElementById('filter-kategori')?.value || ''; // Ambil filter kategori, kalo gak ada return string kosong

  // Urutkan data berdasarkan tanggal kedaluwarsa (paling dekat dulu)
  let data = [...daftarMakanan].sort((a, b) => // Buat copy list baru supaya gak ngubah list asli
    new Date(a.tanggalKedaluwarsa) - new Date(b.tanggalKedaluwarsa) // Urutkan dari tanggal terdekati (kecil) ke jauh (besar)
  );

  // Filter berdasarkan keyword pencarian
  if (cari) {
    const q = cari.toLowerCase(); // Ubah keyword ke huruf kecil supaya pencarian menjadi case-insensitive
    data = data.filter(m =>
      m.nama.toLowerCase().includes(q) || // Cek apakah nama mengandung keyword
      m.kategori.toLowerCase().includes(q) || // Atau kategori
      m.lokasiPenyimpanan.toLowerCase().includes(q) // Atau lokasi
    );
  }

  // Filter berdasarkan kategori dropdown
  if (katFilter) {
    data = data.filter(m => m.kategori === katFilter); // Ambil hanya kategori yang dipilih
  }

  // Kalo gak ada makanan, tampilkan pesan "Tidak ada data"
  if (data.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('d-none');
    return;
  }

  if (emptyState) emptyState.classList.add('d-none');

  // Buat baris tabel untuk setiap makanan
  tbody.innerHTML = data.map((m, i) => { // Looping setiap item makanan, i = nomor urut (0, 1, 2...)
    const { teks: statusTeks, kelas: statusKelas } = hitungStatus(m.tanggalKedaluwarsa); // Ambil status & warna statusnya
    const namaAman = escapeHtml(m.nama); // Amankan nama agar gak ada karakter HTML yang bikin error atau XSS
    return `
      <tr>
        <td class="text-center text-muted small" data-label="#">${i + 1}</td>
        <td class="fw-semibold" data-label="Nama">${namaAman}</td>
        <td data-label="Kategori"><span class="badge badge-hijau rounded-pill">${escapeHtml(m.kategori)}</span></td>
        <td data-label="Tgl. Kedaluwarsa">${formatTanggal(m.tanggalKedaluwarsa)}</td>
        <td data-label="Status"><span class="${statusKelas}">${statusTeks}</span></td>
        <td data-label="Lokasi">${escapeHtml(m.lokasiPenyimpanan)}</td>
        <td data-label="Catatan" class="text-muted small">${m.catatan ? escapeHtml(m.catatan) : '–'}</td>
        <td data-label="Aksi">
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-secondary rounded-2" onclick="editMakanan('${m.id}')" title="Edit" aria-label="Edit ${namaAman}">
              <i class="bi bi-pencil" aria-hidden="true"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger rounded-2" onclick="hapusMakanan('${m.id}')" title="Hapus" aria-label="Hapus ${namaAman}">
              <i class="bi bi-trash" aria-hidden="true"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join(''); // Gabungin semua baris jadi satu string HTML
}

// Tentuin status makanan (aman, segera, atau kedaluwarsa)
function hitungStatus(tanggal) {
  const sekarang = new Date(); // Ambil tanggal hari ini
  sekarang.setHours(0, 0, 0, 0); // Set jamnya jadi 00:00 biar perbandingan rapi per hari (jangan sampai ngaruh jam)
  const exp = new Date(tanggal); // Tanggal kedaluwarsa
  const selisihHari = Math.ceil((exp - sekarang) / (1000 * 60 * 60 * 24)); // Hitung selisih hari antara hari ini & tanggal kedaluwarsa

  if (selisihHari < 0) return { teks: 'Kedaluwarsa', kelas: 'status-kedaluwarsa' }; // kalo udah lewat, jadi kedaluwarsa
  if (selisihHari <= 7) return { teks: `${selisihHari}h lagi`, kelas: 'status-segera' }; // Tinggal 7 hari atau kurang, segera habiskan
  return { teks: `${selisihHari}h lagi`, kelas: 'status-aman' }; // Masih lama, aman
}

// Update ringkasan statistik (total, aman, segera, kedaluwarsa)
function updateRingkasan() {
  const sekarang = new Date();
  sekarang.setHours(0, 0, 0, 0);

  // Ambil elemen untuk menampilkan ringkasan
  const totalEl = document.getElementById('ringkasan-total');
  const amanEl = document.getElementById('ringkasan-aman');
  const segeraEl = document.getElementById('ringkasan-segera');
  const expEl = document.getElementById('ringkasan-exp');

  if (!totalEl) return;

  // Hitung jumlah makanan berdasarkan status
  const total = daftarMakanan.length;
  const kedaluwarsa = daftarMakanan.filter(m => new Date(m.tanggalKedaluwarsa) < sekarang).length; // .length = jumlah elemen
  const segera = daftarMakanan.filter(m => {
    const selisih = Math.ceil((new Date(m.tanggalKedaluwarsa) - sekarang) / (1000 * 60 * 60 * 24));
    return selisih >= 0 && selisih <= 7; 
  }).length;
  const aman = total - kedaluwarsa - segera; // Sisa yang tidak segera & tidak kedaluwarsa

  // Update HTML dengan angka statistik
  totalEl.textContent = total;
  amanEl.textContent = aman;
  segeraEl.textContent = segera;
  expEl.textContent = kedaluwarsa;
}

// ── Helpers
// Format tanggal ke format Indonesia
function formatTanggal(tgl) {
  if (!tgl) return '–';
  const d = new Date(tgl);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); 
  // toLocaleDateString() = format tanggal sesuai locale
}

// Escape HTML special characters untuk cegah XSS (security)
function escapeHtml(str) {
  const d = document.createElement('div'); // Buat element div temporary
  d.appendChild(document.createTextNode(str || '')); // appendChild + createTextNode = cara aman convert string, auto escape HTML
  return d.innerHTML; // innerHTML = ambil HTML string hasil escape
}