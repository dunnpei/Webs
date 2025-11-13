# 保養時程專案

## 專案概述
這是一個靜態網頁應用，用於以月曆方式呈現保養計畫。支援響應式設計（手機/電腦自適應）、每日多計畫顯示、顏色區分及瀏覽過往計畫。保養資料以 JSON 文字檔儲存，網頁讀取後渲染。

## 專案結構
- [`index.html`](index.html): 入口頁面，包含月曆與每日計畫容器。
- [`style.css`](style.css): 樣式檔案，實現 CSS Grid 月曆網格、Flexbox 佈局及 Media Queries 響應式。
- [`script.js`](script.js): 邏輯檔案，使用 XMLHttpRequest 讀取資料、動態渲染月曆、處理日期點擊/月份導航、應用顏色邊框。
- [`maintenance.json`](maintenance.json): 保養計畫資料（JSON 陣列，每筆包含 `id`、`date`、`time`、`description`、`color`）。
- [`tests.js`](tests.js): 單元測試腳本，在瀏覽器控制台執行 `runTests()` 驗證載入、過濾、顏色及月份切換。

## 執行方式
1. **使用本地伺服器（推薦，避免 CORS 問題）**：
   - 開啟終端，執行 `python -m http.server 8000`（或使用 VS Code "Live Server" 擴充套件）。
   - 在瀏覽器開啟 `http://localhost:8000/index.html`。
   - 修改 [`maintenance.json`](maintenance.json) 後，重新載入頁面即可同步更新。
   - **多專案管理**：若同時運行多個專案，每個專案使用不同埠（例如第一個 `python -m http.server 8000`，第二個 `python -m http.server 8001`）。開啟時指定對應 URL（如 `http://localhost:8001/index.html`），即可區分哪個專案（URL 埠號即為識別）。
   - **關閉伺服器**：網頁不使用時，在終端按 `Ctrl + C` 停止（確認 "KeyboardInterrupt" 後退出）。若直接關閉終端視窗，伺服器可能在背景運行：
     - **Windows**：開啟任務管理器（Ctrl + Shift + Esc），搜尋 "python.exe" 進程並結束任務。
     - **檢查埠號占用**：新終端執行 `netstat -ano | findstr :8000`，記錄 PID 後用 `taskkill /PID <PID> /F` 強制結束。
     - 若使用 VS Code Live Server，右鍵頁面選擇 "Stop Live Server"。

2. **直接開啟檔案（不推薦）**：
   - 雙擊 [`index.html`](index.html)，但 JSON 載入可能失敗（瀏覽器安全限制）。

## 功能說明
- **月曆顯示**：自動渲染當前月份，點擊日期顯示該日計畫（自動選中今日）。
- **多計畫處理**：每日可有多筆，按時間排序顯示。
- **顏色區分**：使用 `color` 屬性設定邊框顏色（例如 `#007bff` 藍色）。
- **過往瀏覽**：點擊「上/下個月」導航，標記有計畫日期（黃色背景）。
- **響應式**：小螢幕垂直堆疊，大螢幕並排月曆與計畫區。

## 資料格式範例與說明
```json
[
  {
    "id": "plan_1",
    "date": "2025-11-13",
    "time": "10:00",
    "description": "引擎油更換",
    "color": "#007bff"
  }
]
```

- **`id`**：每個保養計畫的唯一識別碼（string），用於未來操作如修改或刪除。不需依序填寫，只要確保全域唯一即可（例如 "plan_1"、"maintenance_abc" 或使用 UUID 生成器）。目前未使用，但預留以擴充功能。
- **`date`**：日期格式 "YYYY-MM-DD"。
- **`time`**：時間格式 "HH:MM"（可選，若無則視為全天）。
- **`description`**：計畫描述文字。
- **`color`**：十六進位顏色碼（例如 "#FF0000" 紅色）。

新增保養時，直接在陣列中插入新物件，`id` 可自訂唯一值（無需順序）。

## 除錯
- 開啟 F12 控制台，檢查 log（如 "資料載入成功"）。
- 若載入失敗，使用 fallback 邏輯（目前移除 fallback 以強制從 JSON 讀取）。
- 快取問題：按 `Ctrl + F5` 硬重新載入，或在 Network 標籤勾選「Disable cache」。

## 未來擴充
- 新增編輯/新增計畫 UI（使用 `id` 更新特定項目）。
- 整合後端儲存（如 IndexedDB）。