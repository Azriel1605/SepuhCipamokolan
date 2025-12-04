-- Insert sample admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@lansiaapp.com', '$2b$12$LQv3c1yqBwlVHpPyyibXXO4PCIBn9/QhdiafGwVOn4gvQeXa8YvK6', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample kader user (password: kader123)
INSERT INTO users (username, email, password_hash, role) VALUES 
('kader01', 'kader01@lansiaapp.com', '$2b$12$8Ry9YjLFHKqUzgOTY5JkAOGBn8/QhdiafGwVOn4gvQeXa8YvK6', 'kader')
ON CONFLICT (username) DO NOTHING;

-- Insert sample lansia data
INSERT INTO lansia (nama_lengkap, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, usia, kelompok_usia, alamat_lengkap, rt, rw, kelurahan, kecamatan, status_perkawinan, agama, pendidikan_terakhir, pekerjaan_terakhir, sumber_penghasilan) VALUES 
('Siti Aminah', '3201234567890001', 'Perempuan', 'Jakarta', '1950-05-15', 74, 'Lansia Tua', 'Jl. Mawar No. 10', '01', '05', 'Kebon Jeruk', 'Kebon Jeruk', 'Janda', 'Islam', 'SD', 'Ibu Rumah Tangga', 'Bantuan Anak'),
('Bapak Sutrisno', '3201234567890002', 'Laki-laki', 'Bandung', '1955-08-20', 69, 'Lansia Madya', 'Jl. Melati No. 25', '02', '05', 'Kebon Jeruk', 'Kebon Jeruk', 'Menikah', 'Islam', 'SMP', 'Pensiunan PNS', 'Pensiun'),
('Ibu Mariam', '3201234567890003', 'Perempuan', 'Surabaya', '1960-12-10', 64, 'Lansia Muda', 'Jl. Anggrek No. 5', '01', '05', 'Kebon Jeruk', 'Kebon Jeruk', 'Menikah', 'Islam', 'SMA', 'Guru', 'Pensiun');

-- Insert sample health data
INSERT INTO kesehatan_lansia (lansia_id, kondisi_kesehatan_umum, riwayat_penyakit_kronis, penggunaan_obat_rutin, alat_bantu, aktivitas_fisik, status_gizi, riwayat_imunisasi) VALUES 
(1, 'Membutuhkan bantuan sebagian', ARRAY['Hipertensi', 'Diabetes'], 'Amlodipine, Metformin', ARRAY['Tongkat', 'Kacamata'], 'Jalan pagi 2x seminggu', 'Normal', 'Flu 2023'),
(2, 'Mandiri', ARRAY['Hipertensi'], 'Captopril', ARRAY['Kacamata'], 'Senam lansia 3x seminggu', 'Normal', 'Flu 2023, Pneumonia 2022'),
(3, 'Sehat bugar', ARRAY[], 'Tidak ada', ARRAY['Kacamata'], 'Yoga 2x seminggu', 'Normal', 'Flu 2023');

-- Insert sample social welfare data
INSERT INTO kesejahteraan_sosial (lansia_id, dukungan_keluarga, tinggal_dengan, kondisi_rumah, aksesibilitas_rumah, sanitasi_rumah, kebutuhan_mendesak, hobi_minat, kondisi_psikologis) VALUES 
(1, 'Baik', 'Anak', 'Layak huni', 'Cukup aksesibel', 'Baik', ARRAY['Bantuan obat'], 'Memasak, menonton TV', 'Stabil'),
(2, 'Sangat baik', 'Istri', 'Layak huni', 'Sangat aksesibel', 'Sangat baik', ARRAY[], 'Berkebun, membaca', 'Sangat baik'),
(3, 'Baik', 'Suami', 'Layak huni', 'Sangat aksesibel', 'Baik', ARRAY[], 'Merajut, arisan', 'Baik');

-- Insert sample family data
INSERT INTO keluarga_pendamping (lansia_id, nama_pendamping, hubungan_dengan_lansia, usia_pendamping, pendidikan_pendamping, ketersediaan_waktu) VALUES 
(1, 'Rina Aminah', 'Anak', 45, 'S1', 'Sore hari'),
(2, 'Siti Sutrisno', 'Istri', 65, 'SMA', 'Sepanjang hari'),
(3, 'Ahmad Mariam', 'Suami', 67, 'S1', 'Sepanjang hari');

-- Insert sample BKL participation data
INSERT INTO partisipasi_bkl (lansia_id, riwayat_partisipasi, jenis_kegiatan, frekuensi_kegiatan, keterlibatan_kelompok) VALUES 
(1, 'Aktif sejak 2020', ARRAY['Senam lansia', 'Pemeriksaan kesehatan'], 'Mingguan', 'Posyandu Lansia'),
(2, 'Aktif sejak 2019', ARRAY['Senam lansia', 'Arisan', 'Pengajian'], 'Mingguan', 'Kelompok Lansia RW 05'),
(3, 'Baru bergabung 2023', ARRAY['Senam lansia'], 'Mingguan', 'Posyandu Lansia');
