@echo off
chcp 65001 >nul
echo =========================================
echo Life Coach AI 服务器启动中...
echo =========================================
echo.
cd /d "%~dp0"
node server.js
pause