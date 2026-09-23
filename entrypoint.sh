#!/bin/sh

echo "=================================================="
echo "🚀 TeacherOS Cloud Suite (Web + API + Telegram Bot)"
echo "Port: ${PORT:-8080}"
echo "Public URL: ${PUBLIC_URL:-http://127.0.0.1:${PORT:-8080}}"
echo "=================================================="

# Start Web and API Server
perl server.pl &
SERVER_PID=$!

# Start Telegram Bot Poller
perl bot/bot.pl &
BOT_PID=$!

trap 'kill -TERM ${SERVER_PID} ${BOT_PID} 2>/dev/null; exit 0' SIGTERM SIGINT

echo "TeacherOS Server started (PID: $SERVER_PID)"
echo "TeacherOS Telegram Bot started (PID: $BOT_PID)"

while kill -0 "$SERVER_PID" 2>/dev/null && kill -0 "$BOT_PID" 2>/dev/null; do
    sleep 3
done

echo "Process terminated. Shutting down..."
kill -TERM "$SERVER_PID" "$BOT_PID" 2>/dev/null
exit 1
