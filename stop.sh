#!/bin/bash
launchctl unload ~/Library/LaunchAgents/com.teacheros.server.plist 2>/dev/null
launchctl unload ~/Library/LaunchAgents/com.teacheros.bot.plist 2>/dev/null
echo "TeacherOS stopped."
