#!/bin/bash
echo "=== TeacherOS Services Status ==="
launchctl list | grep teacheros || echo "TeacherOS services are NOT running."
