#!/bin/sh

echo "=================================================="
echo "🚀 TeacherOS Cloud Suite (Web + API + Telegram Bot Webhook)"
echo "Port: ${PORT:-8080}"
echo "Public URL: ${PUBLIC_URL:-https://teacheros-0l68.onrender.com}"
echo "=================================================="

# Start Web, API and Telegram Webhook Server
perl server.pl &
SERVER_PID=$!

trap 'kill -TERM ${SERVER_PID} 2>/dev/null; exit 0' SIGTERM SIGINT

echo "TeacherOS Unified Server started (PID: $SERVER_PID)"

while kill -0 "$SERVER_PID" 2>/dev/null; do
    sleep 3
done

echo "Process terminated. Shutting down..."
kill -TERM "$SERVER_PID" 2>/dev/null
exit 1
