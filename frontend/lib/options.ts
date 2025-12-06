const genderOptions = [
    "Laki-laki",
    "Perempuan",
  ];

const perkawinanOptions = [
"Belum Menikah",
"Menikah",
"Cerai Hidup",
"Cerai Mati",
];

const agamaOptions = [
"Islam",
"Kristen",
"Katolik",
"Hindu",
"Buddha",
"Konghucu",
];

const hubunganOptions = [
"Anak Kandung",
"Cucu",
"Menantu",
"Pasangan",
"Saudara",
"Tetangga",
"Lainnya",
];

const pendidikanOptions = [
"Belum sekolah",
"SD",
"SMP",
"SMA",
"S1",
"S2",
"S3",
"Putus sekolah",
];

const pekerjaanOptions = [
"Belum bekerja",
"Buruh harian lepas",
"Pedagang",
"Wiraswasta",
"Pegawai swasta/honorer",
"PNS/BUMN",
"TNI/Polri",
"Pensiunan",
"Mengurus rumah tangga",
];

const penghasilanOptions = [
"Anak",
"Pasangan",
"Pensiun",
"Bantuan Pemerintah",
"Usaha Sendiri",
"Tabungan Pribadi",
"Lembaga Sosial",
"Kerja Paruh Waktu",
"Sumbangan Masyarakat",
"Tidak Ada",
];

const kesehatanOptions = [
"Sehat",
"Sakit Ringan",
"Sakit Menahun",
"Disabilitas Fisik",
"Disabilitas Mental",
"Dalam Perawatan",
"Lemah Fisik",
];

const bpjsOptions = [
"Mandiri",
"Penerima Bantuan Iuran (PBI)",
"Tidak Punya",
];

const penyakitOptions = [
"Hipertensi",
"Diabetes",
"Asma",
"Jantung",
"Stroke",
"Arthritis",
"Kanker",
"TBC",
"Lainnya",
];

const ketersediaanWaktuOptions = [
"Setiap Hari",
"Beberapa Kali Seminggu",
"Seminggu Sekali",
"Kadang-kadang",
"Jarang",
"Tidak Ada",
];

const obatOptions = [
"Resep Dokter",
"Obat Warung",
"Kadang-kadang",
"Tidak Menggunakan Obat",
];

const alatBantuOptions = [
"Kacamata",
"Tongkat",
"Kursi Roda",
"Alat Bantu Dengar",
"Gigi Palsu",
"Lainnya",
"Tidak Menggunakan",
];

const aktivitasOptions = [
"Setiap Hari",
"Beberapa Kali Seminggu",
"Jarang",
"Tidak Pernah",
];

const giziOptions = [
"Normal",
"Kurus",
"Kurus Sekali",
"Gemuk",
"Obesitas",
];

const imunisasiOptions = [
"Influenza",
"Pneumokokus (PCV)",
"Covid-19",
"Tetanus",
"Hepatitis B",
"Belum Pernah",
];

const dukunganOptions = [
"Sangat Mendukung",
"Mendukung",
"Cukup Mendukung",
"Tidak Mendukung",
"Tidak Ada Dukungan",
];

const rumahOptions = [
"Layak Huni",
"Cukup Layak",
"Tidak Layak",
"Menumpang",
"Tinggal Sendiri",
"Tinggal Bersama Keluarga",
];

const kebutuhanMendesakOptions = [
"Tempat Tinggal",
"Makanan Pokok",
"Obat-obatan",
"Pakaian",
"Pendampingan",
"Alat Bantu Jalan",
"Perawatan Kesehatan",
"Tidak Ada",
];

const hobiOptions = [
"Bercocok Tanam",
"Membaca",
"Menjahit",
"Menonton TV",
"Ibadah",
"Berkumpul dengan Teman",
"Olahraga Ringan",
"Kerajinan Tangan",
"Tidak Ada",
];

const psikologisOptions = [
"Bahagia",
"Cemas",
"Depresi",
"Sering Marah",
"Kesepian",
"Sulit Tidur",
"Labil Emosi",
];

const dataBKLOptions = [
"Aktif",
"Pernah Aktif",
"Tidak Pernah",
"Belum Tahu Program BKL",
];

const riwayatBKLOptions = [
"Penyuluhan",
"Senam Lansia",
"Pelatihan Keluarga",
"Kunjungan Rumah",
"Pembinaan Kesehatan",
"Tidak Pernah",
];

const keterlibatanDanaOptions = [
"Aktif Mengelola Dana",
"Menerima Manfaat Dana",
"Pernah Terlibat",
"Tidak Pernah Terlibat",
"Tidak Tahu Ada Dana",
];



const adlOptions = [
{ key: "bab", label: "BAB (Buang Air Besar)" },
{ key: "bak", label: "BAK (Buang Air Kecil)" },
{ key: "membersihkan_diri", label: "Membersihkan Diri" },
{ key: "toilet", label: "Menggunakan Toilet" },
{ key: "makan", label: "Makan" },
{ key: "pindah_tempat", label: "Pindah Tempat" },
{ key: "mobilitas", label: "Mobilitas" },
{ key: "berpakaian", label: "Berpakaian" },
{ key: "naik_turun_tangga", label: "Naik Turun Tangga" },
{ key: "mandi", label: "Mandi" },
];

const adlGetOptions = (key: string) => {
  if (["mobilitas", "pindah_tempat"].includes(key)) {
    return [
      { value: "0", label: "0 - Tidak Mampu" },
      { value: "1", label: "1 - Butuh Bantuan" },
      { value: "2", label: "2 - Mandiri" },
      { value: "3", label: "3 - Sangat Mandiri" },
    ];
  } else if (["mandi", "membersihkan_diri"].includes(key)) {
    return [
      { value: "0", label: "0 - Tidak Mampu" },
      { value: "1", label: "1 - Mandiri" },
    ];
  } else {
    return [
      { value: "0", label: "0 - Tidak Mampu" },
      { value: "1", label: "1 - Butuh Bantuan" },
      { value: "2", label: "2 - Mandiri" },
    ];
  }
};

export {genderOptions, perkawinanOptions, agamaOptions, pendidikanOptions,
        pekerjaanOptions, penghasilanOptions, kesehatanOptions, penyakitOptions,
        obatOptions, alatBantuOptions, aktivitasOptions, giziOptions, imunisasiOptions,
        dukunganOptions, rumahOptions, kebutuhanMendesakOptions, hobiOptions,
        psikologisOptions, dataBKLOptions, riwayatBKLOptions, keterlibatanDanaOptions,
        adlOptions, adlGetOptions, hubunganOptions, ketersediaanWaktuOptions, bpjsOptions};
