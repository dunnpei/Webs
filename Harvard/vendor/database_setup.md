# Google Sheets 資料庫設定指南

本專案使用 Google Sheets 作為後端資料庫。請依照以下步驟建立您的資料表。

## 1. 建立 Google Sheet
請新增一個 Google Sheet，並將工作表名稱（Sheet Name）命名為 **`Vendors`**。

## 2. 設定欄位 (首列)
請在第一列（Row 1）設定以下欄位名稱（大小寫需一致）：

| 欄位名稱 (Header) | 說明 | 範例 / 格式 |
|------------------|------|-------------|
| `id` | 唯一識別碼 | 1, 2, v001 |
| `name` | 廠商名稱 | 極光數位設計 |
| `active` | 是否啟用 | TRUE 或 FALSE |
| `category` | 分類 | 電商購物, 企業形象, 活動頁面, 系統開發 |
| `city` | 所在城市 | 台北市, 台中市 |
| `address` | 地址 | 台北市信義區... |
| `phone` | 電話 | 02-1234-5678 |
| `website` | 官網連結 | https://... |
| `imageUrl` | 代表圖連結 | https://... (建議 800x600) |
| `shortDescription` | 列表簡介 | 短描述，建議 50 字內 |
| `fullDescription` | 詳細介紹 | 完整描述，支援換行 |
| `services` | 服務項目 | 服務A, 服務B, 服務C (用半形逗號分隔) |
| `cases` | 案例作品 | JSON 格式陣列，見下方說明 |

### 關於 `cases` 欄位
請填入 JSON 格式的字串，例如：
```json
[{"title":"案例A","url":"https://..."},{"title":"案例B","url":"https://..."}]
```
若不熟悉 JSON，也可自訂簡單格式（需修改程式碼支援）。

## 3. 部署 Google Apps Script (API)
1. 在 Google Sheet 點選 `擴充功能` > `Apps Script`。
2. 將專案提供的 `backend/code.gs` 內容複製貼上。
3. 儲存並點選 `部署` > `新增部署`。
4. 選擇類型：`網頁應用程式`。
5. 設定：
   - 執行身分：`我 (Me)`
   - 存取權：`任何人 (Anyone)` (重要！否則前端無法讀取)
6. 複製產生的 **Web App URL**。

## 4. 連接前端
將 Web App URL 填入前端專案的 `.env.local` 檔案中：
```
VITE_GOOGLE_SHEET_API_URL=您的Web_App_URL
```
