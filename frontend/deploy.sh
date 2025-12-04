#!/bin/bash


set -e

# === Konfigurasi ===
APP_DIR="/var/www/Lansia"
BACKEND_DIR="$APP_DIR/backend"
VENV_DIR="$BACKEND_DIR/venv"
FLASK_APP="app.py"
FLASK_PORT=8000
SERVICE_NAME="flask_lansia"
FRONTEND_BUILD_DIR="$APP_DIR/build"
SUBDOMAIN="lansia.cipamokolan.id"

git clone https://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@github.com/Azriel1605/Lansia.git "$APP_DIR"

echo "🚀 Memulai deployment React (Lansia) + Flask..."

# === Pastikan dependensi sistem ===
apt update -y
apt install -y python3 python3-venv python3-pip nodejs npm nginx postgresql-client

# === Build Frontend ===
echo "🧩 Membangun frontend React..."
cd "$APP_DIR"
npm install
npm run build

# === Setup Backend ===
echo "🐍 Menyiapkan backend Flask..."
cd "$BACKEND_DIR"

if [ ! -d "$VENV_DIR" ]; then
    echo "📁 Membuat virtual environment..."
    python3 -m venv venv
fi

source "$VENV_DIR/bin/activate"

pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn psycopg2-binary python-dotenv

deactivate

# === Setup systemd service untuk Flask ===
echo "⚙️ Membuat service systemd Flask..."

cat <<EOF > /etc/systemd/system/$SERVICE_NAME.service
[Unit]
Description=Gunicorn service for Flask backend (Lansia)
After=network.target

[Service]
User=root
WorkingDirectory=$BACKEND_DIR
Environment="PATH=$VENV_DIR/bin"
ExecStart=$VENV_DIR/bin/gunicorn --workers 4 --bind 127.0.0.1:$FLASK_PORT $FLASK_APP
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Aktifkan service
systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl restart $SERVICE_NAME

# === Setup Nginx ===
echo "🌐 Menyiapkan konfigurasi Nginx..."

cat <<EOF > /etc/nginx/sites-available/lansia.conf
server {
    listen 80;
    server_name $SUBDOMAIN;

    root $FRONTEND_BUILD_DIR;
    index index.html index.htm;

    # React routes
    location / {
        try_files \$uri /index.html;
    }

    # Proxy ke Flask API
    location /api {
        proxy_pass http://127.0.0.1:$FLASK_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    error_log /var/log/nginx/lansia_error.log;
    access_log /var/log/nginx/lansia_access.log;
}
EOF

ln -sf /etc/nginx/sites-available/lansia.conf /etc/nginx/sites-enabled/lansia.conf
nginx -t && systemctl restart nginx

echo "✅ Deploy selesai!"
echo "🌍 Website dapat diakses di: http://$SUBDOMAIN"
