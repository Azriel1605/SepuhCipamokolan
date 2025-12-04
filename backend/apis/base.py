from flask import Blueprint, request, jsonify, session, send_file
from flask_bcrypt import check_password_hash
from datetime import datetime, timedelta, date
from sqlalchemy import text, func, or_, and_
import pandas as pd
import io
import secrets
from sqlalchemy.dialects.postgresql import ARRAY  # Pastikan ini di-import
# from seed import generate_fake_data

from models import db, User, PasswordResetToken, Lansia, KesehatanLansia, KesejahteraanSosial, KeluargaPendamping, ADailyLiving


api = Blueprint('api', __name__)

# Helper function to check if user is logged in
def login_required(f):
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'message': 'Authentication required'}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

