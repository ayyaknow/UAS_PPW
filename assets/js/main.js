
document.addEventListener('DOMContentLoaded', () => {
  inisialisasiNavbar();
  inisialisasiAOS();
});

// ── Navbar scroll effect
function inisialisasiNavbar() {
  const navbar = document.getElementById('navbar-utama');
  if (!navbar) return;

  const updateNavbar = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('navbar-scroll');
    } else {
      navbar.classList.remove('navbar-scroll');
    }
  };

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();
}

// ── AOS init
function inisialisasiAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      once: true,
      offset: 60,
      disable: window.innerWidth < 768 ? true : false,
    });
  }
}

// ── Toast notifikasi ──
// Animasi & warna sudah didefinisikan sekali di style.css
// (.toast-wasteless / @keyframes masukToast) supaya tidak
// perlu tulis ulang <style> baru setiap kali toast muncul.
function tampilkanToast(pesan, tipe = 'sukses') {
  const kelasTipe = tipe === 'sukses' ? 'toast-sukses' : 'toast-gagal';
  const ikon = tipe === 'sukses' ? 'bi-check-circle-fill' : 'bi-x-circle-fill';

  const toast = document.createElement('div');
  // Set class dan atribut untuk toast
  toast.className = `toast-wasteless ${kelasTipe}`; // class toast-wasteless sudah didefinisikan di style.css
  toast.setAttribute('role', 'status'); // role status untuk screen reader
  toast.setAttribute('aria-live', 'polite'); // aria-live polite supaya screen reader membaca pesan toast
  toast.innerHTML = `<i class="bi ${ikon}" aria-hidden="true"></i> ${pesan}`; // ikon bootstrap + pesan toast
  // Tambahkan toast ke body dan tampilkan
  document.body.appendChild(toast);

  setTimeout(() => {
    // Hapus toast setelah 3 detik dengan animasi keluar
    toast.classList.add('toast-keluar');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}