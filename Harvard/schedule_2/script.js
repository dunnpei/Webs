let maintenancePlans = [];
let currentDate = new Date();
let selectedDate = null;

async function loadMaintenancePlans() {
    // First, render calendar structure without data
    renderCalendar();

    try {
        // 替換為您的 Apps Script Web App URL（部署後取得）
        const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzE8GPi9u7PbWYWW8Eky8RUEcTgYppSZV6f8GON8l56w_cj7TeoXDsaEbjuK1xIv112DQ/exec';
        
        const response = await fetch(WEB_APP_URL);
        if (!response.ok) {
            throw new Error(`HTTP 錯誤: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success && result.data) {
            maintenancePlans = result.data;
            console.log('資料載入成功:', maintenancePlans.length, '筆');
        } else {
            console.log('回應無資料或錯誤:', result.error || '未知錯誤');
            maintenancePlans = [];
        }
    } catch (error) {
        console.error('Fetch 錯誤:', error);
        maintenancePlans = [];
    }
    
    // Re-render with data
    renderCalendar();
    highlightToday();
    renderMonthlyPlans();
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    document.getElementById('currentMonthYear').textContent = `${year} 年 ${month + 1} 月`;

    const grid = document.querySelector('.calendar-grid');
    // Clear existing days
    const existingDays = grid.querySelectorAll('.calendar-day');
    existingDays.forEach(day => day.remove());

    // Add empty cells for days before the 1st
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        grid.appendChild(emptyCell);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        dayElement.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Check if this day has plans
        const dayPlans = maintenancePlans.filter(plan => plan.Date === dayElement.dataset.date);
        if (dayPlans.length > 0) {
            dayElement.classList.add('has-plans');
            dayElement.title = `有 ${dayPlans.length} 個保養計畫`;
        }

        dayElement.addEventListener('click', () => selectDate(dayElement));
        grid.appendChild(dayElement);
    }
}

function selectDate(dayElement) {
    // Remove previous selection
    document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));

    // Select new date
    dayElement.classList.add('selected');
    selectedDate = dayElement.dataset.date;
    document.getElementById('selectedDate').textContent = selectedDate;

    // Render daily plans
    renderDailyPlans();
}

function renderDailyPlans() {
    const dailyPlansList = document.getElementById('daily-plans-list');
    if (!selectedDate) {
        dailyPlansList.innerHTML = '<p>請選擇一個日期。</p>';
        return;
    }

    const dayPlans = maintenancePlans.filter(plan => plan.Date === selectedDate);
    if (dayPlans.length === 0) {
        dailyPlansList.innerHTML = '<p>當日無保養計畫。</p>';
        return;
    }

    // Sort by time
    dayPlans.sort((a, b) => a.Time.localeCompare(b.Time));

    dailyPlansList.innerHTML = dayPlans.map(plan =>
        `<div class="plan-item" style="background-color: ${plan.Color};">
            <time>${plan.Time || '未定時'}</time> - ${plan.Description}
        </div>`
    ).join('');
}

function renderMonthlyPlans() {
    const monthlyPlansList = document.getElementById('monthly-plans-list');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const monthStr = String(month).padStart(2, '0');
    const monthPrefix = `${year}-${monthStr}`;

    if (maintenancePlans.length === 0) {
        monthlyPlansList.innerHTML = '<p>本月無保養計畫。</p>';
        return;
    }

    const monthPlans = maintenancePlans.filter(plan => plan.Date.startsWith(monthPrefix));
    if (monthPlans.length === 0) {
        monthlyPlansList.innerHTML = '<p>本月無保養計畫。</p>';
        return;
    }

    // Sort by date and time
    monthPlans.sort((a, b) => {
        if (a.Date !== b.Date) {
            return a.Date.localeCompare(b.Date);
        }
        return (a.Time || '').localeCompare(b.Time || '');
    });

    monthlyPlansList.innerHTML = monthPlans.map(plan =>
        `<div class="monthly-plan-item" style="background-color: ${plan.Color};">
            <div class="date">${plan.Date}</div>
            <time>${plan.Time || '未定時'}</time> - ${plan.Description}
        </div>`
    ).join('');
}

function setFooterYear() {
    const year = new Date().getFullYear();
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = year;
    }
}

function highlightToday() {
    // 使用台北時區格式化日期為 YYYY-MM-DD
    const todayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' });
    const today = todayFormatter.format(new Date());
    const todayElement = document.querySelector(`.calendar-day[data-date="${today}"]`);
    if (todayElement) {
        todayElement.classList.add('today');
        todayElement.title = '今天';
        // Auto-select today if no other date is selected
        if (!selectedDate) {
            selectDate(todayElement);
        }
    }
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    renderCalendar();
    // Re-highlight today if in current month
    highlightToday();
    renderMonthlyPlans();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('prevMonth').addEventListener('click', () => changeMonth('prev'));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth('next'));
    loadMaintenancePlans();
    setFooterYear();
});