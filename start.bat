@echo off
title A Little World
echo ================================
echo   小世界 · A Little World
echo ================================
echo.

where python >nul 2>nul
if errorlevel 1 (
    echo [X] Python not found
    pause
    exit /b
)

where node >nul 2>nul
if errorlevel 1 (
    echo [X] Node.js not found
    pause
    exit /b
)

echo [1/2] Starting backend on http://localhost:8765 ...
cd /d "%~dp0backend"
start "Backend" /min cmd /k python main.py

echo       Waiting...
timeout /t 3 /nobreak >nul

echo [2/2] Starting frontend on http://localhost:5173 ...
cd /d "%~dp0frontend"
start "Frontend" /min cmd /k npm run dev

timeout /t 4 /nobreak >nul
start http://localhost:5173

echo.
echo ================================
echo   Backend:  http://localhost:8765
echo   Frontend: http://localhost:5173
echo ================================
echo.
echo Close this window to stop,
echo or close the two minimized cmd windows.
pause
