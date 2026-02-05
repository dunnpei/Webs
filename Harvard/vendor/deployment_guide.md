# GitHub Pages 部署指南

本專案已設定好 GitHub Pages 的部署流程。請依照以下步驟將網站發布上線。

## 1. 建立 GitHub Repository
1.  登入 [GitHub](https://github.com)。
2.  建立一個新的 Repository（例如 `vendor-intro`）。
3.  **不要** 勾選 "Initialize with README" 或其他初始化選項。

## 2. 推送程式碼
請在專案目錄下打開終端機（或使用 VS Code 終端機），依序執行以下指令：

```bash
# 加入所有檔案
git add .

# 提交變更
git commit -m "Initial commit for deployment"

# 設定遠端倉庫 (將以下網址換成您剛剛建立的 GitHub 網址)
git remote add origin https://github.com/您的帳號/您的倉庫名稱.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

## 3. 一鍵部署
程式碼推送到 GitHub 後，請執行以下指令將網站發布到 GitHub Pages：

```bash
npm run deploy
```

這個指令會自動：
1.  打包專案 (Build)
2.  將打包結果推送到 `gh-pages` 分支

## 4. 完成
部署成功後，您的網站將會在：
`https://您的帳號.github.io/您的倉庫名稱/`

## 注意事項：API 設定
由於 GitHub Pages 是靜態網頁，無法像本地開發一樣使用 `.env.local` 檔案。
**您必須修改 `.env.production` 檔案（如果沒有請建立），或直接修改程式碼：**

1. 建立 `.env.production` 檔案：
   ```
   VITE_GOOGLE_SHEET_API_URL=您的Web_App_URL
   ```

2. 再次執行 `npm run deploy` 更新部署。
