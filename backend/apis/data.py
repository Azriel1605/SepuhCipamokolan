from base import *

# Data routes
@api.route('/lansia', methods=['GET'])
@login_required
def get_lansia():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '', type=str)
    gender_filter = request.args.get('gender', '', type=str)
    # age_group_filter = request.args.get('age_group', '', type=str)
    age_group_filter = request.args.get('age_group', '', type=str)
    rw_filter = request.args.get('rw', '', type=str)
    sort_by = request.args.get('sort_by', 'nama_lengkap', type=str)
    sort_order = request.args.get('sort_order', 'asc', type=str)
    
    # Build query
    query = Lansia.query
    
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
            'usia': l.usia,
            'rt': l.rt,
            'rw': l.rw,
            'kelompok_usia': l.kelompokUsia,
            'alamat_lengkap': l.alamat_lengkap,
            'status_perkawinan': l.status_perkawinan,
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
            
    try:
        # Create main lansia record
        lansia_data = {
            'nama_lengkap': data.get('nama_lengkap'),
            'nik': data.get('nik'),
            'jenis_kelamin': data.get('jenis_kelamin'),
            'tanggal_lahir': datetime.strptime(data['tanggal_lahir'], '%Y-%m-%d').date() if data.get('tanggal_lahir') else None,
            'alamat_lengkap': data.get('alamat_lengkap'),
            'rt': data.get('rt'),
            'rw': data.get('rw'),
            'status_perkawinan': data.get('status_perkawinan'),
            'agama': data.get('agama'),
            'pendidikan_terakhir': data.get('pendidikan_terakhir'),
            'pekerjaan_terakhir': data.get('pekerjaan_terakhir'),
            'sumber_penghasilan': data.get('sumber_penghasilan')
        }
        
        lansia = Lansia(**lansia_data)
        db.session.add(lansia)
        db.session.flush()  # Get the ID without committing
        
        # Create health record if data exists
        if any(data.get(key) for key in ['kondisi_kesehatan_umum', 'riwayat_penyakit_kronis', 'status_gizi']):
            kesehatan = KesehatanLansia(
                lansia_id=lansia.id,
                kondisi_kesehatan_umum=data.get('kondisi_kesehatan_umum'),
                riwayat_penyakit_kronis=data.get('riwayat_penyakit_kronis', []),
                penggunaan_obat_rutin=data.get('penggunaan_obat_rutin'),
                alat_bantu=','.join(data.get('alat_bantu', [])),
                aktivitas_fisik=data.get('aktivitas_fisik'),
                status_gizi=data.get('status_gizi'),
                riwayat_imunisasi=data.get('riwayat_imunisasi')
            )
            db.session.add(kesehatan)
        
        # Create social welfare record if data exists
        if any(data.get(key) for key in ['dukungan_keluarga', 'kondisi_rumah', 'kebutuhan_mendesak']):
            kesejahteraan = KesejahteraanSosial(
                lansia_id=lansia.id,
                dukungan_keluarga=data.get('dukungan_keluarga'),
                kondisi_rumah=data.get('kondisi_rumah'),
                kebutuhan_mendesak=data.get('kebutuhan_mendesak', []),
                hobi_minat=data.get('hobi_minat'),
                kondisi_psikologis=data.get('kondisi_psikologis')
            )
            db.session.add(kesejahteraan)
        
        # Create family record if data exists
        if data.get('nama_pendamping'):
            keluarga = KeluargaPendamping(
                lansia_id=lansia.id,
                nama_pendamping=data.get('nama_pendamping'),
                hubungan_dengan_lansia=data.get('hubungan_dengan_lansia'),
                usia_pendamping=int(data.get('usia_pendamping')) if data.get('usia_pendamping') else None,
                pendidikan_pendamping=data.get('pendidikan_pendamping'),
                ketersediaan_waktu=data.get('ketersediaan_waktu'),
                partisipasi_program_bkl=data.get('keterlibatan_kelompok'),
                riwayat_partisipasi_bkl=data.get('riwayat_partisipasi')
            )
            db.session.add(keluarga)
        
        db.session.commit()
        return jsonify({'message': 'Data lansia berhasil ditambahkan', 'id': lansia.id}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 400

@api.route('/lansia/<int:lansia_id>', methods=['GET'])
@login_required
def get_lansia_detail(lansia_id):
    lansia = Lansia.query.get_or_404(lansia_id)
    
    # Get related data using relationships
    kesehatan = lansia.kesehatan
    kesejahteraan = lansia.kesejahteraan
    keluarga = lansia.keluarga
    daily_living = lansia.daily_living
    
    return jsonify({
        'id': lansia.id,
        'nama_lengkap': lansia.nama_lengkap,
        'nik': lansia.nik,
        'jenis_kelamin': lansia.jenis_kelamin,
        'tanggal_lahir': lansia.tanggal_lahir.isoformat() if lansia.tanggal_lahir else None,
        'usia': lansia.usia,
        'kelompok_usia': lansia.kelompokUsia,
        'alamat_lengkap': lansia.alamat_lengkap,
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
            'alat_bantu': kesehatan.alat_bantu.split(',') if kesehatan and kesehatan.alat_bantu else [],
            'aktivitas_fisik': kesehatan.aktivitas_fisik if kesehatan else None,
            'status_gizi': kesehatan.status_gizi if kesehatan else None,
            'riwayat_imunisasi': kesehatan.riwayat_imunisasi if kesehatan else None,
        } if kesehatan else None,
        'kesejahteraan': {
            'dukungan_keluarga': kesejahteraan.dukungan_keluarga if kesejahteraan else None,
            'kondisi_rumah': kesejahteraan.kondisi_rumah if kesejahteraan else None,
            'kebutuhan_mendesak': kesejahteraan.kebutuhan_mendesak if kesejahteraan else [],
            'hobi_minat': kesejahteraan.hobi_minat if kesejahteraan else None,
            'kondisi_psikologis': kesejahteraan.kondisi_psikologis if kesejahteraan else None,
        } if kesejahteraan else None,
        'keluarga': {
            'nama_pendamping': keluarga.nama_pendamping if keluarga else None,
            'hubungan_dengan_lansia': keluarga.hubungan_dengan_lansia if keluarga else None,
            'usia_pendamping': keluarga.usia_pendamping if keluarga else None,
            'pendidikan_pendamping': keluarga.pendidikan_pendamping if keluarga else None,
            'ketersediaan_waktu': keluarga.ketersediaan_waktu if keluarga else None,
            'partisipasi_program_bkl': keluarga.partisipasi_program_bkl if keluarga else None,
            'riwayat_partisipasi_bkl': keluarga.riwayat_partisipasi_bkl if keluarga else None,
        } if keluarga else None,
        'daily_living': {
            'bab': daily_living.bab if daily_living else None,
            'bak': daily_living.bak if daily_living else None,
            'membersihkan_diri': daily_living.membersihkan_diri if daily_living else None,
            'toilet': daily_living.toilet if daily_living else None,
            'makan': daily_living.makan if daily_living else None,
            'pindah_tempat': daily_living.pindah_tempat if daily_living else None,
            'mobilitas': daily_living.mobilitas if daily_living else None,
            'berpakaian': daily_living.berpakaian if daily_living else None,
            'naik_turun_tangga': daily_living.naik_turun_tangga if daily_living else None,
            'total': daily_living.total if daily_living else None,
        } if daily_living else None,
    })

