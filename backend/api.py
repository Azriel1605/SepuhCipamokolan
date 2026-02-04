from flask_mail import Message, Mail
from flask import Blueprint, request, jsonify, session, send_file, url_for
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta, date
from sqlalchemy import text, func, or_, and_, case, not_, any_
import pandas as pd
import os
import secrets
from sqlalchemy.dialects.postgresql import ARRAY  # Pastikan ini di-import
from error import error_d
import random
from shapely.geometry import shape, Point
import geopandas as gpd
import io, zipfile
from adlForm import convertADl, reverseConvertADl
from openpyxl import Workbook
# from seed import generate_fake_data

from models import db, User, PasswordResetToken, Lansia, KesehatanLansia, KesejahteraanSosial, KeluargaPendamping, ADailyLiving

bcrypt = Bcrypt()
mail = Mail()
api = Blueprint('api', __name__)

def send_reset_email(user_email, url):
    """Send password reset email with a bright theme"""
    try:
        msg = Message(
            subject='🔐 Password Reset Request - Sepuh Cipamokolan',
            recipients=[user_email],
            html=f'''
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #e0f7fa 0%, #fffde7 100%); padding: 20px; border-radius: 15px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #00796b; font-size: 2rem;">Sepuh Cipamokolan</h1>
                    <h2 style="color: #388e3c;">Reset Your Password</h2>
                </div>
                
                <div style="background: #ffffff; padding: 25px; border-radius: 15px; margin-bottom: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
                    <p style="color: #37474f; font-size: 1.1rem; line-height: 1.6;">
                        Hello! 👋
                    </p>
                    <p style="color: #37474f; line-height: 1.6;">
                        We received a request to reset your password for your SepuhCipamokolan account.
                        If you made this request, click the button below to reset your password:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{url}" style="
                            background: linear-gradient(45deg, #4db6ac, #81c784);
                            color: white;
                            padding: 15px 30px;
                            text-decoration: none;
                            border-radius: 25px;
                            font-weight: 600;
                            font-size: 1.1rem;
                            display: inline-block;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                        ">🔓 Reset Password</a>
                    </div>
                    
                    <p style="color: #616161; line-height: 1.6; font-size: 0.9rem;">
                        ⏰ <strong>This link will expire in 1 hour</strong> for security reasons.
                    </p>
                    
                    <p style="color: #616161; line-height: 1.6; font-size: 0.9rem;">
                        If you didn't request this password reset, you can safely ignore this email.
                    </p>
                </div>
                
                <div style="text-align: center; color: #90a4ae; font-size: 0.8rem;">
                    <p>This is an automated message from Sepuh Cipamokolan</p>
                    <p>Please do not reply to this email</p>
                </div>
            </div>
            '''
        )
        

        mail.send(message=msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def dataQuery():
    if 'role' not in session:
        raise PermissionError("Role not found in session")

    role = session['role']
    query = Lansia.query

    if role in ['kelurahan', 'admin', 'superadmin']:
        return query

    try:
        return query.filter_by(rw=role)
    except ValueError:
        raise ValueError("Invalid role for rw filtering")
    
def load_rw_polygons(geojson_path):
    gdf = gpd.read_file(geojson_path)
    polygons = {}
    for _, row in gdf.iterrows():
        rw = str(row.get("rw") or row.get("properties", {}).get("rw") or row.get("name"))
        if rw:
            polygons[rw] = row.geometry
    return polygons
    
def generate_random_point_in_polygon(polygon):
    minx, miny, maxx, maxy = polygon.bounds
    for _ in range(1000):  # max 1000 attempts
        p = Point(random.uniform(minx, maxx), random.uniform(miny, maxy))
        if polygon.contains(p):
            return p
    return None

# Helper function to check if user is logged in
def login_required(f):
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'message': 'Authentication required'}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# @api.before_request
# def before_request():
#     query = Lansia.query.first()
#     print(query.kelompokUsia)

# @api.route('/bulkdata', methods=['GET'])
# def bulkdata():
#     generate_fake_data(1000)
#     return jsonify({'message': 'Bulk data seeded successfully'}), 200

@api.route('/note', methods=['GET', 'POST'])
def note():
    users = [ "rw1", "rw2", "rw3", "rw4", "rw5", "rw6", "rw7", "rw8", "rw9", "rw10", "rw11", "rw12"]
    # users = ["kelurahan", "key"]
    password = [ "PeltMfhq", "uBhYFsof", "eJsHihRy", "vmpvqmwz", "aFuRdOpC", "qNbXIdNs", "ngqcNhUE", "RQHkbifj", "AmiqmZvG", "LxvpZlxs", "VOAcANya", "tGjkizgQ"]
    # password = ["evNDljmg", "Ra_sy6a7e2"]
    i = 0
    for u, p in zip(users, password):
        i+=1
        acc = User(
            username=u, 
            email=f'{u}@example.com',
            # role="kelurahan",
            role=i,
            password_hash=bcrypt.generate_password_hash(p).decode('utf-8')
        )
        db.session.add(acc)
        db.session.commit()
    return jsonify({'message': 'success'})

