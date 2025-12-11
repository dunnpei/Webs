# 修繕修護紀錄系統

## 專案概述
這是一個靜態網頁應用程式，用於管理與呈現修繕修護紀錄。資料以年度為單位分組顯示，支援響應式介面（桌機/平板/手機）、按需展開詳細內容、狀態顏色區分（已完成/未完成）、已瀏覽標記、搜尋/過濾功能，以及鍵盤/無障礙支援。設計風格參照 [20251113_web_schedule](https://example.com/20251113_web_schedule) 專案，強調簡潔、一致性與可維護性。

- **核心功能**：
  - 自動載入 `repair_records.json` 並渲染年度清單（按日期排序）。
  - 卡片式介面：初始顯示日期、標題、狀態；點擊展開顯示概要、詳細內容、金額。
  - 視覺標記：已完成（綠邊）、未完成（紅邊）、已瀏覽（陰影 + ✓ 圖示）。
  - 互動：年度切換、即時搜尋（標題/日期/狀態）、localStorage 持久化瀏覽狀態。
  - 錯誤處理：JSON 載入失敗時顯示友善訊息與重新載入按鈕。
  - 效能：僅重繪變更區域，支援未來虛擬滾動擴充。

- **技術棧**：
  - 前端：純 HTML/CSS/JS（無外部框架依賴）。
  - 伺服器：Python 內建 HTTP 伺服器（靜態檔案服務）。
  - 環境：跨平台（Windows/macOS/Linux），無需安裝額外套件（僅需 Python 3+）。

## 檔案結構
```
20251115_web_fix/
├── index.html          # 主頁面結構（標頭、內容區、ARIA 標籤）
├── styles.css          # 響應式樣式（變數、卡片、網格佈局、hover 效果）
├── script.js           # 前端邏輯（模組化：資料載入/渲染/事件/工具）
├── repair_records.json # 示範資料（2024/2025 年度，多筆不同狀態案例）
├── schema.txt          # JSON 結構描述與擴充指南
├── start_server.bat    # Windows 一鍵啟動伺服器（端口 8001，背景執行 + PID 管理）
├── stop_server.bat     # Windows 一鍵停止伺服器（依 PID 終止）
└── README.md           # 本文件
```
- **模組化設計**（script.js）：
  - `dataModule`：JSON 載入、visited 狀態持久化。
  - `renderModule`：年度分組渲染、卡片展開/收起。
  - `eventModule`：點擊/鍵盤（Enter 展開、Esc 收起）、搜尋事件。
  - `utils`：排序（日期）、過濾（關鍵字/狀態）、DOM 操作輔助。
- **無障礙（WCAG AA）**：ARIA 屬性（aria-expanded、aria-controls）、高對比度、鍵盤導航、語意標籤（<details>/<summary> 模擬）。

## 環境需求
- **瀏覽器**：現代瀏覽器（Chrome/Edge/Firefox/Safari），支援 ES6+。
- **伺服器**：Python 3.6+（內建 `http.server` 模組）。
- **作業系統**：Windows（.bat 腳本）、macOS/Linux（可手動 `python -m http.server 8001`）。
- **無依賴**：純靜態，無 npm/yarn 需求（package.json 僅供參考）。

## 執行與測試步驟
### 1. 啟動本地伺服器
- **Windows**：雙擊 `start_server.bat`（自動背景啟動 Python 伺服器於端口 8001，生成 PID 檔）。
- **macOS/Linux**：終端執行 `python -m http.server 8001`（或使用 sh 腳本若有）。
- 瀏覽：開啟 http://localhost:8001/index.html。

### 2. 使用介面
- **年度切換**：下拉選單選擇年份（預設全部），自動重繪清單。
- **展開詳情**：點擊卡片標題（或 Enter 鍵），顯示 summary/details/amount；Esc 收起。
- **搜尋**：輸入關鍵字（e.g., "外牆" 或 "Completed"），即時過濾結果。
- **狀態標記**：展開後自動設 visited=true（localStorage 儲存，下次載入顯示 ✓ 圖示 + 陰影）。

### 3. 停止伺服器
- **Windows**：雙擊 `stop_server.bat`（讀取 PID 終止進程，清除 PID 檔）。
- **手動**：Ctrl+C 終端，或 `kill $(cat server.pid)`（若有 PID）。

### 4. 修改資料與重新載入
- 編輯 `repair_records.json`（新增年度/計畫，遵循 schema.txt）。
- 重新載入頁面（F5），自動渲染變更（無需重啟伺服器）。

### 5. 測試案例
- **響應式佈局**：
  - 桌面 (>1024px)：雙欄網格。
  - 手機 (<768px)：單欄堆疊。
  - 測試：調整瀏覽器視窗大小，驗證卡片/間距自動調整。
- **功能驗證**：
  - 載入：確認 2024/2025 年度顯示，按日期排序。
  - 展開：點擊 p2025-001，驗證 details/amount 出現，visited 標記更新。
  - 搜尋：輸入 "水管"，僅顯示相關計畫；清除輸入恢復全部。
  - 錯誤：暫移 `repair_records.json`，重新載入，驗證錯誤訊息 + 重試按鈕。
- **無障礙檢查**：
  - 鍵盤導航：Tab 聚焦卡片，Enter 展開，Shift+Tab 後退。
  - 螢幕閱讀器：NVDA/JAWS 讀取 aria-expanded 狀態與內容。
- **跨裝置**：手機模擬器測試觸控展開、滾動效能（<50 筆資料無滯後）。

## 開發與擴充
- **新增功能**：
  - 匯出 CSV：擴充 utils 模組，新增下載按鈕。
  - 過濾器：新增金額區間滑桿（script.js eventModule）。
  - 多語言：i18n 支援（未來擴充）。
- **風格一致性**（參照 20251113_web_schedule）：
  - 字型/間距：系統 sans-serif，8px 倍數間距。
  - 顏色：藍 (#007bff) 主色、綠/紅 狀態區分。
  - 元件：卡片陰影、按鈕 hover（scale + shadow）。
- **除錯**：
  - 開啟瀏覽器 DevTools，檢查 console 錯誤。
  - localStorage 清空：`localStorage.removeItem('repairVisited')` 重置 visited。
- **貢獻**：修改後測試完整，提交 PR 包含更新 schema.txt。

## 授權與注意
- 開源：MIT License（自由使用/修改）。
- 注意：生產環境建議 HTTPS；資料僅本地儲存，無後端上傳。

如遇問題，請檢查 Python 版本或提供錯誤日誌。