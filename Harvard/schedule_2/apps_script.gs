function doGet(e) {
  try {
    const SPREADSHEET_ID = '18u_zjZK9GNDuw2n5b51ABPYhvYQ__nNjgY6dGOPBVYs';
    const SHEET_NAME = 'schedule';
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ error: '工作表 ' + SHEET_NAME + ' 不存在' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    const headers = values[0];
    const data = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        let value = row[index];
        // 修復 Date 格式：轉為 YYYY-MM-DD（使用本地時區）
        if (header === 'Date') {
          if (value instanceof Date) {
            value = Utilities.formatDate(value, 'Asia/Taipei', 'yyyy-MM-dd');
          } else if (typeof value === 'string' && value.includes('T')) {
            // 若為 ISO 字串，解析後格式化
            const dateObj = new Date(value);
            if (!isNaN(dateObj.getTime())) {
              value = Utilities.formatDate(dateObj, 'Asia/Taipei', 'yyyy-MM-dd');
            }
          }
        }
        obj[header] = value;
      });
      return obj;
    });
    
    const response = { success: true, data: data };
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}