@api.route('/rekapan-excel', methods=['GET', 'POST'])
def rekapan():
    wb = Workbook()
    ws = wb.active
    ws.title = "Data Lansia"

    # Header kolom (disesuaikan dengan model)
    headers = [
        # Data utama lansia
        "ID", "Nama Lengkap", "NIK", "Jenis Kelamin", "Tanggal Lahir", "Usia", "Kelompok Usia",
        "Alamat Lengkap", "RT", "RW", "Koordinat", "Status Perkawinan", "Agama",
        "Pendidikan Terakhir", "Pekerjaan Terakhir", "Sumber Penghasilan",
        # Data Kesehatan
        "Kondisi Kesehatan Umum", "Riwayat Penyakit Kronis", "Penggunaan Obat Rutin",
        "Alat Bantu", "Aktivitas Fisik", "Status Gizi", "Riwayat Imunisasi", "BPJS",
        # Data Kesejahteraan Sosial
        "Dukungan Keluarga", "Kondisi Rumah", "Kebutuhan Mendesak", "Hobi/Minat", "Kondisi Psikologis",
        # Data Keluarga Pendamping
        "Memiliki Pendamping", "Hubungan Dengan Lansia", "Ketersediaan Waktu",
        "Partisipasi Program BKL", "Riwayat Partisipasi BKL", "Keterlibatan Dana kelompok Lansia",
        # Data ADL (Activity of Daily Living)
        "BAB", "BAK", "Membersihkan Diri", "Toilet", "Makan", "Pindah Tempat",
        "Mobilitas", "Berpakaian", "Naik Turun Tangga", "Mandi", "Total Skor ADL", "Kategori ADL"
    ]

    ws.append(headers)
    
    lansia_list = db.session.query(Lansia)\
        .outerjoin(KesehatanLansia, KesehatanLansia.lansia_id == Lansia.id)\
        .outerjoin(KesejahteraanSosial, KesejahteraanSosial.lansia_id == Lansia.id)\
        .outerjoin(KeluargaPendamping, KeluargaPendamping.lansia_id == Lansia.id)\
        .outerjoin(ADailyLiving, ADailyLiving.lansia_id == Lansia.id)\
        .order_by(Lansia.id.asc())\
        .all()
    
    # Isi baris data
    for l in lansia_list:
        usia = l.usia() if l.tanggal_lahir else "-"
        kelompok = l.kelompokUsia if hasattr(l, "kelompokUsia") else "-"
        pendamping = l.keluarga
        kesehatan = l.kesehatan
        sosial = l.kesejahteraan
        adl = l.daily_living

        row = [
            l.id,
            l.nama_lengkap,
            l.nik,
            l.jenis_kelamin,
            l.tanggal_lahir.strftime("%Y-%m-%d") if l.tanggal_lahir else "",
            usia,
            kelompok,
            l.alamat_lengkap,
            l.rt,
            l.rw,
            l.koordinat,
            l.status_perkawinan,
            l.agama,
            l.pendidikan_terakhir,
            l.pekerjaan_terakhir,
            l.sumber_penghasilan,

            # KesehatanLansia
            kesehatan.kondisi_kesehatan_umum if kesehatan else "",
            ", ".join(kesehatan.riwayat_penyakit_kronis or []) if kesehatan and kesehatan.riwayat_penyakit_kronis else "",
            kesehatan.penggunaan_obat_rutin if kesehatan else "",
            ", ".join(kesehatan.alat_bantu or []) if kesehatan and kesehatan.alat_bantu else "",
            kesehatan.aktivitas_fisik if kesehatan else "",
            kesehatan.status_gizi if kesehatan else "",
            ", ".join(kesehatan.riwayat_imunisasi or []) if kesehatan and kesehatan.riwayat_imunisasi else "",
            ", ".join(kesehatan.bpjs) if kesehatan and kesehatan.bpjs else "",

            # Kesejahteraan Sosial
            sosial.dukungan_keluarga if sosial else "",
            sosial.kondisi_rumah if sosial else "",
            ", ".join(sosial.kebutuhan_mendesak or []) if sosial and sosial.kebutuhan_mendesak else "",
            sosial.hobi_minat if sosial else "",
            sosial.kondisi_psikologis if sosial else "",

            # Keluarga Pendamping
            pendamping.memiliki_pendamping if pendamping else "",
            pendamping.hubungan_dengan_lansia if pendamping else "",
            pendamping.ketersediaan_waktu if pendamping else "",
            pendamping.partisipasi_program_bkl if pendamping else "",
            pendamping.riwayat_partisipasi_bkl if pendamping else "",
            pendamping.keterlibatan_data if pendamping else "",

            # Daily Living
            adl.bab if adl else "",
            adl.bak if adl else "",
            adl.membersihkan_diri if adl else "",
            adl.toilet if adl else "",
            adl.makan if adl else "",
            adl.pindah_tempat if adl else "",
            adl.mobilitas if adl else "",
            adl.berpakaian if adl else "",
            adl.naik_turun_tangga if adl else "",
            adl.mandi if adl else "",
            adl.total if adl else "",
            adl.calculateCategory() if adl else "",
        ]

        ws.append(row)

    # Auto width kolom sederhana
    for col in ws.columns:
        max_length = max(len(str(cell.value)) if cell.value else 0 for cell in col)
        ws.column_dimensions[col[0].column_letter].width = min(max_length + 2, 40)

    # Simpan ke memori
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    filename = f"Rekapan_Lansia_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return send_file(
        output,
        as_attachment=True,
        download_name=filename,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ), 200
    

@api.route('/generateuser', methods=['GET'])
def generateuser():
    usrename = ["kader01"]
    password = ["kader123"]
    i=2000
    for u, p in zip(usrename, password):
        new = User(username=u, email=f'dummy{i}@gmail.com', password_hash=bcrypt.generate_password_hash(p).decode('utf-8'), role="01")
        db.session.add(new)
        i+=1
    db.session.commit()
    
    return jsonify({'message': 'success'})

# Authentication routes
@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if user and bcrypt.check_password_hash(user.password_hash, password):
        session.permanent = True
        session['user_id'] = user.id
        session['username'] = user.username
        session['role'] = user.role
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        })
    
    return jsonify({'message': 'Invalid credentials'}), 401

@api.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logout successful'})

@api.route('/check-auth', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            return jsonify({
                'authenticated': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role
                }
            })
    
    return jsonify({'authenticated': False}), 401

@api.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'Email not found'}), 404
    
    # Generate reset token
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(hours=1)
    
    # Use frontend URL
    frontend_url = os.getenv("FRONTEND_URL")
    reset_link = f"{frontend_url}/forgot-password?token={token}"
    
    reset_token = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )
    db.session.add(reset_token)
    db.session.commit()
    
    if not send_reset_email(user_email=email, url=reset_link):
        return jsonify({
            'message': 'Gagal Terkirim'
        }), 400
    
    return jsonify({
        'message': 'Password reset token generated',
    })
    
@api.route('/reset-password', methods=['PUT'])
def reset_password():
    data = request.get_json()
    
    token = data.get('token')
    password = data.get('password')
    
    usedToken = PasswordResetToken.query.filter(PasswordResetToken.token == token).first()
    usedToken.used = True
    
    user = User.query.get(usedToken.user_id)
    user.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    db.session.commit()

    return jsonify({
        'message': 'Password berhasil diubah',
        'token': token,
        'password': password
    })



# Data routes
@api.route('/lansia', methods=['GET'])
@login_required
def get_lansia():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '', type=str)
    gender_filter = request.args.get('gender', '', type=str)
    age_group_filter = request.args.get('age_group', '', type=str)
    rw_filter = request.args.get('rw', '', type=str)
    sort_by = request.args.get('sort_by', 'nama_lengkap', type=str)
    sort_order = request.args.get('sort_order', 'asc', type=str)
    dateReference = request.args.get('date', '')
    session['dateReference'] = dateReference
    
    query = Lansia.query.first()
    # Build query
    query = dataQuery()
    
    # Apply search filter
    if search:
        search_filter = or_(
            Lansia.nama_lengkap.ilike(f'%{search}%'),
            Lansia.nik.ilike(f'%{search}%'),
            Lansia.alamat_lengkap.ilike(f'%{search}%')
        )
        query = query.filter(search_filter)
    
    # Apply other filters
    if gender_filter:
        query = query.filter(Lansia.jenis_kelamin == gender_filter)
    
    if age_group_filter:
        query = query.filter(Lansia.kelompokUsia == age_group_filter)

    if rw_filter:
        query = query.filter(Lansia.rw == rw_filter)
    
    
    
    # Apply sorting
    valid_sort_columns = ['nama_lengkap', 'nik', 'usia', 'jenis_kelamin', 'rt', 'rw']
    if sort_by in valid_sort_columns:
        if sort_by == 'usia':
            if sort_order.lower() == 'desc':
                query = query.order_by(Lansia.tanggal_lahir.desc())
            else:
                query = query.order_by(Lansia.tanggal_lahir.asc())
    
        else:
            column = getattr(Lansia, sort_by)
            if sort_order.lower() == 'desc':
                query = query.order_by(column.desc())
            else:
                query = query.order_by(column.asc())
    
    # Paginate results
    lansia_list = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'data': [{
            'id': l.id,
            'nama_lengkap': l.nama_lengkap,
            'nik': l.nik,
            'jenis_kelamin': l.jenis_kelamin,
            'usia': l.usia(session.get('dateReference')),
            'rt': l.rt,
            'rw': l.rw,
            'kelompok_usia': l.kelompokUsiaReference(session.get('dateReference')),
            'nilai_adl': l.daily_living.calculateCategory(),
            'status_perkawinan': l.status_perkawinan,
            'koordinat':l.koordinat,
        } for l in lansia_list.items],
        'total': lansia_list.total,
        'pages': lansia_list.pages,
        'current_page': page,
        'per_page': per_page
    })

