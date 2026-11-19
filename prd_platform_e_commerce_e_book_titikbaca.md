# Product Requirements Document (PRD): TitikBaca — Platform E-Commerce E-Book

## 1. Ringkasan Proyek & Tujuan
* **Nama Produk:** TitikBaca (Platform E-Commerce E-Book Kurasi)
* **Tujuan Proyek:** Membangun aplikasi web e-commerce e-book interaktif berbasis *client-side* untuk kebutuhan demonstrasi sistem secara *end-to-end* (mulai dari eksplorasi katalog, pratinjau isi buku, keranjang belanja, simulasi pembayaran, hingga pengunduhan e-book).
* **Tech Stack Wajib:**
  * **HTML5** (Struktur semantik dan bersih)
  * **Tailwind CSS** (Via CDN dengan konfigurasi warna dan font kustom)
  * **Vanilla JavaScript (ES6+)** (Modular, murni tanpa framework eksternal)
  * **Persistensi Data:** `localStorage` browser sebagai simulasi database agar seluruh perubahan (keranjang, riwayat pembelian, status buku) tetap tersimpan meskipun halaman di-*refresh*.

---

## 2. Panduan Desain Visual & Sistem Warna (Anti-AI Cliché)
Desain harus mengusung gaya **Modern Editorial & Clean Digital Storefront** (terinspirasi dari *Stripe Press*, *Apple Books*, dan *Gumroad*) yang nyaman dipresentasikan dan mudah digunakan.

### Palet Warna Utama
* **Primary Periwinkle:** `#9FA5D5`
* **Secondary Warm Peach:** `#FED7B8`
* **Signature Gradient Utama:** `linear-gradient(135deg, #9FA5D5 0%, #FED7B8 100%)`
* **Signature Gradient Lembut (Hero / Accent Surface):** `linear-gradient(135deg, rgba(159, 165, 213, 0.22) 0%, rgba(254, 215, 184, 0.28) 100%)`

### Warna Netral & Kontras (Keterbacaan Tinggi)
* **Latar Belakang Utama:** `#FAFAFA` (Putih gading lembut agar mata nyaman membaca katalog)
* **Permukaan Kartu (Card Surface):** `#FFFFFF` dengan garis tepi tegas `1px solid #E5E7EB`
* **Teks Utama:** `#111827` (Hitam arang/slate gelap — wajib digunakan di atas area gradient `#9FA5D5`–`#FED7B8` agar rasio kontras tetap tajam dan mudah dibaca di proyektor)
* **Teks Sekunder / Deskripsi:** `#4B5563`
* **Tombol Aksi Utama (Primary CTA):** Latar `#111827` dengan teks `#FFFFFF` (hover `#1F2937`), dipadukan dengan tombol aksen berlatar gradient `#9FA5D5` → `#FED7B8` dan teks `#111827` (`font-semibold`).

### Aturan Ketat Agar Desain Tidak Terlihat "AI Banget"
* **Hindari Estetika AI Generik:** Jangan gunakan *dark mode* neon, efek *glow* bayangan berwarna, *glassmorphism* berlebihan, ikon roket/bintang berkilau generik, atau kalimat klise seperti *"Unlock the future of reading with AI"*.
* **Tipografi Editorial:** Gunakan kombinasi dua font Google Fonts:
  * **Heading & Judul Buku:** `Newsreader` atau `Lora` (Serif modern untuk memberi nuansa literatur dan penerbitan autentik).
  * **UI, Navigasi, Harga & Body:** `Plus Jakarta Sans` (Sans-serif bersih, modern, dan presisi).
* **Identitas Logo TitikBaca:** Tampilkan logo teks `TitikBaca` menggunakan font serif tebal dengan aksen titik kecil berwarna `#9FA5D5` atau ikon buku garis tipis minimalis.
* **Sampul Buku Realistis (Tanpa Gambar Rusak):** Jangan gunakan tautan gambar eksternal yang berisiko *broken link*. Buat komponen sampul buku berasio `2:3` (`aspect-[2/3]`) menggunakan desain tipografi CSS/SVG kustom untuk setiap buku (lengkap dengan judul, nama penulis, aksen geometris minimal, dan variasi palet editorial yang selaras dengan `#9FA5D5` dan `#FED7B8`).
* **Penempatan Gradient yang Terukur:** Gunakan gradient `#9FA5D5` → `#FED7B8` hanya pada elemen fokus utama: panel *Hero Section*, banner promo diskon, bingkai kode QRIS pada halaman *checkout*, dan lencana status buku. Biarkan area katalog tetap bersih dengan latar `#FAFAFA` dan kartu `#FFFFFF`.

---

## 3. Arsitektur File Proyek
Bangun struktur direktori berikut agar kode terorganisir dan mudah dipresentasikan:

```text
titikbaca/
├── index.html          # Beranda, Hero, Filter & Pencarian, Katalog E-Book, Modal Detail & Baca Sampel
├── checkout.html       # Halaman Keranjang Belanja, Kode Promo, & Simulasi Pembayaran QRIS
├── koleksi.html        # Halaman "Pustaka Saya" (Daftar E-Book Terbeli, Web Reader, & Unduh File)
├── css/
│   └── custom.css      # Definisi variabel gradient, font pairing, animasi transisi halus
└── js/
    ├── data.js         # Array of Objects berisi 8 katalog e-book lengkap dengan cuplikan Bab 1
    ├── store.js        # Pengelola state localStorage (cart, ownedBooks, promo)
    ├── app.js          # Logika UI katalog, pencarian real-time, filter kategori, modal preview
    ├── checkout.js     # Logika perhitungan harga, diskon, dan simulasi pembayaran berhasil
    └── library.js      # Logika render koleksi milik pengguna, reader modal, & generator unduhan file
```

