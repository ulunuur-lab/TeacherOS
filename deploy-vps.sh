#!/bin/bash
set -e

# ==============================================================================
# TeacherOS — 1-Click Cloud / VPS Deployer (Ubuntu / Debian)
# Ushbu skript TeacherOS ni har qanday Linux VPS da 24/7 rejimda ishlatadi.
# ==============================================================================

echo "🚀 [TeacherOS] Cloud o'rnatish jarayoni boshlanmoqda..."

APP_DIR="/opt/teacheros"
CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. Update & Dependencies
echo "📦 Zarur paketlar o'rnatilmoqda (perl, curl, nginx)..."
apt-get update -y
apt-get install -y perl curl libjson-pp-perl nginx

# 2. Setup App Directory
mkdir -p "$APP_DIR/bot"
cp -rf "$CURRENT_DIR/server.pl" "$APP_DIR/"
cp -rf "$CURRENT_DIR/index.html" "$APP_DIR/"
cp -rf "$CURRENT_DIR/bot/"* "$APP_DIR/bot/"

chmod +x "$APP_DIR/server.pl" "$APP_DIR/bot/bot.pl"

# 3. Create systemd service for TeacherOS Server
cat <<EOF > /etc/systemd/system/teacheros-server.service
[Unit]
Description=TeacherOS Web & API Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/perl $APP_DIR/server.pl
Restart=always
RestartSec=3
Environment=PORT=8080
Environment=BASE_DIR=$APP_DIR
Environment=DB_FILE=$APP_DIR/bot/database.json

[Install]
WantedBy=multi-user.target
EOF

# 4. Create systemd service for TeacherOS Telegram Bot
cat <<EOF > /etc/systemd/system/teacheros-bot.service
[Unit]
Description=TeacherOS Telegram Bot Poller
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/perl $APP_DIR/bot/bot.pl
Restart=always
RestartSec=3
Environment=BASE_DIR=$APP_DIR
Environment=DB_FILE=$APP_DIR/bot/database.json

[Install]
WantedBy=multi-user.target
EOF

# 5. Reload and Enable Services
systemctl daemon-reload
systemctl enable teacheros-server.service
systemctl enable teacheros-bot.service
systemctl restart teacheros-server.service
systemctl restart teacheros-bot.service

echo ""
echo "=================================================="
echo "✅ TeacherOS Cloud xizmati muvaffaqiyatli ishga tushirildi!"
echo "• Server holati: systemctl status teacheros-server"
echo "• Bot holati:    systemctl status teacheros-bot"
echo "• Veb-interfeys: http://<SERVER_IP>:8080"
echo "=================================================="
