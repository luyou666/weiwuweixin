@echo off
chcp 65001 >nul
title 围物为心 WeiWuWeiXin — 一键安装
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0install.ps1"
pause