@api.route('/lansia', methods=['POST'])
@login_required
def create_lansia():
    data = request.get_json()
    if int(session.get('user_id')) == 1: return jsonify({'message': 'Kelurahan tidak bisa input data'}), 400
    try:
        # --- TAMBAHKAN KODE INI ---
        rw_input = data.get('rw')
        if not rw_input or str(rw_input).strip() == "":
            return jsonify({'message': 'Error: Data RW tidak boleh kosong'}), 400
        # --------------------------

        # Check if NIK already exists
        existing = Lansia.query.filter_by(nik=str(data['nik'])).first()
        if existing:
            return jsonify({'message': f'Error: NIK {data["nik"]} sudah terdaftar'}), 400
        
        
        # Create main lansia record
        lansia_data = {
            'nama_lengkap': data.get('nama_lengkap'),
            'nik': data.get('nik'),
            'jenis_kelamin': data.get('jenis_kelamin'),
            'tanggal_lahir': datetime.strptime(data['tanggal_lahir'], '%Y-%m-%d').date() if data.get('tanggal_lahir') else None,
            'alamat_lengkap': data.get('alamat_lengkap'),
            'koordinat': data.get('koordinat'),
            'rt': data.get('rt'),
            'rw': data.get('rw'),
            'status_perkawinan': data.get('status_perkawinan'),
            'agama': data.get('agama'),
            'pendidikan_terakhir': data.get('pendidikan_terakhir'),
            'pekerjaan_terakhir': data.get('pekerjaan_terakhir'),
            'sumber_penghasilan': data.get('sumber_penghasilan'),
            'created_by': session.get('user_id')
        }
        
        lansia = Lansia(**lansia_data)
        db.session.add(lansia)
        db.session.flush()  # Get the ID without committing
        
        # Create health record
        kesehatan = KesehatanLansia(
            lansia_id=lansia.id,
            kondisi_kesehatan_umum=data.get('kondisi_kesehatan_umum'),
            riwayat_penyakit_kronis=data.get('riwayat_penyakit_kronis', []),
            penggunaan_obat_rutin=data.get('penggunaan_obat_rutin'),
            alat_bantu=data.get('alat_bantu', []),
            aktivitas_fisik=data.get('aktivitas_fisik'),
            status_gizi=data.get('status_gizi'),
            riwayat_imunisasi=data.get('riwayat_imunisasi', []),
            bpjs=data.get('bpjs') # [NEW] Tambahan field BPJS
        )
        db.session.add(kesehatan)
        
        # Create social welfare record
        kesejahteraan = KesejahteraanSosial(
            lansia_id=lansia.id,
            dukungan_keluarga=data.get('dukungan_keluarga'),
            kondisi_rumah=data.get('kondisi_rumah'),
            kebutuhan_mendesak=data.get('kebutuhan_mendesak', []),
            hobi_minat=data.get('hobi_minat'),
            kondisi_psikologis=data.get('kondisi_psikologis')
        )
        db.session.add(kesejahteraan)
        
        # Create family record
        # Mengambil data boolean memiliki_pendamping
        memiliki_pendamping = data.get('memiliki_pendamping', False)
        
        keluarga = KeluargaPendamping(
            lansia_id=lansia.id,
            memiliki_pendamping=memiliki_pendamping,
            hubungan_dengan_lansia=data.get('hubungan_dengan_lansia') if memiliki_pendamping else None,
            ketersediaan_waktu=data.get('ketersediaan_waktu') if memiliki_pendamping else None,
            partisipasi_program_bkl=data.get('partisipasi_program_bkl') if memiliki_pendamping else None, # Bisa diisi walau tidak ada pendamping (lansianya yg ikut)
            riwayat_partisipasi_bkl=data.get('riwayat_partisipasi_bkl') if memiliki_pendamping else None,
            keterlibatan_dana=data.get('keterlibatan_data') if memiliki_pendamping else None,
        )
        db.session.add(keluarga)
            
        # Create ADL
        adl = ADailyLiving(
            lansia_id=lansia.id,
            bab=data.get('bab', 0),
            bak=data.get('bak', 0),
            membersihkan_diri=data.get('membersihkan_diri', 0),
            toilet=data.get('toilet', 0),
            makan=data.get('makan', 0),
            pindah_tempat=data.get('pindah_tempat', 0),
            mobilitas=data.get('mobilitas', 0),
            berpakaian=data.get('berpakaian', 0),
            naik_turun_tangga=data.get('naik_turun_tangga', 0),
            mandi=data.get('mandi', 0),
        )
        
        # Hitung total menggunakan method di model
        adl.calculate_total()
        db.session.add(adl)
        
        db.session.commit()
        return jsonify({'message': 'Data lansia berhasil ditambahkan', 'id': lansia.id}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 400

@api.route('/lansia/<int:lansia_id>', methods=['GET'])
@login_required
def get_lansia_detail(lansia_id):
    lansia = Lansia.query.get_or_404(lansia_id)
    
    kesehatan = lansia.kesehatan
    kesejahteraan = lansia.kesejahteraan
    keluarga = lansia.keluarga
    daily_living = lansia.daily_living
    
    # Helper for ADL reverse convert (pastikan dictionary reverseConvertADl diimport)
    def get_adl_label(key, value):
        try:
            return reverseConvertADl[key][value]
        except:
            return str(value)

    return jsonify({
        'id': lansia.id,
        # ... (Personal Data tetap sama) ...
        'nama_lengkap': lansia.nama_lengkap,
        'nik': lansia.nik,
        'jenis_kelamin': lansia.jenis_kelamin,
        'tanggal_lahir': lansia.tanggal_lahir.isoformat() if lansia.tanggal_lahir else None,
        'usia': lansia.usia(session.get('dateReference')),
        'kelompok_usia': lansia.kelompokUsiaReference(session.get('dateReference')),
        'alamat_lengkap': lansia.alamat_lengkap,
        'koordinat': lansia.koordinat,
        'rt': lansia.rt,
        'rw': lansia.rw,
        'status_perkawinan': lansia.status_perkawinan,
        'agama': lansia.agama,
        'pendidikan_terakhir': lansia.pendidikan_terakhir,
        'pekerjaan_terakhir': lansia.pekerjaan_terakhir,
        'sumber_penghasilan': lansia.sumber_penghasilan,
        
        'kesehatan': {
            'kondisi_kesehatan_umum': kesehatan.kondisi_kesehatan_umum if kesehatan else None,
            'riwayat_penyakit_kronis': kesehatan.riwayat_penyakit_kronis if kesehatan else [],
            'penggunaan_obat_rutin': kesehatan.penggunaan_obat_rutin if kesehatan else None,
            'alat_bantu': kesehatan.alat_bantu if kesehatan and kesehatan.alat_bantu else [],
            'aktivitas_fisik': kesehatan.aktivitas_fisik if kesehatan else None,
            'status_gizi': kesehatan.status_gizi if kesehatan else None,
            'riwayat_imunisasi': kesehatan.riwayat_imunisasi if kesehatan else None,
            'bpjs': kesehatan.bpjs if kesehatan else None, # [NEW]
        } if kesehatan else None,
        
        'kesejahteraan': {
            'dukungan_keluarga': kesejahteraan.dukungan_keluarga if kesejahteraan else None,
            'kondisi_rumah': kesejahteraan.kondisi_rumah if kesejahteraan else None,
            'kebutuhan_mendesak': kesejahteraan.kebutuhan_mendesak if kesejahteraan else [],
            'hobi_minat': kesejahteraan.hobi_minat if kesejahteraan else None,
            'kondisi_psikologis': kesejahteraan.kondisi_psikologis if kesejahteraan else None,
        } if kesejahteraan else None,
        
        'keluarga': {
            'memiliki_pendamping': keluarga.memiliki_pendamping if keluarga else False, # [NEW]
            'hubungan_dengan_lansia': keluarga.hubungan_dengan_lansia if keluarga else None,
            'ketersediaan_waktu': keluarga.ketersediaan_waktu if keluarga else None,
            'partisipasi_program_bkl': keluarga.partisipasi_program_bkl if keluarga else None,
            'riwayat_partisipasi_bkl': keluarga.riwayat_partisipasi_bkl if keluarga else None,
            'keterlibatan_data': keluarga.keterlibatan_dana if keluarga else None, # Note: model uses keterlibatan_dana
        } if keluarga else None,
        
        'daily_living': {
            # Kirim Score Mentah untuk Edit Form
            'score_bab': daily_living.bab if daily_living else 0,
            'score_bak': daily_living.bak if daily_living else 0,
            'score_membersihkan_diri': daily_living.membersihkan_diri if daily_living else 0,
            'score_toilet': daily_living.toilet if daily_living else 0,
            'score_makan': daily_living.makan if daily_living else 0,
            'score_pindah_tempat': daily_living.pindah_tempat if daily_living else 0,
            'score_mobilitas': daily_living.mobilitas if daily_living else 0,
            'score_berpakaian': daily_living.berpakaian if daily_living else 0,
            'score_naik_turun_tangga': daily_living.naik_turun_tangga if daily_living else 0,
            'score_mandi': daily_living.mandi if daily_living else 0,
            
            # Kirim Label/Deskripsi untuk View Detail
            'bab': get_adl_label('bab', daily_living.bab) if daily_living else None,
            'bak': get_adl_label('bak', daily_living.bak) if daily_living else None,
            'membersihkan_diri': get_adl_label('membersihkan_diri', daily_living.membersihkan_diri) if daily_living else None,
            'toilet': get_adl_label('toilet', daily_living.toilet) if daily_living else None,
            'makan': get_adl_label('makan', daily_living.makan) if daily_living else None,
            'pindah_tempat': get_adl_label('pindah_tempat', daily_living.pindah_tempat) if daily_living else None,
            'mobilitas': get_adl_label('mobilitas', daily_living.mobilitas) if daily_living else None,
            'berpakaian': get_adl_label('berpakaian', daily_living.berpakaian) if daily_living else None,
            'naik_turun_tangga': get_adl_label('naik_turun_tangga', daily_living.naik_turun_tangga) if daily_living else None,
            'mandi': get_adl_label('mandi', daily_living.mandi) if daily_living else None,
            
            'total': daily_living.total if daily_living else 0,
            'total_desc': daily_living.calculateCategory() if daily_living else "Tidak Diketahui",
        } if daily_living else None,
    })

@api.route('/lansia/<int:lansia_id>', methods=['PUT'])
@login_required
def update_lansia(lansia_id):
    lansia = Lansia.query.get_or_404(lansia_id)
    data = request.get_json()
    try:
        # Update Lansia Basic Info (Logic sama seperti sebelumnya, hanya copy field yg relevan)
        for key in ['nama_lengkap', 'nik', 'jenis_kelamin', 'alamat_lengkap', 'koordinat', 'rt', 'rw', 'status_perkawinan', 'agama', 'pendidikan_terakhir', 'pekerjaan_terakhir', 'sumber_penghasilan']:
            if key in data:
                value = data[key]
                if key == 'rw' and (not value or str(value).strip() == ""):
                    return jsonify({'message': 'Error: Data RW tidak boleh kosong'}), 400
                
                setattr(lansia, key, data[key])
        
        if 'tanggal_lahir' in data and data['tanggal_lahir']:
             lansia.tanggal_lahir = datetime.strptime(data['tanggal_lahir'], '%Y-%m-%d').date()

        # Update Health
        nestedData = data.get('kesehatan', {})
        if not lansia.kesehatan:
            lansia.kesehatan = KesehatanLansia(lansia_id=lansia.id)
        
        kesehatan                           = lansia.kesehatan
        
        kesehatan.kondisi_kesehatan_umum    = nestedData.get('kondisi_kesehatan_umum')
        kesehatan.riwayat_penyakit_kronis   = nestedData.get('riwayat_penyakit_kronis', [])
        kesehatan.penggunaan_obat_rutin     = nestedData.get('penggunaan_obat_rutin')
        kesehatan.alat_bantu                = nestedData.get('alat_bantu', [])
        kesehatan.aktivitas_fisik           = nestedData.get('aktivitas_fisik')
        kesehatan.status_gizi               = nestedData.get('status_gizi')
        kesehatan.riwayat_imunisasi         = nestedData.get('riwayat_imunisasi', [])
        kesehatan.bpjs                      = nestedData.get('bpjs')

        # Update Welfare (Logic sama)
        nestedData = data.get('kesejahteraan', {})
        if not lansia.kesejahteraan:
            lansia.kesejahteraan            = KesejahteraanSosial(lansia_id=lansia.id)
        
        kesejahteraan                       = lansia.kesejahteraan
        kesejahteraan.dukungan_keluarga     = nestedData.get('dukungan_keluarga')
        kesejahteraan.kondisi_rumah         = nestedData.get('kondisi_rumah')
        kesejahteraan.kebutuhan_mendesak    = nestedData.get('kebutuhan_mendesak', [])
        kesejahteraan.hobi_minat            = nestedData.get('hobi_minat')
        kesejahteraan.kondisi_psikologis    = nestedData.get('kondisi_psikologis')

        # Update Family
        nestedData = data.get('keluarga', {})
        if not lansia.keluarga:
            lansia.keluarga = KeluargaPendamping(lansia_id=lansia.id)
        
        keluarga                     = lansia.keluarga
        memiliki                     = nestedData.get('memiliki_pendamping', False)
        keluarga.memiliki_pendamping = memiliki # [NEW]
        
        if memiliki:
            required_fields = [
                'hubungan_dengan_lansia',
                'ketersediaan_waktu',
                'partisipasi_program_bkl',
                'riwayat_partisipasi_bkl',
                'keterlibatan_data'
            ]
            missing_fields = [field for field in required_fields if not nestedData.get(field)]
            if missing_fields:
                return {
                    "status": "error",
                    "message": f"Field(s) wajib tidak boleh kosong: {', '.join(missing_fields)}"
                }, 400
            
            keluarga.hubungan_dengan_lansia     = nestedData.get('hubungan_dengan_lansia')
            keluarga.pendidikan_pendamping      = nestedData.get('pendidikan_pendamping')
            keluarga.ketersediaan_waktu         = nestedData.get('ketersediaan_waktu')
            keluarga.memiliki_pendamping        = True
            keluarga.partisipasi_program_bkl    = nestedData.get('partisipasi_program_bkl')
            keluarga.riwayat_partisipasi_bkl    = nestedData.get('riwayat_partisipasi_bkl')
            keluarga.keterlibatan_dana          = nestedData.get('keterlibatan_data')
            
        else:
            # Jika tidak memiliki pendamping, kosongkan data terkait personal pendamping
            keluarga.memiliki_pendamping        = False
            keluarga.hubungan_dengan_lansia     = None
            keluarga.tanggal_lahir_pendamping   = None
            keluarga.pendidikan_pendamping      = None
            keluarga.ketersediaan_waktu         = None
            keluarga.partisipasi_program_bkl    = None
            keluarga.riwayat_partisipasi_bkl    = None
            keluarga.keterlibatan_dana          = None        

        # Update ADL
        nestedData = data.get('daily_living', {})
        if not lansia.daily_living:
            lansia.daily_living     = ADailyLiving(lansia_id=lansia.id)
        
        adl                         = lansia.daily_living
        adl.bab                     = nestedData.get('score_bab')
        adl.bak                     = nestedData.get('score_bak')
        adl.toilet                  = nestedData.get('score_toilet')
        adl.membersihkan_diri       = nestedData.get('score_membersihkan_diri')
        adl.makan                   = nestedData.get('score_makan')
        adl.pindah_tempat           = nestedData.get('score_pindah_tempat')
        adl.mobilitas               = nestedData.get('score_mobilitas')
        adl.berpakaian              = nestedData.get('score_berpakaian')
        adl.naik_turun_tangga       = nestedData.get('score_naik_turun_tangga')
        adl.mandi                   = nestedData.get('score_mandi')
        
        adl.calculate_total() # Recalculate total
        
        db.session.commit()
        return jsonify({'message': 'Data lansia berhasil diperbarui', 'id': lansia.id})

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 400

@api.route('/lansia/<int:lansia_id>', methods=['DELETE'])
@login_required
def delete_lansia(lansia_id):
    lansia = Lansia.query.get_or_404(lansia_id)
    
    try:
        db.session.delete(lansia)
        db.session.commit()
        return jsonify({'message': 'Data lansia berhasil dihapus'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 400


# Dashboard routes
@api.route('/dashboard/demographics', methods=['GET'])
@login_required
def get_demographics():
    query = dataQuery()  # Pastikan query ini mengembalikan Lansia.query.filter_by(...) sesuai role

    # Total lansia (terfilter sesuai role)
    total_lansia = query.count()

    # Statistik jenis kelamin
    gender_stats = query.with_entities(
        Lansia.jenis_kelamin,
        func.count(Lansia.id)
    ).group_by(Lansia.jenis_kelamin).all()

    # Statistik kelompok usia
    age_group_stats = query.with_entities(
        Lansia.kelompokUsia,
        func.count(Lansia.id)
    ).group_by(Lansia.kelompokUsia).all()

    # Statistik lokasi RT/RW
    location_stats = query.with_entities(
        Lansia.rt,
        Lansia.rw,
        func.count(Lansia.id)
    ).group_by(Lansia.rt, Lansia.rw).all()

        
    return jsonify({
        'total_lansia': total_lansia,
        'by_gender': [{'gender': g[0], 'count': g[1]} for g in gender_stats],
        'by_age_group': [{'group': a[0], 'count': a[1]} for a in age_group_stats],
        'by_location': [{'rt': l[0], 'rw': l[1], 'count': l[2]} for l in location_stats]
    })

@api.route('/dashboard/health', methods=['GET'])
@login_required
def get_health_stats():
    # Ambil query Lansia yang sudah terfilter berdasarkan role
    lansia_query = dataQuery()

    # Ambil id lansia yang sesuai
    filtered_ids = [l.id for l in lansia_query.with_entities(Lansia.id).all()]

    # Query kondisi kesehatan umum
    health_condition_stats = db.session.query(
        KesehatanLansia.kondisi_kesehatan_umum,
        func.count(KesehatanLansia.id)
    ).filter(KesehatanLansia.lansia_id.in_(filtered_ids))\
    .group_by(KesehatanLansia.kondisi_kesehatan_umum).all()

    # Query penyakit kronis (dari array)
    chronic_diseases = db.session.execute(
        text("""
            SELECT unnest(riwayat_penyakit_kronis) AS disease, COUNT(*) as count
            FROM kesehatan_lansia
            WHERE lansia_id = ANY(:ids) AND riwayat_penyakit_kronis IS NOT NULL
            GROUP BY disease
            ORDER BY count DESC
        """),
        {'ids': filtered_ids}
    ).fetchall()

    # Query status gizi
    nutrition_stats = db.session.query(
        KesehatanLansia.status_gizi,
        func.count(KesehatanLansia.id)
    ).filter(KesehatanLansia.lansia_id.in_(filtered_ids))\
    .group_by(KesehatanLansia.status_gizi).all()
    
    dependence_condition = db.session.query(
        case(
            (ADailyLiving.total >= 20, 'Mandiri'),
            (ADailyLiving.total.between(12, 19), 'Ketergantungan ringan'),
            (ADailyLiving.total.between(9, 11), 'Ketergantungan sedang'),
            (ADailyLiving.total.between(5, 8), 'Ketergantungan berat'),
            (ADailyLiving.total.between(0, 4), 'Ketergantungan total'),
            else_='Tidak diketahui'
        ).label('kategori'),
        func.count(ADailyLiving.id).label('jumlah')
    ).filter(ADailyLiving.lansia_id.in_(filtered_ids))\
    .group_by('kategori')\
    .all()
    
    ## TO DO
    help_needed = db.session.query(KesejahteraanSosial).filter(
        KesejahteraanSosial.lansia_id.in_(filtered_ids),
        not_('Tidak Ada' == any_(KesejahteraanSosial.kebutuhan_mendesak))
    ).count()
        
    return jsonify({
        'health_conditions': [{'condition': h[0], 'count': h[1]} for h in health_condition_stats if h[0]],
        'chronic_diseases': [{'disease': d[0], 'count': d[1]} for d in chronic_diseases],
        'nutrition_status': [{'status': n[0], 'count': n[1]} for n in nutrition_stats if n[0]],
        'dependence_condition' : [{'condition': c[0], 'count': c[1]} for c in dependence_condition if c[0]],
        'help_needed': help_needed,
    })

@api.route('/dashboard/social-welfare', methods=['GET'])
@login_required
def get_social_welfare_stats():
    # Ambil lansia yang sudah difilter berdasarkan session role
    lansia_query = dataQuery()

    # Ambil ID lansia yang berhak dilihat
    filtered_ids = [l.id for l in lansia_query.with_entities(Lansia.id).all()]

    # Statistik kondisi rumah (terfilter)
    housing_stats = db.session.query(
        KesejahteraanSosial.kondisi_rumah,
        func.count(KesejahteraanSosial.id)
    ).filter(KesejahteraanSosial.lansia_id.in_(filtered_ids))\
    .group_by(KesejahteraanSosial.kondisi_rumah).all()

    # Statistik kebutuhan mendesak (array field)
    urgent_needs = db.session.execute(
        text("""
            SELECT unnest(kebutuhan_mendesak) AS need, COUNT(*) as count
            FROM kesejahteraan_sosial
            WHERE lansia_id = ANY(:ids)
            AND kebutuhan_mendesak IS NOT NULL
            GROUP BY need
            ORDER BY count DESC
        """),
        {'ids': filtered_ids}
    ).fetchall()
    
    return jsonify({
        'housing_conditions': [{'condition': h[0], 'count': h[1]} for h in housing_stats if h[0]],
        'urgent_needs': [{'need': u[0], 'count': u[1]} for u in urgent_needs]
    })

@api.route('/dashboard/needs-potential', methods=['GET'])
@login_required
def get_needs_potential():
    # Ambil query Lansia yang terfilter berdasarkan session['role']
    lansia_query = dataQuery()

    # Ambil daftar ID lansia yang sesuai
    filtered_ids = [l.id for l in lansia_query.with_entities(Lansia.id).all()]

    # Query partisipasi program BKL yang hanya mencakup lansia yang diizinkan
    participation_stats = db.session.query(
        KeluargaPendamping.partisipasi_program_bkl,
        func.count(KeluargaPendamping.id)
    ).filter(KeluargaPendamping.lansia_id.in_(filtered_ids))\
    .group_by(KeluargaPendamping.partisipasi_program_bkl).all()

    
    return jsonify({
        'participation': [{'group': p[0], 'count': p[1]} for p in participation_stats if p[0]]
    })

@api.route('/dashboard/urgent-need-details/<need_type>', methods=['GET'])
@login_required
def get_urgent_need_details(need_type):
    try:
        # Query to get lansia with specific urgent need using PostgreSQL array contains operator
        query = (
                dataQuery()
                .join(KesejahteraanSosial)
                .filter(KesejahteraanSosial.kebutuhan_mendesak.contains([need_type]))
                .with_entities(
                    Lansia.id,
                    Lansia.nama_lengkap,
                    Lansia.nik,
                    Lansia.alamat_lengkap,
                    Lansia.rt,
                    Lansia.rw,
                    KesejahteraanSosial.kebutuhan_mendesak
                )
                .all()
            )
        
        result = []
        for row in query:
            result.append({
                'id': row.id,
                'nama_lengkap': row.nama_lengkap,
                'nik': row.nik,
                'alamat_lengkap': row.alamat_lengkap,
                'rt': row.rt,
                'rw': row.rw,
                'kebutuhan': row.kebutuhan_mendesak or []
            })
        
        return jsonify(result)
    except Exception as e:
        print(f"Error in get_urgent_need_details: {str(e)}")
        return jsonify({'error': str(e)}), 500

@api.route('/export-template', methods=['GET'])
@login_required
def export_template():
    file_path = os.path.join('static', 'file', 'LansiaTemplate.xlsm')  # sesuaikan dengan path file 
    return send_file(
        file_path,
        as_attachment=True,
        download_name='LansiaTemplate.zip',
        mimetype='application/vnd.ms-excel.sheet.macroEnabled.12'
    ), 200
    
@api.route('/export-recap', methods=['GET'])
@login_required
def export_recap():
    
    user_role = session.get('role')
    
    wb = Workbook()
    ws = wb.active
    ws.title = "Data Lansia"

    # Header kolom (disesuaikan dengan model)
    headers = [
        # Data utama lansia
        "ID", "Nama Lengkap", "NIK", "Jenis Kelamin", "Tanggal Lahir", "Usia", "Kelompok Usia",
        "Alamat Lengkap", "RT", "RW", "Koordinat", "Status Perkawinan", "Agama",
        "Pendidikan Terakhir", "Pekerjaan Terakhir", "Sumber Penghasilan",
        # Data Kesehatan
        "Kondisi Kesehatan Umum", "Riwayat Penyakit Kronis", "Penggunaan Obat Rutin",
        "Alat Bantu", "Aktivitas Fisik", "Status Gizi", "Riwayat Imunisasi", "BPJS",
        # Data Kesejahteraan Sosial
        "Dukungan Keluarga", "Kondisi Rumah", "Kebutuhan Mendesak", "Hobi/Minat", "Kondisi Psikologis",
        # Data Keluarga Pendamping
        "Memiliki Pendamping", "Hubungan Dengan Lansia", "Ketersediaan Waktu",
        "Partisipasi Program BKL", "Riwayat Partisipasi BKL", "Keterlibatan Dana kelompok Lansia",
        # Data ADL (Activity of Daily Living)
        "BAB", "BAK", "Membersihkan Diri", "Toilet", "Makan", "Pindah Tempat",
        "Mobilitas", "Berpakaian", "Naik Turun Tangga", "Mandi", "Total Skor ADL", "Kategori ADL"
    ]

    ws.append(headers)
    
    id_query = db.session.query(Lansia.id)
    
    if user_role not in ['kelurahan', 'admin', 'superadmin']:
        id_query = id_query.filter(Lansia.rw == user_role)
    
    filtered_ids = [row.id for row in id_query.all()]
    
    
    lansia_list = db.session.query(Lansia)\
        .outerjoin(KesehatanLansia, KesehatanLansia.lansia_id == Lansia.id)\
        .outerjoin(KesejahteraanSosial, KesejahteraanSosial.lansia_id == Lansia.id)\
        .outerjoin(KeluargaPendamping, KeluargaPendamping.lansia_id == Lansia.id)\
        .outerjoin(ADailyLiving, ADailyLiving.lansia_id == Lansia.id)\
        .filter(Lansia.id.in_(filtered_ids))\
        .order_by(Lansia.id.asc())\
        .all()
        
    
    
    # Isi baris data
    for l in lansia_list:
        usia = l.usia() if l.tanggal_lahir else "-"
        kelompok = l.kelompokUsia if hasattr(l, "kelompokUsia") else "-"
        pendamping = l.keluarga
        kesehatan = l.kesehatan
        sosial = l.kesejahteraan
        adl = l.daily_living

        row = [
            l.id,
            l.nama_lengkap,
            l.nik,
            l.jenis_kelamin,
            l.tanggal_lahir.strftime("%Y-%m-%d") if l.tanggal_lahir else "",
            usia,
            kelompok,
            l.alamat_lengkap,
            l.rt,
            l.rw,
            l.koordinat,
            l.status_perkawinan,
            l.agama,
            l.pendidikan_terakhir,
            l.pekerjaan_terakhir,
            l.sumber_penghasilan,

            # KesehatanLansia
            kesehatan.kondisi_kesehatan_umum if kesehatan else "",
            ", ".join(kesehatan.riwayat_penyakit_kronis or []) if kesehatan and kesehatan.riwayat_penyakit_kronis else "",
            kesehatan.penggunaan_obat_rutin if kesehatan else "",
            ", ".join(kesehatan.alat_bantu or []) if kesehatan and kesehatan.alat_bantu else "",
            kesehatan.aktivitas_fisik if kesehatan else "",
            kesehatan.status_gizi if kesehatan else "",
            ", ".join(kesehatan.riwayat_imunisasi or []) if kesehatan and kesehatan.riwayat_imunisasi else "",
            kesehatan.bpjs if kesehatan else "",

            # Kesejahteraan Sosial
            sosial.dukungan_keluarga if sosial else "",
            sosial.kondisi_rumah if sosial else "",
            ", ".join(sosial.kebutuhan_mendesak or []) if sosial and sosial.kebutuhan_mendesak else "",
            sosial.hobi_minat if sosial else "",
            sosial.kondisi_psikologis if sosial else "",

            # Keluarga Pendamping
            pendamping.memiliki_pendamping if pendamping else "",
            pendamping.hubungan_dengan_lansia if pendamping else "",
            pendamping.ketersediaan_waktu if pendamping else "",
            pendamping.partisipasi_program_bkl if pendamping else "",
            pendamping.riwayat_partisipasi_bkl if pendamping else "",
            pendamping.keterlibatan_dana if pendamping else "",

            # Daily Living
            adl.bab if adl else "",
            adl.bak if adl else "",
            adl.membersihkan_diri if adl else "",
            adl.toilet if adl else "",
            adl.makan if adl else "",
            adl.pindah_tempat if adl else "",
            adl.mobilitas if adl else "",
            adl.berpakaian if adl else "",
            adl.naik_turun_tangga if adl else "",
            adl.mandi if adl else "",
            adl.total if adl else "",
            adl.calculateCategory() if adl else "",
        ]

        ws.append(row)

    # Auto width kolom sederhana
    for col in ws.columns:
        max_length = max(len(str(cell.value)) if cell.value else 0 for cell in col)
        ws.column_dimensions[col[0].column_letter].width = min(max_length + 2, 40)

    # Simpan ke memori
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    filename = f"Rekapan_Lansia_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return send_file(
        output,
        as_attachment=True,
        download_name=filename,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ), 200

# Add upload Excel endpoint
@api.route('/upload-excel', methods=['POST'])
@login_required
def upload_excel():
    print("Upload Excel endpoint called")  # Debug log
    
    if 'file' not in request.files:
        print("No file in request")  # Debug log
        return jsonify({'message': 'No file uploaded'}), 400
    
    file = request.files['file']
    print(f"File received: {file.filename}")  # Debug log
    
    
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400

    if int(session.get('role')) == 1:
        return jsonify({'message': 'Unauthorized: Admin tidak dapat mengunggah data'}), 403
    
    if not file.filename.lower().endswith(('.xlsx', '.xls', 'xlsm')):
        return jsonify({'message': 'Invalid file format. Please upload Excel file (.xlsx or .xls)'}), 400
    
    try:
        # Read Excel file directly from memory
        header = ['nama_lengkap', 'nik', 'jenis_kelamin', 'tanggal_lahir', 'alamat_lengkap', 'koordinat', 'rt', 'rw', 'status_perkawinan', 'agama', 'pendidikan_terakhir', 'pekerjaan_terakhir', 'sumber_penghasilan',
                  'pass1', 'kondisi_kesehatan_umum', 'riwayat_penyakit_kronis', 'penggunaan_obat_rutin', 'alat_bantu', 'aktivitas_fisik', 'status_gizi', 'riwayat_imunisasi', 'bpjs',
                  'pass2', 'dukungan_keluarga', 'kondisi_rumah', 'kebutuhan_mendesak', 'hobi_minat', 'kondisi_psikologis',
                  'pass3', 'memiliki_pendamping', 'hubungan_dengan_lansia', 'ketersediaan_waktu', 'partisipasi_program_bkl', 'riwayat_partisipasi_bkl', 'keterlibatan_data',
                  'pass4', 'bab', 'bak', 'membersihkan_diri', 'toilet', 'makan', 'pindah_tempat', 'mobilitas', 'berpakaian', 'naik_turun_tangga', 'mandi',
                ]
        
        print("Reading Excel file...")  # Debug log
        df = pd.read_excel(file.stream, sheet_name="Sheet1")
        df = df.T
        df.columns = header
        df.drop(['pass1', 'pass2', 'pass3', 'pass4'], axis=1, inplace=True)
        df = df.iloc[1:]
        df.index = range(2, len(df) + 2)
        
        print(f"Excel file read successfully. Shape: {df.shape}")  # Debug log
        success_count = 0
        error_count = 0
        errors = []
        
        # missing_columns = [col for col in required_columns if col not in df.columns]
        
        for index, row in df.iterrows():
            try:
                # Validate required columns
                
                data = row.to_dict()
                memiliki = data['memiliki_pendamping'] == "Ya"
                
                if not memiliki:
                    for d, val in data.items():
                        if pd.isna(val) and d not in ['hubungan_dengan_lansia', 'ketersediaan_waktu', 'partisipasi_program_bkl', 'riwayat_partisipasi_bkl','keterlibatan_data', 'koordinat']:
                            error_count += 1
                            error_msg = f'\nData {error_d[d]} Kolom {index}: Data Kosong'
                            errors.append(error_msg)
                            print(f"Error processing row {index} kolom {d}: Data Kosong")  # Debug log
                else:
                    for d, val in data.items():
                        # Cek apakah NaN ATAU string kosong/spasi saja
                        is_empty = pd.isna(val) or (isinstance(val, str) and val.strip() == "")
                        
                        if is_empty:
                            if d == 'koordinat': continue
                            
                            # Validasi khusus: RW wajib diisi dan tidak boleh kosong/spasi
                            if d == 'rw':
                                error_count += 1
                                errors.append(f'\nData {error_d.get(d, d)} Kolom {index}: RW Wajib diisi dan tidak boleh kosong')
                                continue

                            error_count += 1
                            error_msg = f'\nData {error_d.get(d, d)} Kolom {index}: Data Kosong'
                            errors.append(error_msg)
                            print(f"Error processing row {index} kolom {d}: Data Kosong")
                        if pd.isna(val):
                            if d == 'koordinat': continue
                            error_count += 1
                            error_msg = f'\nData {error_d[d]} Kolom {index}: Data Kosong'
                            errors.append(error_msg)
                            print(f"Error processing row {index} kolom {d}: Data Kosong")
                
                # Optional: parse tanggal_lahir
                if 'tanggal_lahir' in data and isinstance(data['tanggal_lahir'], str):
                    data['tanggal_lahir'] = datetime.strptime(data['tanggal_lahir'], '%Y-%m-%d').date()
                    
                if 'tanggal_lahir_pendamping' in data and isinstance(data['tanggal_lahir_pendamping'], str):
                    data['tanggal_lahir_pendamping'] = datetime.strptime(data['tanggal_lahir_pendamping'], '%Y-%m-%d').date()
                
                # Check if NIK already exists
                existing = Lansia.query.filter_by(nik=str(row['nik'])).first()
                if existing:
                    error_count += 1
                    errors.append(f'Kolom {index}: NIK {row["nik"]} sudah terdaftar')
                    continue
                
                lansia = Lansia()
                for column in Lansia.__table__.columns:
                    col_name = column.name
                    if col_name != 'id' and col_name in data:
                        value = data[col_name]
                        setattr(lansia, col_name, value)
                setattr(lansia, 'created_by', session.get('user_id'))
                
                db.session.add(lansia)
                db.session.flush()  # Get lansia.id
                
                # 2️⃣ Create KesehatanLansia object
                kesehatan = KesehatanLansia()
                for column in KesehatanLansia.__table__.columns:
                    col_name = column.name
                    if col_name in ['riwayat_penyakit_kronis', 'alat_bantu', 'riwayat_imunisasi']:
                        setattr(kesehatan, col_name, data[col_name].split(sep=','))
                        continue             
                    
                    if col_name != 'id' and col_name != 'lansia_id' and col_name in data:
                        setattr(kesehatan, col_name, data[col_name])

                kesehatan.lansia_id = lansia.id
                db.session.add(kesehatan)
                
                
                # 3
                kesejahteraan = KesejahteraanSosial()
                for column in KesejahteraanSosial.__table__.columns:
                    col_name = column.name
                    if col_name == 'kebutuhan_mendesak':
                        setattr(kesejahteraan, col_name, data[col_name].split(sep=','))
                        continue
                    
                    if col_name != 'id' and col_name != 'lansia_id' and col_name in data:
                        setattr(kesejahteraan, col_name, data[col_name])

                kesejahteraan.lansia_id = lansia.id
                db.session.add(kesejahteraan)
                
                # 4
                pendamping = KeluargaPendamping()
                
                if memiliki:
                    for column in KeluargaPendamping.__table__.columns:
                        col_name = column.name
                        if col_name != 'id' and col_name != 'lansia_id' and col_name != 'memiliki_pendamping' and col_name in data:
                            setattr(pendamping, col_name, data[col_name])

                pendamping.lansia_id = lansia.id
                pendamping.memiliki_pendamping = memiliki
                db.session.add(pendamping)
                
                # 5
                adl = ADailyLiving()
                for column in ADailyLiving.__table__.columns:
                    col_name = column.name
                    if col_name != 'id' and col_name != 'lansia_id' and col_name in data:
                        setattr(adl, col_name, convertADl[col_name][data[col_name]])
                        # setattr(adl, col_name, data[col_name])
                        
                adl.calculate_total()

                adl.lansia_id = lansia.id
                db.session.add(adl)
                success_count += 1

            except Exception as e:
                error_count += 1
                error_msg = f'Data {error_d[d]} kolom {index} : {str(e)}'
                errors.append(error_msg)
                print(f"Error processing row {index + 2}: {str(e)}")  # Debug log
                continue
            
        response_message = ""
        if error_count > 0:
            response_message += f', {error_count} errors occurred'
            success_count = 0
        else:    
            response_message += f'Successfully imported {success_count} records'
            db.session.commit()
        
        return jsonify({
            'message': response_message,
            'count': success_count,
            'errors': errors[:10]  # Return first 10 errors
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Upload error: {str(e)}")  # Debug log
        return jsonify({'message': f'Error processing file: {str(e)}'}), 400

    
    

# Get filter options for frontend
@api.route('/filter-options', methods=['GET'])
@login_required
def get_filter_options():
    # Get unique values for filters
    query = dataQuery()  # terfilter sesuai session['role']

    # Jenis kelamin unik dari lansia yang berhak diakses
    genders = query.with_entities(Lansia.jenis_kelamin).distinct().all()

    # Kelompok usia tetap manual (bukan query)
    age_groups = ["Lansia Muda", "Lansia Madya", "Lansia Tua", "Belum Lansia"]

    # RW unik dari lansia yang berhak diakses
    rws = query.with_entities(Lansia.rw).distinct().order_by(Lansia.rw).all()

    
    return jsonify({
        'genders': [g[0] for g in genders if g[0]],
        'age_groups': [a for a in age_groups if a[0]],
        'rws': [r[0] for r in rws if r[0]]
    })
    
# Get filter options for frontend
@api.route('/lansia-locations', methods=['GET'])
def get_lansia_locations():
    data = Lansia.query.all()
    result = []
    # RW_POLYGONS = load_rw_polygons("../public/data/rw_cipamokolan.geojson")
    
    for person in data:
        rw = str(person.rw).upper()
        koordinat = getattr(person, "koordinat", "-")
        lat, lon = None, None
        
        try:
            lat, lon = koordinat.split(sep=',')
        except:
            continue
            # polygon = RW_POLYGONS.get(f'RW{rw}')
            # if polygon:
            #     point = generate_random_point_in_polygon(polygon)
            #     if point:
            #         lat, lon = point.y, point.x  # lat, lon
            #     else:
            #         continue  # skip if failed to generate
            # else:
            #     polygon = RW_POLYGONS.get('CIPAMOKOLAN')
            #     point = generate_random_point_in_polygon(polygon)
            #     if point:
            #         lat, lon = point.y, point.x  # lat, lon
            #     else:
            #         continue  # skip if failed to generate
            

        result.append({
            "latitude": float(lat) if lat else None,
            "longitude": float(lon) if lon else None
        })

    return jsonify(result)


#BULk delete lansia
@api.route('/lansia/bulk-delete', methods=['POST'])
@login_required
def bulk_delete_lansia():
    data = request.get_json()
    ids = data.get('ids', [])
    
    if not ids:
        return jsonify({'message': 'No IDs provided'}), 400
    
    try:
        # Delete all lansia with the provided IDs
        deleted_count = Lansia.query.filter(Lansia.id.in_(ids)).delete(synchronize_session=False)
        db.session.commit()
        
        return jsonify({
            'message': f'{deleted_count} data lansia berhasil dihapus',
            'deleted_count': deleted_count
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 400