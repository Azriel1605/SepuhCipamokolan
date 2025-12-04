from faker import Faker
from flask_sqlalchemy import SQLAlchemy
import random
from datetime import datetime
from models import Lansia, KesehatanLansia, KesejahteraanSosial, KeluargaPendamping, ADailyLiving

db = SQLAlchemy()

fake = Faker('id_ID') # Menggunakan locale Indonesia untuk data yang lebih relevan

genderOptions = [
"Laki-laki",
"Perempuan",
]

perkawinanOptions = [
"Belum menikah",
"Menikah",
"Cerai Hidup",
"Cerai Mati",
]

agamaOptions = [
"Islam",
"Kristen",
"Katolik",
"Hindu",
"Buddha",
"Konghucu",
]

hubunganOptions = [
"Anak",
"Cucu",
"Menantu",
"Pasangan",
"Saudara",
"Tetangga",
"Lainnya",
]

pendidikanOptions = [
"Belum sekolah",
"SD",
"SMP",
"SMA",
"S1",
"S2",
"S3",
"Putus sekolah",
]

pekerjaanOptions = [
"Belum bekerja",
"Buruh harian lepas",
"Pedagang",
"Wiraswasta",
"Pegawai swasta/honorer",
"PNS/BUMN",
"TNI/Polri",
"Pensiunan",
"Mengurus rumah tangga",
]

penghasilanOptions = [
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
]

kesehatanOptions = [
"Sehat",
"Sakit Ringan",
"Sakit Menahun",
"Disabilitas Fisik",
"Disabilitas Mental",
"Dalam Perawatan",
"Lemah Fisik",
]

penyakitOptions = [
"Hipertensi",
"Diabetes",
"Asma",
"Jantung",
"Stroke",
"Arthritis",
"Kanker",
"TBC",
"Lainnya",
]

ketersediaanWaktuOptions = [
"Setiap Hari",
"Beberapa Kali Seminggu",
"Seminggu Sekali",
"Kadang-kadang",
"Jarang",
"Tidak Ada",
]

obatOptions = [
"Resep Dokter",
"Obat Warung",
"Kadang-kadang",
"Tidak Menggunakan Obat",
]

alatBantuOptions = [
"Kacamata",
"Tongkat",
"Kursi Roda",
"Alat Bantu Dengar",
"Gigi Palsu",
"Lainnya",
"Tidak Menggunakan",
]

aktivitasOptions = [
"Setiap Hari",
"Beberapa Kali Seminggu",
"Jarang",
"Tidak Pernah",
]

giziOptions = [
"Normal",
"Kurus",
"Kurus Sekali",
"Gemuk",
"Obesitas",
]

imunisasiOptions = [
"Influenza",
"Pneumokokus (PCV)",
"Covid-19",
"Tetanus",
"Hepatitis B",
"Belum Pernah",
]

dukunganOptions = [
"Sangat Mendukung",
"Mendukung",
"Cukup Mendukung",
"Tidak Mendukung",
"Tidak Ada Dukungan",
]

rumahOptions = [
"Layak Huni",
"Cukup Layak",
"Tidak Layak",
"Menumpang",
"Tinggal Sendiri",
"Tinggal Bersama Keluarga",
]

kebutuhanMendesakOptions = [
"Tempat Tinggal",
"Makanan Pokok",
"Obat-obatan",
"Pakaian",
"Pendampingan",
"Alat Bantu Jalan",
"Perawatan Kesehatan",
"Tidak Ada",
]

hobiOptions = [
"Bercocok Tanam",
"Membaca",
"Menjahit",
"Menonton TV",
"Ibadah",
"Berkumpul dengan Teman",
"Olahraga Ringan",
"Kerajinan Tangan",
"Tidak Ada",
]

psikologisOptions = [
"Bahagia",
"Cemas",
"Depresi",
"Sering Marah",
"Kesepian",
"Sulit Tidur",
"Labil Emosi",
]

dataBKLOptions = [
"Aktif",
"Pernah Aktif",
"Tidak Pernah",
"Belum Tahu Program BKL",
]

riwayatBKLOptions = [
"Penyuluhan",
"Senam Lansia",
"Pelatihan Keluarga",
"Kunjungan Rumah",
"Pembinaan Kesehatan",
"Tidak Pernah",
]

keterlibatanDanaOptions = [
"Aktif Mengelola Dana",
"Menerima Manfaat Dana",
"Pernah Terlibat",
"Tidak Pernah Terlibat",
"Tidak Tahu Ada Dana",
]

