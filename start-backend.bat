@echo off
title BuildTrack Backend Server (Port 5000)
cd /d %~dp0backend
echo ===================================================
echo   Starting BuildTrack Backend Server on Port 5000
echo ===================================================
node server.js
pause
