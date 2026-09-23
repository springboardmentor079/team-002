@echo off
title BuildTrack Platform Launcher
cd /d %~dp0
start "BuildTrack Backend (Port 5000)" cmd /k "cd /d %~dp0backend && node server.js"
start "BuildTrack Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"
echo ===================================================
echo   BuildTrack Backend & Frontend Launched Successfully!
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo ===================================================
