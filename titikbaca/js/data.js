/**
 * data.js — Katalog 8 E-Book Kurasi TitikBaca
 * Bahasa Indonesia autentik dengan metadata lengkap, tema sampul editorial,
 * dan cuplikan Bab 1 yang utuh untuk pratinjau baca & unduhan.
 */

(() => {
  'use strict';

  const CATEGORIES = [
    'Semua',
    'Rekayasa Perangkat Lunak',
    'Desain Produk',
    'Bisnis & Karier',
    'Data & Analitik'
  ];

  const BOOKS = [
    {
      id: 'arsitektur-frontend-bertahan-lama',
      title: 'Arsitektur Frontend yang Bertahan Lama',
      subtitle: 'Merancang antarmuka modular, terukur, dan mudah dirawat lintas siklus tim.',
      author: 'Dimas Prakoso',
      authorRole: 'Principal Frontend Engineer',
      category: 'Rekayasa Perangkat Lunak',
      price: 99000,
      pages: 296,
      year: 2025,
      language: 'Bahasa Indonesia',
      format: 'PDF & EPUB',
      isbn: '978-623-8912-01-4',
      rating: 4.9,
      reviewCount: 142,
      recommendRank: 1,
      badge: 'Pilihan Kurator',
      coverTheme: {
        bg: '#1E2433',
        text: '#FAFAFA',
        mutedText: '#C5CAE6',
        accentPrimary: '#9FA5D5',
        accentSecondary: '#FED7B8',
        pattern: 'arch-grid',
        editionCode: 'TB—01'
      },
      synopsis: [
        'Banyak aplikasi web dibangun dengan kecepatan tinggi di bulan pertama, lalu melambat drastis saat fitur bertambah dan anggota tim silih berganti. Buku ini mengurai pola arsitektur frontend yang tahan uji waktu—tanpa terikat pada tren framework sesaat.',
        'Disusun dari pengalaman nyata menangani migrasi kode skala produksi di perusahaan teknologi Indonesia, Dimas Prakoso membahas pemisahan batas domain, manajemen state yang jernih, strategi pengujian yang masuk akal, hingga disiplin performa halaman.'
      ],
      highlights: [
        'Menentukan batas modul UI dan logika bisnis agar fitur baru tidak merusak fitur lama',
        'Pola manajemen state yang minim efek samping dan mudah dilacak saat debugging',
        'Checklist audit performa rendering, ukuran bundle, dan aksesibilitas antarmuka',
        'Studi kasus refaktorisasi bertahap pada proyek aktif tanpa menghentikan rilis'
      ],
      sampleChapter: {
        number: 'Bab 1',
        title: 'Mengapa Kode Frontend Cepat Menua',
        readingTime: '5 menit baca',
        paragraphs: [
          'Hampir setiap tim produk pernah mengalami momen yang sama: sebuah halaman yang dulu selesai dalam dua hari kini membutuhkan dua pekan hanya untuk menambahkan satu kolom filter baru. Tidak ada yang menulis kode buruk dengan sengaja. Yang biasanya terjadi adalah serangkaian keputusan kecil yang masuk akal secara terpisah, tetapi saling mengikat secara diam-diam di dalam satu pohon komponen.',
          'Ketika kita membicarakan arsitektur frontend, godaan terbesarnya adalah langsung memilih nama pustaka atau struktur folder yang sedang ramai dibicarakan. Padahal, arsitektur bukan sekadar tempat kita menaruh berkas. Arsitektur adalah kesepakatan tentang bagian mana yang boleh berubah cepat dan bagian mana yang harus tetap stabil agar keseluruhan sistem tidak goyah.',
          'Pada aplikasi yang sehat, perubahan gaya visual pada sebuah kartu produk tidak seharusnya memaksa kita menyentuh logika kalkulasi harga atau mekanisme penyimpanan data lokal. Sebaliknya, ketika aturan bisnis berubah—misalnya batas pembelian produk digital ditetapkan satu unit per judul—tampilan antarmuka cukup merespons satu sumber kebenaran yang jelas.',
          'Sepanjang buku ini, kita akan membedah kebiasaan merancang komponen yang lugas, menjaga alur data tetap searah, serta menulis kontrak antarmodul yang mudah dibaca oleh rekan kerja baru enam bulan dari sekarang. Tujuannya sederhana: membuat tim tetap percaya diri setiap kali menekan tombol rilis.'
        ]
      }
    },
    {
      id: 'sistem-desain-skala-menengah',
      title: 'Sistem Desain untuk Produk Skala Menengah',
      subtitle: 'Menjaga konsistensi visual dan kecepatan kolaborasi tanpa birokrasi berlebih.',
      author: 'Raka Mahendra',
      authorRole: 'Lead Product Designer',
      category: 'Desain Produk',
      price: 89000,
      pages: 248,
      year: 2025,
      language: 'Bahasa Indonesia',
      format: 'PDF & EPUB',
      isbn: '978-623-8912-02-1',
      rating: 4.9,
      reviewCount: 118,
      recommendRank: 2,
      badge: 'Terlaris',
      coverTheme: {
        bg: '#FCEAD9',
        text: '#111827',
        mutedText: '#4B5563',
        accentPrimary: '#9FA5D5',
        accentSecondary: '#111827',
        pattern: 'swiss-blocks',
        editionCode: 'TB—02'
      },
      synopsis: [
        'Sebagian besar panduan sistem desain ditulis untuk perusahaan dengan ratusan desainer dan tim khusus perpustakaan komponen. Realitanya, banyak tim produk bekerja dengan dua hingga lima desainer yang juga harus mengejar tenggat fitur mingguan.',
        'Raka Mahendra menyajikan pendekatan pragmatis membangun token warna, skala tipografi, komponen inti, serta dokumentasi ringan yang benar-benar dipakai oleh desainer maupun insinyur frontend sehari-hari.'
      ],
      highlights: [
        'Merumuskan token warna semantik dan skala spasi yang konsisten di Figma maupun CSS',
        'Memilih komponen prioritas agar sistem desain cepat terasa manfaatnya dalam 30 hari',
        'Alur serah terima (handoff) tanpa miskomunikasi antara desainer dan developer',
        'Cara merawat sistem desain agar tidak menjadi katalog mati yang diabaikan tim'
      ],
      sampleChapter: {
        number: 'Bab 1',
        title: 'Konsistensi Bukan Berarti Kaku',
        readingTime: '5 menit baca',
        paragraphs: [
          'Kesalahpahaman paling umum tentang sistem desain adalah menganggapnya sebagai kumpulan aturan kaku yang mematikan kreativitas. Di banyak tim, kata "sistem desain" justru memicu kekhawatiran akan rapat persetujuan yang panjang dan berkas pustaka yang sulit diperbarui.',
          'Padahal, sistem desain yang baik bekerja seperti tata bahasa yang jernih. Ia tidak mendikte cerita apa yang harus kita tulis, melainkan memastikan setiap kalimat dapat dipahami pembaca tanpa kebingungan. Ketika ukuran tombol, kontras teks, dan ritme jarak sudah disepakati bersama, desainer bebas memusatkan tenaga pada alur pengguna yang benar-benar rumit.',
          'Untuk tim skala menengah, kesalahan paling mahal adalah menyalin arsitektur sistem desain perusahaan raksasa secara mentah-mentah. Anda tidak membutuhkan empat puluh varian tombol jika produk Anda hanya memakai empat tingkat penekanan aksi. Mulailah dari pola yang paling sering muncul di layar pengguna: navigasi, kartu konten, formulir, dan dialog konfirmasi.',
          'Di bab-bab berikutnya, kita akan menyusun fondasi yang ramping namun tegas—cukup terstruktur untuk mencegah inkonsistensi visual, sekaligus cukup luwes untuk tumbuh mengikuti arah bisnis produk Anda.'
        ]
      }
    },
    {
      id: 'sql-pemodelan-data-keputusan',
      title: 'SQL & Pemodelan Data untuk Pengambilan Keputusan',
      subtitle: 'Dari kueri analitik yang rapi hingga metrik bisnis yang dapat dipercaya.',
      author: 'Reza Fadillah',
      authorRole: 'Staff Analytics Engineer',
      category: 'Data & Analitik',
      price: 149000,
      pages: 364,
      year: 2026,
      language: 'Bahasa Indonesia',
      format: 'PDF & EPUB',
      isbn: '978-623-8912-03-8',
      rating: 4.9,
      reviewCount: 96,
      recommendRank: 3,
      badge: 'Edisi Baru',
      coverTheme: {
        bg: '#1F242D',
        text: '#F9FAFB',
        mutedText: '#D1D5DB',
        accentPrimary: '#FED7B8',
        accentSecondary: '#9FA5D5',
        pattern: 'data-bars',
        editionCode: 'TB—03'
      },
      synopsis: [
        'Dashboard yang penuh grafik tidak ada artinya jika definisi metrik di baliknya saling bertabrakan antar divisi. Buku ini menjembatani keterampilan menulis SQL tingkat lanjut dengan disiplin pemodelan data untuk kebutuhan analisis bisnis modern.',
        'Dilengkapi contoh skema transaksi e-commerce, retensi pelanggan, dan atribusi promo, Reza Fadillah membantu analis data dan manajer produk membangun lapisan data yang transparan, cepat, dan mudah diaudit.'
      ],
      highlights: [
        'Teknik window function, CTE bertingkat, dan optimasi kueri pada tabel jutaan baris',
        'Memisahkan tabel mentah, staging, dan mart agar definisi omzet tidak ganda',
        'Menganalisis retensi kohort, konversi corong, serta efektivitas kode promo',
        'Standar pengujian kualitas data untuk mendeteksi anomali sebelum rapat direksi'
      ],
      sampleChapter: {
        number: 'Bab 1',
        title: 'Ketika Dua Dashboard Menunjukkan Angka Berbeda',
        readingTime: '6 menit baca',
        paragraphs: [
          'Rapat evaluasi bulanan sering kali terhenti bukan karena kurangnya data, melainkan karena terlalu banyak versi kebenaran. Tim pemasaran melaporkan lonjakan transaksi sebesar dua puluh persen, sementara laporan keuangan mencatat pertumbuhan yang datar. Setelah ditelusuri, keduanya benar menurut kueri masing-masing—satu menghitung pesanan yang masuk, satu lagi hanya menghitung pembayaran yang terverifikasi.',
          'Masalah seperti ini tidak bisa diselesaikan hanya dengan menghafal sintaks SQL yang lebih canggih. Akarnya terletak pada cara kita memodelkan peristiwa bisnis ke dalam tabel yang terstruktur. Setiap angka penting di perusahaan membutuhkan satu definisi eksplisit, satu batas waktu yang seragam, dan satu tempat rujukan.',
          'Pemodelan data yang baik memperlakukan kueri analitik seperti kode perangkat lunak: modular, mudah dibaca oleh rekan satu tim, dan dilengkapi pemeriksaan kewajaran. Saat kita memecah kueri panjang tiga ratus baris menjadi lapisan transformasi yang kecil dan jelas, kesalahan logika jauh lebih cepat terlihat.',
          'Melalui studi kasus toko digital dari hulu ke hilir, buku ini akan memandu Anda merancang tabel fakta dan dimensi yang bersih sehingga setiap keputusan strategis berangkat dari angka yang benar-benar kokoh.'
        ]
      }
    },
    {
      id: 'strategi-produk-nol-pelanggan-pertama',
      title: 'Strategi Produk dari Nol hingga Pelanggan Pertama',
      subtitle: 'Panduan memvalidasi masalah nyata, menetapkan harga, dan meluncurkan versi perdana.',
      author: 'Bagas Hartono',
      authorRole: 'Product Strategist & Pendiri Studio Digital',
      category: 'Bisnis & Karier',
      price: 129000,
      pages: 340,
      year: 2025,
      language: 'Bahasa Indonesia',
      format: 'PDF & EPUB',
      isbn: '978-623-8912-04-5',
      rating: 4.8,
      reviewCount: 109,
      recommendRank: 4,
      badge: 'Pilihan Kurator',
      coverTheme: {
        bg: '#272E4A',
        text: '#FAFAFA',
        mutedText: '#D5D9EE',
        accentPrimary: '#FED7B8',
        accentSecondary: '#9FA5D5',
        pattern: 'orbit-rings',
        editionCode: 'TB—04'
      },
      synopsis: [
        'Banyak produk digital gagal bukan karena teknologinya kurang mutakhir, melainkan karena dibangun terlalu lama sebelum bertemu pengguna yang bersedia membayar. Buku ini menguraikan langkah sistematis mengubah ide kasar menjadi produk komersial yang fokus.',
        'Mulai dari wawancara calon pelanggan yang tidak bias, perumusan proposisi nilai yang tajam, penentuan strategi harga awal, hingga merancang pengalaman peluncuran yang meyakinkan untuk pasar Indonesia.'
      ],
      highlights: [
        'Kerangka riset masalah untuk membedakan keluhan sopan dengan kebutuhan mendesak',
        'Menyusun ruang lingkup versi perdana yang ramping namun layak dibayar',
        'Eksperimen penetapan harga dan penawaran paket tanpa merusak persepsi merek',
        'Pelajaran nyata dari enam peluncuran produk digital independen di Asia Tenggara'
      ],
      sampleChapter: {
        number: 'Bab 1',
        title: 'Jebakan Membangun Sebelum Mendengar',
        readingTime: '5 menit baca',
        paragraphs: [
          'Ada kepuasan tersendiri ketika kita membuka editor kode atau kanvas desain untuk mulai merancang fitur impian. Semuanya terasa produktif: layar mulai terisi, alur terlihat rapi, dan daftar tugas perlahan dicentang satu per satu. Namun tanpa validasi di dunia nyata, produktivitas semacam ini sering kali hanyalah cara paling rapi untuk menunda pertemuan dengan pasar.',
          'Pelanggan tidak membeli daftar fitur yang panjang. Mereka membeli jalan keluar yang lebih singkat, lebih tenang, atau lebih dapat diandalkan atas masalah yang sudah mengganggu pekerjaan mereka sejak lama. Jika kita belum mampu menjelaskan masalah itu dalam dua kalimat sederhana yang diakui sendiri oleh calon pengguna, maka menambah fitur baru hanya akan mempertebal kerumitan.',
          'Mencari sepuluh pelanggan pertama yang bersedia membayar penuh jauh lebih berharga daripada mengumpulkan seribu komentar pujian di media sosial. Transaksi pertama menguji segalanya sekaligus: apakah pesan kita jelas, apakah nilainya sepadan dengan harganya, dan apakah proses pembeliannya cukup mulus untuk menumbuhkan rasa percaya.',
          'Bab ini mengajak Anda menunda asumsi dan mulai memetakan percakapan paling jujur dengan calon pengguna—sebelum satu baris kode produksi pun ditulis.'
        ]
      }
    },
    {
      id: 'mengurai-utang-teknis-tim-berkembang',
      title: 'Mengurai Utang Teknis di Tim Berkembang',
      subtitle: 'Menyeimbangkan kecepatan rilis fitur dengan kesehatan basis kode jangka panjang.',
      author: 'Nadia Kusuma',
      authorRole: 'Engineering Manager',
      category: 'Rekayasa Perangkat Lunak',
      price: 119000,
      pages: 328,
      year: 2026,
      language: 'Bahasa Indonesia',
      format: 'PDF & EPUB',
      isbn: '978-623-8912-05-2',
      rating: 4.8,
      reviewCount: 84,
      recommendRank: 5,
      badge: 'Edisi Baru',
      coverTheme: {
        bg: '#EAEBF7',
        text: '#111827',
        mutedText: '#4B5563',
        accentPrimary: '#FED7B8',
        accentSecondary: '#3E4670',
        pattern: 'layered-steps',
        editionCode: 'TB—05'
      },
      synopsis: [
        'Utang teknis sering menjadi sumber ketegangan abadi antara tim teknik dan pemangku kepentingan bisnis. Insinyur merasa kualitas kode terus tergerus, sementara tim produk merasa perbaikan teknis tidak kunjung menghasilkan dampak yang terlihat.',
        'Nadia Kusuma menawarkan bahasa bersama untuk mengklasifikasikan utang teknis berdasarkan risiko bisnis, menyusun peta jalan perbaikan bertahap, serta membangun kebiasaan dokumentasi keputusan arsitektur (ADR) yang ringkas.'
      ],
      highlights: [
        'Membedakan utang teknis strategis yang terukur dengan kelalaian kualitas yang mahal',
        'Cara mempresentasikan biaya perawatan sistem dalam bahasa dampak bisnis',
        'Teknik Strangler Fig dan feature flag untuk pembaruan sistem tanpa downtime',
        'Template Architecture Decision Record (ADR) satu halaman untuk tim sibuk'
      ],
      sampleChapter: {
        number: 'Bab 1',
        title: 'Utang Teknis Bukan Selalu Musuh',
        readingTime: '5 menit baca',
        paragraphs: [
          'Di banyak ruang diskusi rekayasa perangkat lunak, istilah "utang teknis" sering diucapkan dengan nada cemas—seolah-olah setiap kompromi arsitektur adalah kegagalan profesional. Kenyataannya, sama seperti utang finansial yang terencana, jalan pintas teknis yang diambil secara sadar terkadang justru menyelamatkan momentum bisnis di saat kritis.',
          'Yang berbahaya bukanlah keberadaan utang itu sendiri, melainkan utang yang tidak pernah dicatat dan terus berbunga tanpa pengawasan. Ketika tim tidak lagi mengetahui modul mana yang rapuh atau mengapa sebuah pengecualian ditulis dua tahun lalu, setiap perubahan kecil mulai memicu efek domino yang melelahkan.',
          'Solusi yang sehat jarang berupa proyek "tulis ulang dari nol" yang menghentikan seluruh pengembangan produk selama enam bulan. Sejarah perangkat lunak penuh dengan proyek tulis ulang yang meleset dari jadwal sementara sistem lama tetap harus melayani pengguna setiap hari.',
          'Sebaliknya, tim yang matang mengurai utang teknis secara terukur di setiap siklus kerja—memilih titik gesekan tertinggi, menyederhanakan batas modul sedikit demi sedikit, dan menjaga kepercayaan antara tim produk maupun rekayasa.'
        ]
      }
    },
    {
      id: 'tipografi-hierarki-antarmuka-digital',
      title: 'Tipografi & Hierarki dalam Antarmuka Digital',
      subtitle: 'Prinsip keterbacaan, ritme vertikal, dan komposisi teks untuk web dan aplikasi modern.',
      author: 'Saraswati Wibowo',
      authorRole: 'Editorial & UI Designer',
      category: 'Desain Produk',
      price: 75000,
      pages: 212,
      year: 2026,
      language: 'Bahasa Indonesia',
      format: 'PDF & EPUB',
      isbn: '978-623-8912-06-9',
      rating: 4.8,
      reviewCount: 73,
      recommendRank: 6,
      badge: null,
      coverTheme: {
        bg: '#F6F4EF',
        text: '#111827',
        mutedText: '#4B5563',
        accentPrimary: '#9FA5D5',
        accentSecondary: '#FED7B8',
        pattern: 'editorial-type',
        editionCode: 'TB—06'
      },
      synopsis: [
        'Lebih dari delapan puluh persen informasi di layar web disampaikan melalui teks, namun tipografi sering kali menjadi elemen terakhir yang diperhatikan. Buku ini membedah bagaimana pilihan huruf, jarak baris, dan kontras bobot membentuk kepercayaan pembaca sejak detik pertama.',
        'Dengan perbandingan langsung sebelum dan sesudah pada halaman katalog, formulir pembayaran, dan antarmuka baca panjang, Saraswati Wibowo memberikan panduan praktis yang langsung dapat diterapkan pada proyek web sehari-hari.'
      ],
      highlights: [
        'Memadukan huruf serif editorial dan sans-serif geometris secara seimbang',
        'Menghitung panjang baris ideal (measure) dan ritme spasi agar mata tidak cepat lelah',
        'Membangun hierarki visual yang kuat cukup dengan skala ukuran, bobot, dan warna netral',
        'Audit kontras keterbacaan WCAG untuk layar laptop, ponsel, hingga proyektor ruang rapat'
      ],
      sampleChapter: {
        number: 'Bab 1',
        title: 'Antarmuka yang Tenang Dimulai dari Huruf',
        readingTime: '4 menit baca',
        paragraphs: [
          'Ketika seseorang membuka sebuah situs web dan langsung merasa situs tersebut "rapi dan dapat dipercaya", ia jarang menyadari bahwa kesan itu sebagian besar lahir dari keputusan tipografi. Sebelum sempat membaca kalimat pertama secara utuh, mata kita sudah memindai perbandingan ukuran judul, ruang kosong di sekeliling paragraf, dan ketegasan kontras antara teks dengan latar belakangnya.',
          'Banyak antarmuka modern terlihat melelahkan bukan karena terlalu sedikit hiasan, melainkan karena setiap elemen berteriak dengan volume yang sama. Ketika label kategori, judul utama, harga, dan tombol aksi sama-sama berebut perhatian menggunakan warna mencolok, pengguna kehilangan jangkar visual untuk mulai membaca.',
          'Hierarki yang baik justru bekerja lewat penahanan diri. Dengan membatasi skala ukuran yang terencana serta memanfaatkan ruang putih secara sadar, kita menuntun pandangan pembaca secara alami: dari judul besar, turun ke keterangan ringkas, lalu berhenti tepat di tombol keputusan.',
          'Dalam bab ini, kita akan melatih kepekaan terhadap proporsi huruf dan melihat bagaimana perubahan kecil pada jarak antarbaris dapat mengubah halaman biasa menjadi pengalaman membaca yang berkelas.'
        ]
      }
    },
    {
      id: 'catatan-negosiasi-komunikasi-profesional',
      title: 'Catatan Negosiasi & Komunikasi untuk Profesional Muda',
      subtitle: 'Kerangka percakapan jernih untuk presentasi gagasan, batas kerja, dan kompensasi.',
      author: 'Larasati Putri',
      authorRole: 'Konsultan Kepemimpinan & Karier',
      category: 'Bisnis & Karier',
      price: 59000,
      pages: 184,
      year: 2025,
      language: 'Bahasa Indonesia',
      format: 'PDF & EPUB',
      isbn: '978-623-8912-07-6',
      rating: 4.8,
      reviewCount: 127,
      recommendRank: 7,
      badge: 'Terlaris',
      coverTheme: {
        bg: '#F3ECE4',
        text: '#111827',
        mutedText: '#4B5563',
        accentPrimary: '#9FA5D5',
        accentSecondary: '#FED7B8',
        pattern: 'minimal-bands',
        editionCode: 'TB—07'
      },
      synopsis: [
        'Kualitas kerja yang solid sering kali belum cukup jika tidak disertai kemampuan menyampaikan gagasan secara terstruktur dan bernegosiasi dengan tenang. Buku ringkas ini dirancang khusus untuk profesional di awal hingga pertengahan karier.',
        'Berisi skenario percakapan nyata—mulai dari menyepakati tenggat proyek yang realistis, menyampaikan ketidaksetujuan tanpa memicu defensif, hingga menyiapkan argumen berbasis bukti saat evaluasi gaji tahunan.'
      ],
      highlights: [
        'Struktur komunikasi piramida agar presentasi dan pesan tertulis langsung pada inti',
        'Teknik menolak permintaan tambahan secara profesional dengan opsi solusi konkret',
        'Persiapan data pencapaian sebelum sesi review kinerja dan negosiasi kompensasi',
        'Contoh naskah email dan transkrip diskusi yang relevan dengan budaya kerja di Indonesia'
      ],
      sampleChapter: {
        number: 'Bab 1',
        title: 'Kejelasan adalah Bentuk Rasa Hormat',
        readingTime: '4 menit baca',
        paragraphs: [
          'Di lingkungan kerja yang menghargai kesopanan tinggi, kita kerap keliru menyamakan sikap ramah dengan kalimat yang berputar-putar. Akibatnya, pesan penting tersamar di balik pengantar panjang, sementara lawan bicara pulang dari rapat dengan pemahaman yang berbeda mengenai apa yang sebenarnya disepakati.',
          'Komunikasi yang tegas tidak harus terdengar dingin atau konfrontatif. Justru sebaliknya, menyampaikan tujuan, kendala, dan usulan langkah berikutnya secara jernih adalah bentuk rasa hormat tertinggi terhadap waktu rekan kerja dan atasan Anda.',
          'Hal yang sama berlaku dalam negosiasi. Banyak profesional muda membayangkan negosiasi sebagai adu kuat di mana satu pihak harus menang dan pihak lain kalah. Padahal, negosiasi karier yang paling produktif berbentuk pemecahan masalah bersama: bagaimana nilai yang Anda bawa selaras dengan target organisasi.',
          'Sepanjang catatan ini, kita akan berlatih mengganti keraguan dengan persiapan data yang tenang, sehingga setiap percakapan penting terasa lebih ringan dan terarah.'
        ]
      }
    },
    {
      id: 'bercerita-dengan-angka-visualisasi-praktis',
      title: 'Bercerita dengan Angka: Panduan Visualisasi Praktis',
      subtitle: 'Mengubah tabel mentah menjadi grafik yang jujur, ringkas, dan mudah dipahami audiens.',
      author: 'Ayu Kartika',
      authorRole: 'Senior Data Storyteller',
      category: 'Data & Analitik',
      price: 49000,
      pages: 176,
      year: 2025,
      language: 'Bahasa Indonesia',
      format: 'PDF & EPUB',
      isbn: '978-623-8912-08-3',
      rating: 4.7,
      reviewCount: 91,
      recommendRank: 8,
      badge: null,
      coverTheme: {
        bg: '#E6E8F5',
        text: '#111827',
        mutedText: '#4B5563',
        accentPrimary: '#FED7B8',
        accentSecondary: '#38406B',
        pattern: 'arc-curves',
        editionCode: 'TB—08'
      },
      synopsis: [
        'Menyajikan analisis yang cemerlang di hadapan audiens non-teknis membutuhkan lebih dari sekadar menyalin grafik bawaan spreadsheet ke dalam salindia presentasi. Buku praktis ini membahas seni menyederhanakan data tanpa menyederhanakan kebenaran.',
        'Ayu Kartika memaparkan cara memilih jenis grafik yang tepat untuk setiap pertanyaan bisnis, menghapus gangguan visual yang tidak perlu, serta menulis judul grafik yang langsung menyorot temuan utama.'
      ],
      highlights: [
        'Matriks pemilihan grafik berdasarkan tujuan: perbandingan, tren, komposisi, dan distribusi',
        'Teknik mengurangi clutter visual agar fokus audiens tertuju pada satu sinyal penting',
        'Menghindari bias skala sumbu dan warna yang menyesatkan pembaca laporan',
        'Panduan menyusun salindia laporan bulanan yang selesai dibaca dalam lima menit'
      ],
      sampleChapter: {
        number: 'Bab 1',
        title: 'Satu Grafik, Satu Pesan Utama',
        readingTime: '4 menit baca',
        paragraphs: [
          'Pernahkah Anda duduk di ruang presentasi dan menatap sebuah grafik penuh garis warna-warni selama setengah menit, namun tetap tidak yakin kesimpulan apa yang ingin disampaikan pembicara? Kondisi itu terjadi ketika kita memperlakukan grafik sebagai tempat menampung seluruh isi spreadsheet, bukan sebagai alat bantu berpikir.',
          'Tugas utama visualisasi data bukanlah memamerkan seberapa banyak angka yang berhasil kita kumpulkan, melainkan mempercepat pemahaman audiens terhadap pola yang relevan. Jika sebuah garis kisi, legenda berulang, atau label desimal dua angka di belakang koma tidak membantu pengambilan keputusan, menyingkirkannya justru membuat data berbicara lebih lantang.',
          'Perubahan paling cepat yang dapat Anda terapkan mulai hari ini terletak pada judul grafik. Alih-alih menulis judul deskriptif seperti "Penjualan Kuartal III per Kategori", tuliskan temuan utamanya: "Kategori Rekayasa Perangkat Lunak Menyumbang 42% Pertumbuhan Kuartal III". Audiens langsung menangkap konteks bahkan sebelum memindai sumbu angka.',
          'Di buku ini, kita akan membedah puluhan contoh laporan nyata dan merapikannya langkah demi langkah hingga setiap visual memiliki alur cerita yang jernih.'
        ]
      }
    }
  ];

  window.TitikBaca = window.TitikBaca || {};
  window.TitikBaca.CATEGORIES = CATEGORIES;
  window.TitikBaca.BOOKS = BOOKS;
})();
