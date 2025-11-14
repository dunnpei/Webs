let maintenancePlans = [];
let currentDate = new Date();
let selectedDate = null;

function loadMaintenancePlans() {
    // First, render calendar structure without data
    renderCalendar();

    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'maintenance.json', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if ((xhr.status === 0 || xhr.status === 200) && xhr.responseText) {
                try {
                    const parsedPlans = JSON.parse(xhr.responseText);
                    if (parsedPlans.length > 0) {
                        maintenancePlans = parsedPlans;
                        console.log('資料載入成功:', maintenancePlans.length, '筆');
                    } else {
                        console.log('JSON 空，無資料');
                        maintenancePlans = [];
                    }
                } catch (parseError) {
                    console.error('JSON 解析錯誤:', parseError);
                    maintenancePlans = [];
                }
            } else {
                console.warn('XHR 載入失敗 (status:', xhr.status, '), 無資料');
                maintenancePlans = [];
            }
            // Re-render with data
            renderCalendar();
            highlightToday();
            renderMonthlyPlans();
        }
    };
    xhr.onerror = function() {
        console.warn('XHR 錯誤，無資料');
        maintenancePlans = [];
        renderCalendar();
        highlightToday();
    };
    xhr.send();
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
        const dayPlans = maintenancePlans.filter(plan => plan.date === dayElement.dataset.date);
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

    const dayPlans = maintenancePlans.filter(plan => plan.date === selectedDate);
    if (dayPlans.length === 0) {
        dailyPlansList.innerHTML = '<p>當日無保養計畫。</p>';
        return;
    }

    // Sort by time
    dayPlans.sort((a, b) => a.time.localeCompare(b.time));

    dailyPlansList.innerHTML = dayPlans.map(plan =>
        `<div class="plan-item" style="background-color: ${plan.color};">
            <time>${plan.time || '未指定時間'}</time> - ${plan.description}
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

    const monthPlans = maintenancePlans.filter(plan => plan.date.startsWith(monthPrefix));
    if (monthPlans.length === 0) {
        monthlyPlansList.innerHTML = '<p>本月無保養計畫。</p>';
        return;
    }

    // Sort by date and time
    monthPlans.sort((a, b) => {
        if (a.date !== b.date) {
            return a.date.localeCompare(b.date);
        }
        return (a.time || '').localeCompare(b.time || '');
    });

    monthlyPlansList.innerHTML = monthPlans.map(plan =>
        `<div class="monthly-plan-item" style="background-color: ${plan.color};">
            <div class="date">${plan.date}</div>
            <time>${plan.time || '未指定時間'}</time> - ${plan.description}
        </div>`
    ).join('');
}

function highlightToday() {
    const today = new Date().toISOString().split('T')[0];
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
});