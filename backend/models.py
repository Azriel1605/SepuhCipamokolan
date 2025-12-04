from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime
from sqlalchemy import String, func, extract, cast, Integer, case
from sqlalchemy.dialects.postgresql import ARRAY

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='kader')
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now)

class PasswordResetToken(db.Model):
    __tablename__ = 'password_reset_tokens'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(255), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

class Lansia(db.Model):
    __tablename__ = 'lansia'
    id = db.Column(db.Integer, primary_key=True)
    nama_lengkap = db.Column(db.String(255), nullable=False)
    nik = db.Column(db.String(16), unique=True, nullable=False)
    jenis_kelamin = db.Column(db.String(10), nullable=False)
    tanggal_lahir = db.Column(db.Date)
    alamat_lengkap = db.Column(db.Text)
    koordinat = db.Column(db.String(50))
    rt = db.Column(db.String(10))
    rw = db.Column(db.String(10))
    status_perkawinan = db.Column(db.String(50))
    agama = db.Column(db.String(50))
    pendidikan_terakhir = db.Column(db.String(100))
    pekerjaan_terakhir = db.Column(db.String(100))
    sumber_penghasilan = db.Column(db.String(100))

    # Relationships
    kesehatan = db.relationship('KesehatanLansia', backref='lansia', uselist=False, cascade='all, delete-orphan')
    kesejahteraan = db.relationship('KesejahteraanSosial', backref='lansia', uselist=False, cascade='all, delete-orphan')
    keluarga = db.relationship('KeluargaPendamping', backref='lansia', uselist=False, cascade='all, delete-orphan')
    daily_living = db.relationship('ADailyLiving', backref='lansia', uselist=False, cascade='all, delete-orphan')
    
    def usia(self, reference=datetime.today().strftime('%Y-%m-%d')):
        try:
            print(reference, "On MODEL LANSIA")
            reference = datetime.strptime(reference, '%Y-%m-%d').date()
            return reference.year - self.tanggal_lahir.year - (
                (reference.month, reference.day) < (self.tanggal_lahir.month, self.tanggal_lahir.day)
            )
        except Exception as e:
            print(e)
            return 404
        
    def kelompokUsiaReference(self, reference=datetime.today()):
        usia = self.usia(reference=reference)
        if usia < 60:
            return 'Belum Lansia'
        elif 60 <= usia < 70:
            return 'Lansia Muda'
        elif 70 <= usia < 80:
            return 'Lansia Madya'
        else:
            return 'Lansia Tua'

    @hybrid_property
    def kelompokUsia(self, reference=datetime.today()):
        usia = self.usia(reference=reference)
        if usia < 60:
            return 'Belum Lansia'
        elif 60 <= usia < 70:
            return 'Lansia Muda'
        elif 70 <= usia < 80:
            return 'Lansia Madya'
        else:
            return 'Lansia Tua'
        
    @kelompokUsia.expression
    def kelompokUsia(cls, reference=func.now()):
        usia_expr = extract('year', func.age(reference, cls.tanggal_lahir))
        return case(
                (usia_expr < 60, 'Belum Lansia'),
                ((usia_expr >= 60) & (usia_expr < 70), 'Lansia Muda'),
                ((usia_expr >= 70) & (usia_expr < 80), 'Lansia Madya'),
                (usia_expr >= 80, "Lansia Tua"),
                else_='Tidak Diketahui'  # ← tambahkan ini
        )
    

class KesehatanLansia(db.Model):
    __tablename__ = 'kesehatan_lansia'
    id = db.Column(db.Integer, primary_key=True)
    lansia_id = db.Column(db.Integer, db.ForeignKey('lansia.id', ondelete='CASCADE'), nullable=False)
    kondisi_kesehatan_umum = db.Column(db.String(100))
    riwayat_penyakit_kronis = db.Column(ARRAY(String))
    penggunaan_obat_rutin = db.Column(db.Text)
    alat_bantu = db.Column(ARRAY(String))
    aktivitas_fisik = db.Column(db.String(100))
    status_gizi = db.Column(db.String(50))
    riwayat_imunisasi = db.Column(ARRAY(String))
    bpjs = db.Column(String(50))

class KesejahteraanSosial(db.Model):
    __tablename__ = 'kesejahteraan_sosial'
    id = db.Column(db.Integer, primary_key=True)
    lansia_id = db.Column(db.Integer, db.ForeignKey('lansia.id', ondelete='CASCADE'), nullable=False)
    dukungan_keluarga = db.Column(db.String(100))
    kondisi_rumah = db.Column(db.String(100))
    kebutuhan_mendesak = db.Column(ARRAY(String))
    hobi_minat = db.Column(db.Text)
    kondisi_psikologis = db.Column(db.String(100))

class KeluargaPendamping(db.Model):
    __tablename__ = 'keluarga_pendamping'
    id = db.Column(db.Integer, primary_key=True)
    lansia_id = db.Column(db.Integer, db.ForeignKey('lansia.id', ondelete='CASCADE'), nullable=False)
    memiliki_pendamping = db.Column(db.Boolean)
    hubungan_dengan_lansia = db.Column(db.String(100))
    ketersediaan_waktu = db.Column(db.String(100))
    partisipasi_program_bkl = db.Column(db.String(100))
    riwayat_partisipasi_bkl = db.Column(db.Text)
    keterlibatan_dana = db.Column(db.Text)
    
    def usia(self, reference=datetime.today().strftime('%Y-%m-%d')):
        try:
            reference = datetime.strptime(reference, '%Y-%m-%d').date()
            return reference.year - self.tanggal_lahir_pendamping.year - (
                (reference.month, reference.day) < (self.tanggal_lahir_pendamping.month, self.tanggal_lahir_pendamping.day)
            )
        except Exception as e:
            print(e, "pendamping")
            return '-'

class ADailyLiving(db.Model):
    __tablename__ = 'daily_living'
    id = db.Column(db.Integer, primary_key=True)
    lansia_id = db.Column(db.Integer, db.ForeignKey('lansia.id', ondelete='CASCADE'), nullable=False)
    bab = db.Column(db.Integer)
    bak = db.Column(db.Integer)
    membersihkan_diri = db.Column(db.Integer)
    toilet = db.Column(db.Integer)
    makan = db.Column(db.Integer)
    pindah_tempat = db.Column(db.Integer)
    mobilitas = db.Column(db.Integer)
    berpakaian = db.Column(db.Integer)
    naik_turun_tangga = db.Column(db.Integer)
    mandi = db.Column(db.Integer)
    total = db.Column(db.Integer)
    
    def calculate_total(self):
        self.total = (
            (self.bab or 0) +
            (self.bak or 0) +
            (self.membersihkan_diri or 0) +
            (self.toilet or 0) +
            (self.makan or 0) +
            (self.pindah_tempat or 0) +
            (self.mobilitas or 0) +
            (self.berpakaian or 0) +
            (self.naik_turun_tangga or 0) +
            (self.mandi or 0)
        )
        return self.total
    
    def calculateCategory(self):
        points = self.calculate_total()
        if points <5:return "Ketergantungan Total"
        if points <9:return "Ketergantungan Berat"
        if points <12:return "Ketergantungan Sedang"
        if points <20:return "Ketergantungan Ringan"
        if points <21:return "Mandiri"
        return "Tidak Diketahui"
