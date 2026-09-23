#!/bin/bash
launchctl load ~/Library/LaunchAgents/com.teacheros.server.plist 2>/dev/null
launchctl load ~/Library/LaunchAgents/com.teacheros.bot.plist 2>/dev/null
echo "TeacherOS started as macOS system services!"
launchctl list | grep teacheros
