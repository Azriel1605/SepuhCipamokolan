import os
from datetime import timedelta
from dotenv import load_dotenv

# load_dotenv(dotenv_path="/var/www/Lansia/backend/.env")

class Config:
    # Database
    
    # SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://keyopptta:Ra_sy6a7e2@localhost/lansia_db')
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    print(SQLALCHEMY_DATABASE_URI)
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    
    # Konfigurasi Gmail SMTP
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'keyapkeyop@gmail.com'         # Email kamu
    MAIL_PASSWORD = 'nind plrl oikp rveu'          # App password dari Google
    MAIL_DEFAULT_SENDER = 'keyapkeyop@gmail.com'
    
    # CORS
    CORS_ORIGINS = [os.getenv("FRONTEND_URL", "http://lansia.cipamokolan.id")]
    CORS_SUPPORTS_CREDENTIALS = True

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
    SESSION_COOKIE_SECURE = True

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
