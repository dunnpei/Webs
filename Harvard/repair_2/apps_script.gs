/**
 * Google Apps Script: 修繕紀錄 JSON API
 * 讀取指定 Google Sheets (ID: 18u_zjZK9GNDuw2n5b51ABPYhvYQ__nNjgY6dGOPBVYs) 的內容，
 * 轉換為原 JSON 結構 (年度分組)，並回傳 JSON 回應。
 * 
 * 部署步驟：
 * 1. 開啟 https://script.google.com 建立新專案。
 * 2. 取代 Code.gs 內容為此程式碼。
 * 3. 儲存專案 (命名如 "Repair Records API")。
 * 4. 點擊「部署」>「新增部署」> 類型: Web 應用程式 > 執行身分: 我 > 存取權: 任何人。
 * 5. 部署後複製 Web 應用程式 URL (如 https://script.google.com/macros/s/[ID]/exec)。
 * 6. 在專案中回報此 URL，我會更新 script.js 的 fetch 來源。
 * 
 * 注意：確保 Apps Script 有權限存取 Sheets (授權時允許)。
 * 若 Sheets 結構變更，調整 getSheetData() 中的欄位索引。
 */

function doGet(e) {
  try {
    const data = getSheetData();
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: '資料載入失敗: ' + error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheetData() {
  const SHEET_ID = '18u_zjZK9GNDuw2n5b51ABPYhvYQ__nNjgY6dGOPBVYs';
  const SHEET_NAME = 'repair'; // 預設工作表名稱，若不同請修改
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  if (data.length < 1) return [];
  
  // 假設第一行為標頭，後續為資料
  const headers = data[0].map(h => h.toString().toLowerCase().trim());
  const rawPlans = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row.length < headers.length || !row[headers.indexOf('id')]) continue; // 跳過空行
    
    const plan = {
      id: row[headers.indexOf('id')] || '',
      date: row[headers.indexOf('date')] || '',
      title: row[headers.indexOf('title')] || '',
      status: row[headers.indexOf('status')] || 'Incomplete',
      details: row[headers.indexOf('details')] || '',
      amount: parseFloat(row[headers.indexOf('amount')]) || undefined,
      photos: row[headers.indexOf('photos')] ? row[headers.indexOf('photos')].toString().split(',').map(p => p.trim()).filter(p => p) : [],
      visited: row[headers.indexOf('visited')] ? row[headers.indexOf('visited')].toString().toLowerCase() === 'true' : false
    };
    
    const year = parseInt(row[headers.indexOf('year')]) || new Date(plan.date).getFullYear();
    plan.year = year;
    
    rawPlans.push(plan);
  }
  
  // 按年分組
  const yearMap = {};
  rawPlans.forEach(plan => {
    const year = plan.year;
    if (!yearMap[year]) {
      yearMap[year] = { year, plans: [] };
    }
    const { year: _, ...cleanPlan } = plan;
    yearMap[year].plans.push(cleanPlan);
  });
  
  return Object.values(yearMap).sort((a, b) => b.year - a.year);
}

// 測試函數：執行此函數檢查輸出 (在 Apps Script 編輯器中選取並執行)
function testGetSheetData() {
  console.log(JSON.stringify(getSheetData(), null, 2));
}