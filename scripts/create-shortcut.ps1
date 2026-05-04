# WeiWuWeiXin - Create Desktop Shortcut
# This script creates a proper .lnk shortcut on Windows Desktop with custom icon
# Run from WSL: powershell.exe -ExecutionPolicy Bypass -File create-shortcut.ps1

$ErrorActionPreference = "Stop"

$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "WeiWuWeiXin.lnk"

# WSL path to icon (\\wsl$\Ubuntu\home\zhuwankai\weiwuweixin\assets\icon.ico)
$WslIconPath = "\\wsl$\Ubuntu\home\zhuwankai\weiwuweixin\assets\icon.ico"

# Fallback: Copy icon to Windows temp if WSL path doesn't work
$WinIconPath = "$env:LOCALAPPDATA\WeiWuWeiXin\icon.ico"
if (-not (Test-Path $WinIconPath)) {
    New-Item -ItemType Directory -Path "$env:LOCALAPPDATA\WeiWuWeiXin" -Force | Out-Null
    if (Test-Path $WslIconPath) {
        Copy-Item $WslIconPath $WinIconPath -Force
    }
}

# Use whichever icon path works
$IconPath = if (Test-Path $WslIconPath) { $WslIconPath } else { $WinIconPath }

$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)

$Shortcut.TargetPath = "C:\Windows\System32\wsl.exe"
$Shortcut.Arguments = '-d Ubuntu -- bash -c "cd /home/zhuwankai/weiwuweixin && ./start.sh"'
$Shortcut.WorkingDirectory = "\\wsl$\Ubuntu\home\zhuwankai\weiwuweixin"
$Shortcut.IconLocation = $IconPath
$Shortcut.Description = "围物为心 WeiWuWeiXin - 把心中的排序具象化"
$Shortcut.WindowStyle = 1  # Normal window
$Shortcut.Save()

Write-Host "Shortcut created: $ShortcutPath"
Write-Host "Icon: $IconPath"
