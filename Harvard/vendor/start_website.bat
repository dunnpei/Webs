@echo off
chcp 65001
cd /d "%~dp0"
echo ==========================================
echo 正在啟動網頁設計廠商名錄網站...
echo 啟動後請按住 Ctrl 並點擊顯示的網址 (例如 http://localhost:5173)
echo 若要關閉伺服器，請直接關閉此視窗，或按 Ctrl + C
echo ==========================================
call npm run dev
pause
