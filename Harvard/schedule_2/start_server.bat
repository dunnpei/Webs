@echo off
chcp 65001 > nul
echo 啟動 Python HTTP 伺服器於端口 8000...
start "Python Server" cmd /k python -m http.server 8000
echo 等待伺服器啟動...
timeout /t 3 /nobreak >nul
echo 開啟瀏覽器至 http://localhost:8000/index.html...
start http://localhost:8000/index.html
echo 完成！伺服器已在端口 8000 運行，瀏覽器已開啟。
pause