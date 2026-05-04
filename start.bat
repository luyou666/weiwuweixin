
@echo off
chcp 65001 >nul
title WeiWuWeiXin - Starting...
echo ============================================
echo   WeiWuWeiXin
echo ============================================
echo.
echo   http://localhost:3002/zh/
echo.
echo   Press Ctrl+C to stop
echo ============================================
echo.
wsl -d Ubuntu -- bash -c "cd /home/zhuwankai/weiwuweixin && ./start.sh"
echo.
echo Stopped. Press any key to close...
pause >nul
