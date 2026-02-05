# 網頁設計廠商名錄 (Vendor Directory)

這是一個展示網頁設計廠商資訊的響應式網頁應用程式，使用 React 建置，並支援 Google Sheets 作為後端資料庫。

## 功能特色
- **Google Sheets 整合**：資料直接由 Google Sheets 管理，透過 Google Apps Script API 讀取。
- **響應式設計**：手機優先 (Mobile First) 的卡片式佈局，完美適應各種裝置。
- **互動體驗**：支援關鍵字搜尋、分類/地區篩選、詳細資訊展開/收合。
- **效能優化**：支援資料快取 (Google Apps Script Cache) 與前端 Loading 狀態。

## 專案結構
- `App.tsx`: 主應用程式邏輯（狀態管理、篩選、分頁）。
- `components/`: UI 元件 (VendorCard, FilterBar)。
- `services/`: API 串接邏輯 (sheetService)。
- `backend/`: Google Apps Script 後端程式碼。

## 安裝與執行

1. **安裝依賴**
   ```bash
   npm install
   ```

2. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

3. **設定 Google Sheets 資料庫**
   - 請參閱 `database_setup.md` 了解如何建立試算表並部署 API。
   - 部署後，將 Web App URL 填入 `.env.local`：
     ```
     VITE_GOOGLE_SHEET_API_URL=https://script.google.com/macros/s/......./exec
     ```
   - 若未設定 URL，系統將自動載入模擬資料 (Mock Data) 供預覽使用。

## 技術棧
- Frontend: React 19, TypeScript, Vite
- Styling: Tailwind CSS (CDN/Config)
- Icons: Lucide React
- Backend: Google Sheets + Google Apps Script

## 授權
MIT