---

## 4. Spesifikasi Fitur & Alur Pengguna (User Flow)

### A. Navigasi Global (Sticky Navbar)
* Menampilkan brand **TitikBaca** di sisi kiri, serta menu navigasi **Katalog**, **Pustaka Saya** (dilengkapi *badge* jumlah buku yang sudah dimiliki), dan tombol **Keranjang** (dilengkapi *badge* jumlah item aktif) di sisi kanan.

### B. Halaman Utama & Katalog (`index.html`)
1. **Hero Section Editorial:**
   * Menggunakan latar gradient halus `#9FA5D5` ke `#FED7B8` dengan sudut membulat (`rounded-2xl`), teks gelap `#111827`, judul kurasi yang ringkas, subjudul informatif, dan tombol cepat menuju katalog.
2. **Kontrol Pencarian & Filter:**
   * Input pencarian *real-time* berdasarkan judul atau nama penulis.
   * Tab filter kategori: `Semua`, `Rekayasa Perangkat Lunak`, `Desain Produk`, `Bisnis & Karier`, `Data & Analitik`.
   * Dropdown urutkan berdasarkan: `Rekomendasi`, `Harga Terendah`, `Harga Tertinggi`.
3. **Kartu E-Book:**
   * Menampilkan sampul rasio `2:3`, tag kategori, judul buku, nama penulis, jumlah halaman, rating, dan harga dalam format Rupiah (contoh: `Rp 79.000`).
   * **State Dinamis:**
     * Jika buku belum dibeli & belum ada di keranjang: tombol **`+ Keranjang`** dan tombol **`Detail`**.
     * Jika buku sudah ada di keranjang: tombol berubah menjadi **`Di Keranjang ✓`**.
     * Jika buku sudah dibeli (tersimpan di `ownedBooks`): tombol berubah menjadi **`Buka di Pustaka`** yang mengarah ke `koleksi.html`.

### C. Modal Detail Buku & Pratinjau Gratis (`index.html`)
* Ketika pengguna mengklik kartu buku atau tombol **Detail**, tampilkan modal bersih berisi sinopsis lengkap, metadata (Format: PDF & EPUB, Jumlah Halaman, Tahun Terbit, Bahasa), serta dua tombol:
  * **`Baca Cuplikan Bab 1`:** Mengganti tampilan modal menjadi mode baca (*reader preview*) yang menampilkan 3–4 paragraf pembuka buku dengan tipografi nyaman.
  * **`Tambah ke Keranjang`:** Menambahkan buku ke `localStorage` dan menampilkan notifikasi *toast* di pojok kanan bawah.

### D. Keranjang & Simulasi Checkout (`checkout.html`)
1. **Daftar Item Keranjang:** Menampilkan e-book yang dipilih beserta tombol hapus. Karena produk berupa barang digital, jumlah setiap judul otomatis dibatasi 1 unit.
2. **Fitur Kode Promo:** Input kode diskon dengan petunjuk kecil di bawahnya (gunakan kode `DEMOKAMPUS` untuk potongan 25%).
3. **Panel Pembayaran Simulasi:**
   * Pilihan metode: **QRIS Instan** (menampilkan ilustrasi kode QR SVG di dalam kartu berbingkai gradient `#9FA5D5` → `#FED7B8`) atau **Transfer Virtual Account**.
   * Tombol utama **`Simulasi Pembayaran Berhasil`** (untuk keperluan demo langsung): memproses transaksi dengan indikator *loading* 800ms, memindahkan seluruh item dari keranjang ke daftar `ownedBooks` di `localStorage`, mengosongkan keranjang, dan mengarahkan pengguna ke halaman `koleksi.html` dengan pesan konfirmasi pembelian berhasil.

### E. Pustaka Saya & Pengunduhan File (`koleksi.html`)
* Menampilkan seluruh e-book yang telah dibeli pengguna (beserta tanggal pembelian).
* Jika belum ada buku yang dibeli, tampilkan *empty state* yang rapi dengan tombol kembali ke katalog.
* Setiap buku di koleksi memiliki dua aksi nyata:
  1. **`Baca Sekarang`:** Membuka modal *E-Reader* dengan pengaturan ukuran teks (`Kecil`, `Normal`, `Besar`) untuk membaca konten sampel buku.
  2. **`Unduh E-Book (.txt)`:** Menggunakan JavaScript `Blob` dan `URL.createObjectURL` untuk memicu unduhan file dokumen nyata ke perangkat pengguna (berisi judul, penulis, ringkasan, dan bab sampel buku tersebut) sehingga tombol unduh benar-benar berfungsi saat didemonstrasikan.
* **Utilitas Demo (Footer):** Sediakan tombol teks kecil `Reset Data Demo` di bagian bawah halaman untuk menghapus `localStorage` apabila pengguna ingin mengulang skenario presentasi dari awal.

---

## 5. Instruksi Eksekusi untuk AI Agent
1. Bangun seluruh file (`index.html`, `checkout.html`, `koleksi.html`, `css/custom.css`, dan seluruh modul di folder `js/`) secara lengkap dan fungsional tanpa menyisakan komentar placeholder seperti `// TODO`.
2. Isi `js/data.js` dengan **8 data e-book berbahasa Indonesia** yang realistis (judul berbobot, nama penulis lokal, harga antara `Rp 45.000` hingga `Rp 149.000`, sinopsis meyakinkan, dan teks sampel bab pertama yang utuh).
3. Pastikan seluruh halaman responsif untuk layar desktop (saat presentasi proyektor) maupun perangkat mobile, serta bebas dari error konsol JavaScript saat dibuka langsung melalui browser atau *Live Server*.