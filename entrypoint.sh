#!/bin/sh

echo "=================================================="
echo "🚀 TeacherOS Cloud Suite (Web + API + Telegram Bot Webhook)"
echo "Port: ${PORT:-8080}"
echo "Public URL: ${PUBLIC_URL:-https://teacheros-0l68.onrender.com}"
echo "=================================================="

# Start Web, API and Telegram Webhook Server
perl server.pl &
SERVER_PID=$!

echo "TeacherOS Unified Server started (PID: $SERVER_PID)"

# Background Watchdog Daemon: Keeps Webhook active 24/7 and pings health
(
    sleep 3
    BOT_TOKEN="8979510433:AAGd4TEZb_rx4b8lZrFFfJfAz-dAI2ZRzMw"
    TARGET_WH="${PUBLIC_URL:-https://teacheros-0l68.onrender.com}/api/telegram-webhook"

    while true; do
        # 1. Heartbeat to local server port
        curl -s -m 4 "http://127.0.0.1:${PORT:-8080}/api/health" >/dev/null 2>&1 || true

        # 2. Check and restore Telegram Webhook
        WH_INFO=$(curl -s -m 6 "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" 2>/dev/null)
        if ! echo "$WH_INFO" | grep -q "$TARGET_WH"; then
            echo "⚠️ [WATCHDOG] Telegram Webhook missing or dropped! Restoring to $TARGET_WH..."
            curl -s -m 8 -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${TARGET_WH}&max_connections=40" || true
        fi
        sleep 20
    done
) &
WATCHDOG_PID=$!

trap 'kill -TERM ${SERVER_PID} ${WATCHDOG_PID} 2>/dev/null; exit 0' SIGTERM SIGINT

while kill -0 "$SERVER_PID" 2>/dev/null; do
    sleep 3
done

echo "Process terminated. Shutting down..."
kill -TERM "$SERVER_PID" "$WATCHDOG_PID" 2>/dev/null
exit 1