def generate_fake_data(num_records=1000):
    print(f"Generating {num_records} fake Lansia data...")

    for i in range(num_records):
        # Generate Lansia data
        jenis_kelamin = random.choice(genderOptions)
        # Usia lansia umumnya 60 tahun ke atas.
        # Rentang tanggal lahir yang masuk akal (misal, 60-100 tahun yang lalu)
        birth_year = random.randint(datetime.now().year - 100, datetime.now().year - 59)
        tanggal_lahir = fake.date_of_birth(minimum_age=60, maximum_age=100) # Pastikan rentang usia sesuai
    
        # Generate NIK unik (16 digit)
        nik_prefix = str(random.randint(1000000000000000, 9999999999999999))
        nik = nik_prefix[:16] # Pastikan 16 digit

        lansia = Lansia(
            nama_lengkap=fake.name_male() if jenis_kelamin == 'Laki-laki' else fake.name_female(),
            nik=nik,
            jenis_kelamin=jenis_kelamin,
            tanggal_lahir=tanggal_lahir,
            alamat_lengkap=fake.address(),
            # koordinat=f"{fake.latitude()}, {fake.longitude()}",
            koordinat=f"-",
            rt=str(random.randint(1, 20)),
            rw=str(random.randint(1, 12)),
            status_perkawinan=random.choice(perkawinanOptions),
            agama=random.choice(agamaOptions),
            pendidikan_terakhir=random.choice(pendidikanOptions),
            pekerjaan_terakhir=random.choice(pekerjaanOptions),
            sumber_penghasilan=random.choice(penghasilanOptions)
        )
        db.session.add(lansia)
        db.session.flush() # Digunakan untuk mendapatkan lansia.id sebelum commit

        # Generate KesehatanLansia data
        kesehatan = KesehatanLansia(
            lansia_id=lansia.id,
            kondisi_kesehatan_umum=random.choice(kesehatanOptions),
            riwayat_penyakit_kronis=random.sample(penyakitOptions, k=random.randint(0, 3)),
            penggunaan_obat_rutin=random.choice(obatOptions),
            alat_bantu=random.sample(alatBantuOptions, 3),
            aktivitas_fisik=random.choice(aktivitasOptions),
            status_gizi=random.choice(giziOptions),
            riwayat_imunisasi=random.sample(imunisasiOptions, 3)
        )
        db.session.add(kesehatan)

        # Generate KesejahteraanSosial data
        kesejahteraan = KesejahteraanSosial(
            lansia_id=lansia.id,
            dukungan_keluarga=random.choice(dukunganOptions),
            kondisi_rumah=random.choice(rumahOptions),
            kebutuhan_mendesak=random.sample(kebutuhanMendesakOptions, 3),
            hobi_minat=random.choice(hobiOptions),
            kondisi_psikologis=random.choice(psikologisOptions)
        )
        db.session.add(kesejahteraan)

        # Generate KeluargaPendamping data
        pendamping_usia = random.randint(18, 60)
        pendamping = KeluargaPendamping(
            lansia_id=lansia.id,
            nama_pendamping=fake.name(),
            hubungan_dengan_lansia=random.choice(hubunganOptions),
            tanggal_lahir_pendamping=fake.date_of_birth(minimum_age=18, maximum_age=60),
            pendidikan_pendamping=random.choice(pendidikanOptions),
            ketersediaan_waktu=random.choice(ketersediaanWaktuOptions),
            partisipasi_program_bkl=random.choice(['Ya', 'Tidak']),
            riwayat_partisipasi_bkl=fake.sentence() if random.random() > 0.5 else None,
            keterlibatan_data=fake.sentence() if random.random() > 0.5 else None
        )
        db.session.add(pendamping)

        # Generate ADailyLiving data (Barthel Index-like)
        bab = random.randint(0, 2) # Asumsi skor 0-10
        bak = random.randint(0, 2)
        membersihkan_diri = random.randint(0, 1)
        toilet = random.randint(0, 2)
        makan = random.randint(0, 2)
        pindah_tempat = random.randint(0, 3)
        mobilitas = random.randint(0, 2)
        berpakaian = random.randint(0, 2)
        naik_turun_tangga = random.randint(0, 2)
        mandi = random.randint(0, 1)

        daily_living = ADailyLiving(
            lansia_id=lansia.id,
            bab=bab,
            bak=bak,
            membersihkan_diri=membersihkan_diri,
            toilet=toilet,
            makan=makan,
            pindah_tempat=pindah_tempat,
            mobilitas=mobilitas,
            berpakaian=berpakaian,
            naik_turun_tangga=naik_turun_tangga,
            mandi=mandi
        )
        db.session.add(daily_living)
        daily_living.calculate_total()

        if (i + 1) % 100 == 0:
            print(f"Generated {i + 1} records...")
    
    db.session.commit()
    print(f"Successfully generated {num_records} fake Lansia data and related records.")