@echo off
chcp 65001 >nul
title 围物为心 WeiWuWeiXin — 创建桌面快捷方式
cd /d "%~dp0"

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║   🏮  围物为心 WeiWuWeiXin — 创建桌面快捷方式   ║
echo  ╚══════════════════════════════════════════════════╝
echo.

powershell -ExecutionPolicy Bypass -Command ^
"$src = '%~dp0一键安装.bat'; ^
$desktop = [Environment]::GetFolderPath('Desktop'); ^
$lnk = Join-Path $desktop '围物为心安装.lnk'; ^
$WshShell = New-Object -ComObject WScript.Shell; ^
$Shortcut = $WshShell.CreateShortcut($lnk); ^
$Shortcut.TargetPath = $src; ^
$Shortcut.WorkingDirectory = '%~dp0'; ^
$Shortcut.Description = '围物为心 WeiWuWeiXin — 一键安装'; ^
$Shortcut.Save(); ^
Write-Host '  ✅ 桌面快捷方式已创建！' -ForegroundColor Green; ^
Write-Host ''; ^
Write-Host '  现在可以从桌面双击「围物为心安装」来一键安装了。' -ForegroundColor Cyan"

echo.
pause
