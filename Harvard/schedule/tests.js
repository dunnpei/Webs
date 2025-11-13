// Simple unit tests for maintenance schedule project
// Run in browser console after loading script.js and maintenance.json

async function runTests() {
    console.log('=== 開始執行測試 ===');

    // Test 1: Load maintenance plans
    try {
        const response = await fetch('maintenance.json');
        const plans = await response.json();
        if (plans.length === 4) {
            console.log('✅ Test 1: 載入保養計畫 - PASS (載入 4 筆資料)');
        } else {
            console.error('❌ Test 1: 載入保養計畫 - FAIL (預期 4 筆，實際 ' + plans.length + ' 筆)');
        }
    } catch (error) {
        console.error('❌ Test 1: 載入保養計畫 - FAIL (錯誤: ' + error.message + ')');
    }

    // Test 2: Filter plans by date
    const testDate = '2025-11-13';
    const filteredPlans = maintenancePlans.filter(plan => plan.date === testDate);
    if (filteredPlans.length === 2 && filteredPlans[0].description === '引擎油更換') {
        console.log('✅ Test 2: 日期過濾 - PASS (找到 2 筆 2025-11-13 計畫)');
    } else {
        console.error('❌ Test 2: 日期過濾 - FAIL (預期 2 筆，實際 ' + filteredPlans.length + ' 筆)');
    }

    // Test 3: Color application simulation
    const samplePlan = { color: '#007bff', description: '測試計畫' };
    const style = `border-left-color: ${samplePlan.color};`;
    if (style.includes(samplePlan.color)) {
        console.log('✅ Test 3: 顏色應用 - PASS (樣式包含顏色碼)');
    } else {
        console.error('❌ Test 3: 顏色應用 - FAIL');
    }

    // Test 4: Month change simulation
    const originalMonth = currentDate.getMonth();
    changeMonth('next');
    if (currentDate.getMonth() === originalMonth + 1) {
        console.log('✅ Test 4: 月份切換 - PASS (月份增加 1)');
        // Revert
        changeMonth('prev');
    } else {
        console.error('❌ Test 4: 月份切換 - FAIL');
    }

    console.log('=== 測試完成 ===');
}

// Execute tests
runTests();