@api.route('/lansia/<int:lansia_id>', methods=['PUT'])
@login_required
def update_lansia(lansia_id):
    lansia = Lansia.query.get_or_404(lansia_id)
    data = request.get_json()
    print(data)
    
    try:
        # Update main lansia record
        for key, value in data.items():
            if hasattr(lansia, key) and key != 'id':
                if key == 'tanggal_lahir' and value:
                    setattr(lansia, key, datetime.strptime(value, '%Y-%m-%d').date())
                else:
                    setattr(lansia, key, value)
        
                
        # Update health record
        if any(data.get(key) for key in ['kondisi_kesehatan_umum', 'riwayat_penyakit_kronis', 'status_gizi']):
            kesehatan = lansia.kesehatan
            if not kesehatan:
                kesehatan = KesehatanLansia(lansia_id=lansia.id)
                db.session.add(kesehatan)
            
            kesehatan.kondisi_kesehatan_umum = data.get('kondisi_kesehatan_umum')
            kesehatan.riwayat_penyakit_kronis = data.get('riwayat_penyakit_kronis', [])
            kesehatan.penggunaan_obat_rutin = data.get('penggunaan_obat_rutin')
            kesehatan.alat_bantu = ','.join(data.get('alat_bantu', []))
            kesehatan.aktivitas_fisik = data.get('aktivitas_fisik')
            kesehatan.status_gizi = data.get('status_gizi')
            kesehatan.riwayat_imunisasi = data.get('riwayat_imunisasi')
        
        # Update social welfare record
        if any(data.get(key) for key in ['dukungan_keluarga', 'kondisi_rumah', 'kebutuhan_mendesak']):
            kesejahteraan = lansia.kesejahteraan
            if not kesejahteraan:
                kesejahteraan = KesejahteraanSosial(lansia_id=lansia.id)
                db.session.add(kesejahteraan)
            
            kesejahteraan.dukungan_keluarga = data.get('dukungan_keluarga')
            kesejahteraan.kondisi_rumah = data.get('kondisi_rumah')
            kesejahteraan.kebutuhan_mendesak = data.get('kebutuhan_mendesak', [])
            kesejahteraan.hobi_minat = data.get('hobi_minat')
            kesejahteraan.kondisi_psikologis = data.get('kondisi_psikologis')
        
        # Update family record
        if data.get('nama_pendamping'):
            keluarga = lansia.keluarga
            if not keluarga:
                keluarga = KeluargaPendamping(lansia_id=lansia.id)
                db.session.add(keluarga)
            
            keluarga.nama_pendamping = data.get('nama_pendamping')
            keluarga.hubungan_dengan_lansia = data.get('hubungan_dengan_lansia')
            keluarga.usia_pendamping = int(data.get('usia_pendamping')) if data.get('usia_pendamping') else None
            keluarga.pendidikan_pendamping = data.get('pendidikan_pendamping')
            keluarga.ketersediaan_waktu = data.get('ketersediaan_waktu')
            keluarga.partisipasi_program_bkl = data.get('keterlibatan_kelompok')
            keluarga.riwayat_partisipasi_bkl = data.get('riwayat_partisipasi')
        
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