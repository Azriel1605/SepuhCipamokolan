from base import *

# Dashboard routes
@api.route('/dashboard/demographics', methods=['GET'])
@login_required
def get_demographics():
    total_lansia = Lansia.query.count()
    
    gender_stats = db.session.query(
        Lansia.jenis_kelamin,
        func.count(Lansia.id)
    ).group_by(Lansia.jenis_kelamin).all()
    
    age_group_stats = db.session.query(
        Lansia.kelompokUsia,
        func.count(Lansia.id)
    ).group_by(Lansia.kelompokUsia).all()
    
    location_stats = db.session.query(
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
    health_condition_stats = db.session.query(
        KesehatanLansia.kondisi_kesehatan_umum,
        func.count(KesehatanLansia.id)
    ).group_by(KesehatanLansia.kondisi_kesehatan_umum).all()
    
    # Chronic diseases query
    chronic_diseases = db.session.execute(
        text("""
        SELECT unnest(riwayat_penyakit_kronis) as disease, COUNT(*) as count
        FROM kesehatan_lansia 
        WHERE riwayat_penyakit_kronis IS NOT NULL
        GROUP BY disease
        ORDER BY count DESC
        """)
    ).fetchall()
    
    nutrition_stats = db.session.query(
        KesehatanLansia.status_gizi,
        func.count(KesehatanLansia.id)
    ).group_by(KesehatanLansia.status_gizi).all()
    
    return jsonify({
        'health_conditions': [{'condition': h[0], 'count': h[1]} for h in health_condition_stats if h[0]],
        'chronic_diseases': [{'disease': d[0], 'count': d[1]} for d in chronic_diseases],
        'nutrition_status': [{'status': n[0], 'count': n[1]} for n in nutrition_stats if n[0]]
    })

@api.route('/dashboard/social-welfare', methods=['GET'])
@login_required
def get_social_welfare_stats():
    housing_stats = db.session.query(
        KesejahteraanSosial.kondisi_rumah,
        func.count(KesejahteraanSosial.id)
    ).group_by(KesejahteraanSosial.kondisi_rumah).all()
    
    urgent_needs = db.session.execute(
        text("""
        SELECT unnest(kebutuhan_mendesak) as need, COUNT(*) as count
        FROM kesejahteraan_sosial 
        WHERE kebutuhan_mendesak IS NOT NULL
        GROUP BY need
        ORDER BY count DESC
        """)
    ).fetchall()
    
    return jsonify({
        'housing_conditions': [{'condition': h[0], 'count': h[1]} for h in housing_stats if h[0]],
        'urgent_needs': [{'need': u[0], 'count': u[1]} for u in urgent_needs]
    })

@api.route('/dashboard/needs-potential', methods=['GET'])
@login_required
def get_needs_potential():
    participation_stats = db.session.query(
        KeluargaPendamping.partisipasi_program_bkl,
        func.count(KeluargaPendamping.id)
    ).group_by(KeluargaPendamping.partisipasi_program_bkl).all()
    
    return jsonify({
        'participation': [{'group': p[0], 'count': p[1]} for p in participation_stats if p[0]]
    })

@api.route('/dashboard/urgent-need-details/<need_type>', methods=['GET'])
@login_required
def get_urgent_need_details(need_type):
    print(f"Fetching urgent need details for: {need_type}")
    try:
        # Query to get lansia with specific urgent need using PostgreSQL array contains operator
        query = (
                Lansia.query
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