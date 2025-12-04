-- Create database and tables for Lansia Management System

-- Create main lansia table
CREATE TABLE IF NOT EXISTS lansia (
    id SERIAL PRIMARY KEY,
    nama_lengkap VARCHAR(255) NOT NULL,
    nik VARCHAR(16) UNIQUE NOT NULL,
    jenis_kelamin VARCHAR(10) NOT NULL,
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    usia INTEGER,
    kelompok_usia VARCHAR(50),
    alamat_lengkap TEXT,
    rt VARCHAR(10),
    rw VARCHAR(10),
    kelurahan VARCHAR(100),
    kecamatan VARCHAR(100),
    status_perkawinan VARCHAR(50),
    agama VARCHAR(50),
    pendidikan_terakhir VARCHAR(100),
    pekerjaan_terakhir VARCHAR(100),
    pekerjaan_saat_ini VARCHAR(100),
    sumber_penghasilan VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create health data table
CREATE TABLE IF NOT EXISTS kesehatan_lansia (
    id SERIAL PRIMARY KEY,
    lansia_id INTEGER REFERENCES lansia(id) ON DELETE CASCADE,
    kondisi_kesehatan_umum VARCHAR(100),
    riwayat_penyakit_kronis TEXT[],
    penggunaan_obat_rutin TEXT,
    alat_bantu TEXT[],
    aktivitas_fisik VARCHAR(100),
    status_gizi VARCHAR(50),
    riwayat_imunisasi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create social welfare data table
CREATE TABLE IF NOT EXISTS kesejahteraan_sosial (
    id SERIAL PRIMARY KEY,
    lansia_id INTEGER REFERENCES lansia(id) ON DELETE CASCADE,
    dukungan_keluarga VARCHAR(100),
    tinggal_dengan VARCHAR(100),
    kondisi_rumah VARCHAR(100),
    aksesibilitas_rumah VARCHAR(100),
    sanitasi_rumah VARCHAR(100),
    kebutuhan_mendesak TEXT[],
    hobi_minat TEXT,
    kondisi_psikologis VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create family/caregiver data table
CREATE TABLE IF NOT EXISTS keluarga_pendamping (
    id SERIAL PRIMARY KEY,
    lansia_id INTEGER REFERENCES lansia(id) ON DELETE CASCADE,
    nama_pendamping VARCHAR(255),
    hubungan_dengan_lansia VARCHAR(100),
    usia_pendamping INTEGER,
    pendidikan_pendamping VARCHAR(100),
    ketersediaan_waktu VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create BKL participation data table
CREATE TABLE IF NOT EXISTS partisipasi_bkl (
    id SERIAL PRIMARY KEY,
    lansia_id INTEGER REFERENCES lansia(id) ON DELETE CASCADE,
    riwayat_partisipasi TEXT,
    jenis_kegiatan TEXT[],
    frekuensi_kegiatan VARCHAR(100),
    keterlibatan_kelompok VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'kader',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lansia_nik ON lansia(nik);
CREATE INDEX IF NOT EXISTS idx_lansia_rt_rw ON lansia(rt, rw);
CREATE INDEX IF NOT EXISTS idx_kesehatan_lansia_id ON kesehatan_lansia(lansia_id);
CREATE INDEX IF NOT EXISTS idx_kesejahteraan_lansia_id ON kesejahteraan_sosial(lansia_id);
CREATE INDEX IF NOT EXISTS idx_keluarga_lansia_id ON keluarga_pendamping(lansia_id);
CREATE INDEX IF NOT EXISTS idx_partisipasi_lansia_id ON partisipasi_bkl(lansia_id);
