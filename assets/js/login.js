
document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const tombolSosmed = document.querySelectorAll('.sosmed-btn');

  if (formLogin) {
    // Validasi form login
    formLogin.addEventListener('submit', (e) => { 
      e.preventDefault(); // Cegah form submit default supaya bisa validasi dulu
      if (!formLogin.checkValidity()) {
        // Jika form tidak valid, tambahkan class 'was-validated' untuk menampilkan pesan validasi
        formLogin.classList.add('was-validated');
        return;
      }
      // Jika form valid, tampilkan spinner dan simulasikan proses login
      tampilkanSpinner('tombol-login');
      // Simulasi proses login
      setTimeout(() => {
        // Reset form dan tampilkan pesan sukses
        formLogin.reset();
        formLogin.classList.remove('was-validated');
        tampilkanPesan('Berhasil masuk! Selamat datang kembali.', 'sukses');
        sembunyikanSpinner('tombol-login', 'Masuk');
      }, 1200); // delay 1.2 detik untuk simulasi proses login
    });
  }

  if (formRegister) {
    // Validasi form register
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      // Cek validitas form
      if (!formRegister.checkValidity()) {
        // Jika form tidak valid, tambahkan class 'was-validated' untuk menampilkan pesan validasi
        formRegister.classList.add('was-validated');
        return;
      }
      // Cek kecocokan kata sandi
      const sandi = document.getElementById('sandi-register')?.value;
      const konfirmSandi = document.getElementById('konfirm-sandi')?.value;
      // Jika kata sandi tidak cocok, tampilkan pesan gagal
      if (sandi !== konfirmSandi) {
        tampilkanPesan('Kata sandi tidak cocok.', 'gagal');
        return;
      }
      // Jika form valid dan kata sandi cocok, tampilkan spinner dan simulasikan proses register
      tampilkanSpinner('tombol-register');
      setTimeout(() => {
        formRegister.reset();
        formRegister.classList.remove('was-validated');
        tampilkanPesan('Akun berhasil dibuat! Silakan masuk.', 'sukses');
        sembunyikanSpinner('tombol-register', 'Daftar');
        pindahKeTab('tab-login');
      }, 1200);
    });
  }

  // Tombol sosial media (Google, Facebook, dll) hanya demo, fungsi ini menampilkan toast notifikasi saja
  tombolSosmed.forEach(tombol => {
    tombol.addEventListener('click', () => {
      const platform = tombol.dataset.platform || 'platform ini';
      tampilkanToast(`Masuk dengan ${platform} (demo)`, 'sukses');
    });
  });
});

function tampilkanSpinner(idTombol) {
  // fungsi untuk menampilkan spinner pada tombol saat proses login/register sedang berlangsung
  const tombol = document.getElementById(idTombol);
  if (!tombol) return;
  tombol.disabled = true;
  // Ganti teks tombol dengan spinner dan teks "Memproses..."
  tombol.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Memproses...`;
}

function sembunyikanSpinner(idTombol, teks) {
  // fungsi untuk mengembalikan tombol ke keadaan semula setelah proses selesai
  const tombol = document.getElementById(idTombol);
  if (!tombol) return;
  tombol.disabled = false;
  tombol.textContent = teks;
}

// Fungsi untuk menampilkan pesan sukses/gagal di atas form login/register
function tampilkanPesan(pesan, tipe) {
  const container = document.getElementById('pesan-login');
  if (!container) return;
  const warna = tipe === 'sukses' ? 'success' : 'danger'; // custom warna bootstrap alert
  const ikon = tipe === 'sukses' ? 'check-circle' : 'exclamation-circle'; // ikon bootstrapnya
  // Tampilkan pesan di dalam container
  container.innerHTML = `
    <div class="alert alert-${warna} d-flex align-items-center gap-2 py-2 small" role="alert">
      <i class="bi bi-${ikon}"></i> ${pesan}
    </div>`;
    // Hapus pesan setelah 4 detik
  setTimeout(() => { container.innerHTML = ''; }, 4000);
}

// Fungsi untuk pindah ke tab login/register setelah register berhasil
function pindahKeTab(tabId) {
  const tab = document.getElementById(tabId);
  // Gunakan Bootstrap Tab API untuk menampilkan tab yang diinginkan
  if (tab) new bootstrap.Tab(tab).show(); // pastikan tabId sesuai dengan id tab yang ada di HTML
}