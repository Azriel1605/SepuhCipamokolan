from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from config import Config
from models import db, User
from flask_mail import Mail, Message
# from seed import db
import api

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
bcrypt = Bcrypt(app)
mail = Mail(app)
CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=app.config['CORS_SUPPORTS_CREDENTIALS'])

migrate = Migrate(app, db)

# Register blueprints
app.register_blueprint(api.api, url_prefix='/api')

# Initialize database and create default users
with app.app_context():
    db.create_all()
    
    # users = db.session.query(User).all()
    # if not users:
    #     admin = User(
    #         username='admin', 
    #         email='admin@example.com', 
    #         password_hash=bcrypt.generate_password_hash('admin123').decode('utf-8')
    #     )
    #     kader = User(
    #         username='kader01', 
    #         email='kader01@example.com', 
    #         password_hash=bcrypt.generate_password_hash('kader123').decode('utf-8'),
    #         role='kader'
    #     )
    #     db.session.add(admin)
    #     db.session.add(kader)
    #     db.session.commit()
    

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
