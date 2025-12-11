@echo off
chcp 65001 > nul
echo 正在關閉端口 8000 的 Python 伺服器...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    taskkill /PID %%a /F >nul 2>&1
)
if %errorlevel%==0 (
    echo 伺服器已關閉。
) else (
    echo 未找到端口 8000 的進程，或關閉失敗。
)
pause