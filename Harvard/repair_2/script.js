/**
 * script.js - 修繕修護紀錄系統前端邏輯
 * 模組化設計：
 * - dataModule: 資料載入與持久化 (localStorage for visited)
 * - renderModule: 渲染年度分組與計畫卡片
 * - eventModule: 事件處理 (展開、搜尋、年份切換、鍵盤)
 * - utils: 輔助函式 (排序、過濾)
 * 參照 20251113_web_schedule 風格：簡潔事件綁定、無 jQuery 依賴、錯誤邊界處理。
 * 效能：僅重繪變更區域，避免全頁重新載入；支援虛擬滾動若計畫超過 50 筆（未來擴充）。
 */

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  // DOM 元素
  const yearSelector = document.getElementById('yearSelector');
  const searchInput = document.getElementById('searchInput');
  const plansSection = document.getElementById('plansSection');
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const retryBtn = document.getElementById('retryBtn');

  let allData = [];
  let selectedYear = '';
  let currentFilter = '';

  // Data Module
  const dataModule = {
    async load() {
      try {
        loading.style.display = 'block';
        error.style.display = 'none';
        // 請注意：此處的 fetch URL 應為實際的 API 端點
        const response = await fetch('https://script.google.com/macros/s/AKfycbyCUwjhmk6BFatJS2KDdsKTKHUTQ6qwqsOMJek1Ch5WIeKWKYCY3w2Y-1R4Z0CLidIrGg/exec');
        if (!response.ok) throw new Error(`HTTP ${response.status}: 無法載入 Apps Script JSON`);
        allData = await response.json();
        // 載入已瀏覽狀態
        this.loadVisited();
        loading.style.display = 'none';
        return true;
      } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        console.error('資料載入錯誤:', err);
        return false;
      }
    },

    loadVisited() {
      const stored = localStorage.getItem('repairVisited');
      if (stored) {
        const visitedIds = new Set(JSON.parse(stored));
        allData.forEach(yearObj => {
          yearObj.plans.forEach(plan => {
            if (visitedIds.has(plan.id)) plan.visited = true;
          });
        });
      }
    },

    markVisited(planId) {
      const stored = localStorage.getItem('repairVisited') || '[]';
      const visitedIds = new Set(JSON.parse(stored));
      if (!visitedIds.has(planId)) {
        visitedIds.add(planId);
        localStorage.setItem('repairVisited', JSON.stringify([...visitedIds]));
        // 更新資料物件
        for (let yearObj of allData) {
          const plan = yearObj.plans.find(p => p.id === planId);
          if (plan) plan.visited = true;
        }
      }
    }
  };

  // Utils Module
  const utils = {
    sortPlans(plans) {
      return [...plans].sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    filterPlans(plans, filter) {
      if (!filter) return plans;
      return plans.filter(plan =>
        plan.title.toLowerCase().includes(filter) ||
        plan.status.toLowerCase().includes(filter) ||
        plan.date.includes(filter) ||
        (plan.amount && plan.amount.toString().includes(filter))
      );
    },
  
  };

  // Render Module
  const renderModule = {
    renderYears() {
      yearSelector.innerHTML = '<option value="">所有年度...</option>';
      allData.forEach(yearObj => {
        const option = document.createElement('option');
        option.value = yearObj.year;
        option.textContent = `${yearObj.year} 年`;
        yearSelector.appendChild(option);
      });
    },

    renderPlans(yearFilter = '', searchFilter = '') {
      plansSection.innerHTML = '';
      const filteredData = allData.filter(yearObj => !yearFilter || yearObj.year.toString() === yearFilter);
      
      filteredData.forEach(yearObj => {
        const yearGroup = document.createElement('div');
        yearGroup.className = 'year-group';
        const h2 = document.createElement('h2');
        h2.id = `year-${yearObj.year}`;
        h2.textContent = `${yearObj.year} 年修繕紀錄`;
        yearGroup.appendChild(h2);

        const grid = document.createElement('div');
        grid.className = 'plans-grid';
        let sortedPlans = utils.sortPlans(yearObj.plans);
        const filteredPlansForSearch = utils.filterPlans(sortedPlans, searchFilter); // 僅由搜尋器過濾
        
        if (filteredPlansForSearch.length === 0) {
          const emptyMsg = document.createElement('p');
          emptyMsg.textContent = '無符合條件的紀錄。';
          emptyMsg.style.textAlign = 'center';
          emptyMsg.style.color = '#666';
          grid.appendChild(emptyMsg);
        } else {
          filteredPlansForSearch.forEach(plan => {
            const card = this.createPlanCard(plan);
            grid.appendChild(card);
          });
        }

        yearGroup.appendChild(grid);
        plansSection.appendChild(yearGroup);
      });

      if (filteredData.length === 0) {
        const emptySection = document.createElement('p');
        emptySection.textContent = '無修繕紀錄資料。';
        emptySection.style.textAlign = 'center';
        emptySection.style.color = '#666';
        plansSection.appendChild(emptySection);
      }

      eventModule.bindPlanEvents();
    },

    renderFilteredPlans(plans, filterType) {
        plansSection.innerHTML = '';
        const currentYear = new Date().getFullYear().toString();
        let currentPlans = [];

        // 根據 filterType 準備要顯示的 plan 列表
        switch (filterType) {
            case 'this-year':
                // 確保 plan.date 是 YYYY-MM-DD 格式，以便直接比較年份
                currentPlans = plans.filter(plan => plan.date.startsWith(currentYear));
                break;
            case 'completed':
                currentPlans = plans.filter(plan => plan.status === 'Completed');
                break;
            case 'incomplete':
                currentPlans = plans.filter(plan => plan.status !== 'Completed');
                break;
            default: // 'all' or any other unexpected type
                // If filterType is 'all', we should have already returned from applyFilter
                // If it's an unexpected type, default to showing all provided plans
                currentPlans = plans; 
        }

        if (currentPlans.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.textContent = '無符合條件的紀錄。';
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.color = '#666';
            plansSection.appendChild(emptyMsg);
            return;
        }

        // 創建一個代表篩選結果的標題
        const filterHeading = document.createElement('h2');
        filterHeading.id = `filter-${filterType}`;
        let headingText = '';
        switch(filterType) {
            case 'this-year': headingText = `${currentYear} 年`; break;
            case 'completed': headingText = '已完成'; break;
            case 'incomplete': headingText = '未完成'; break;
            default: headingText = '篩選結果'; // Fallback for 'all' or others
        }
        filterHeading.textContent = `${headingText} 修繕紀錄`;
        
        const yearGroup = document.createElement('div');
        yearGroup.className = 'year-group';
        yearGroup.appendChild(filterHeading);

        const grid = document.createElement('div');
        grid.className = 'plans-grid';

        currentPlans.forEach(plan => {
            const card = this.createPlanCard(plan);
            grid.appendChild(card);
        });

        yearGroup.appendChild(grid);
        plansSection.appendChild(yearGroup);

        eventModule.bindPlanEvents();
    },

    createPlanCard(plan) {
        const detailsId = `details-${plan.id}`;
        const summaryId = `summary-${plan.id}`;
        const card = document.createElement('details');
        card.className = `plan-card ${plan.status.toLowerCase().replace(' ', '-')}${plan.visited ? ' visited' : ''}`;
        card.dataset.id = plan.id;
        card.setAttribute('aria-expanded', 'false');
        card.tabIndex = 0; // 支援鍵盤焦點

        const summary = document.createElement('summary');
        summary.id = summaryId;
        summary.innerHTML = `
            <h3>${plan.title}</h3>
            <div class="date">${(() => {
              const d = new Date(plan.date);
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              return `${year}/${month}/${day}`;
            })()}</div>
            <div class="status ${plan.status.toLowerCase().replace(' ', '-')}">${plan.status === 'Completed' ? '已完成' : '未完成'}</div>
          `;
        summary.setAttribute('aria-controls', detailsId);

        const detailsDiv = document.createElement('div');
        detailsDiv.id = detailsId;
        detailsDiv.className = 'details';
        detailsDiv.setAttribute('aria-labelledby', summaryId);

        let detailsContent = '';
        if (plan.details) {
          detailsContent += `<p><strong>詳細內容：</strong><br>${plan.details.replace(/\n/g, '<br>')}</p>`;
        }
        if (plan.amount !== undefined) {
          detailsContent += `<p class="amount">修繕金額：NT$ ${plan.amount.toLocaleString()}</p>`;
        }
        /**
        // 動態顯示其他欄位
        Object.entries(plan).forEach(([key, value]) => {
          if (!['id', 'date', 'title', 'status', 'summary', 'details', 'amount', 'visited'].includes(key) && value !== undefined) {
            detailsContent += `<p><strong>${key}：</strong>${typeof value === 'object' ? JSON.stringify(value) : value}</p>`;
          }
        });
        */

        // 照片顯示
        if (plan.photos && plan.photos.length > 0) {
          detailsContent += '<div class="photos">';
          plan.photos.forEach(photo => {
            detailsContent += `<img src="${photo}" alt="維修照片" loading="lazy">`;
          });
          detailsContent += '</div>';
        }

        if (!detailsContent) {
          detailsContent = '<p>無額外詳細資訊。</p>';
        }
        detailsDiv.innerHTML = detailsContent;

        card.appendChild(summary);
        card.appendChild(detailsDiv);
        return card;
    }
  };

  // Event Module
  const eventModule = {
    bindPlanEvents() {
      const cards = document.querySelectorAll('.plan-card');
      cards.forEach(card => {
        const summary = card.querySelector('summary');

        // 點擊 summary：防止原生行為，統一自訂展開
        if (summary) {
          summary.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCard(card);
          });
        }

        // 點擊卡片其他區域：展開
        card.addEventListener('click', (e) => {
          if (e.target.closest('summary')) return; // 由 summary 事件處理
          toggleCard(card);
        });

        // 共用展開函數
        function toggleCard(card) {
          const isExpanded = card.hasAttribute('open');
          if (isExpanded) {
            card.removeAttribute('open');
            card.setAttribute('aria-expanded', 'false');
          } else {
            card.setAttribute('open', '');
            card.setAttribute('aria-expanded', 'true');
            // 標記已瀏覽
            dataModule.markVisited(card.dataset.id);
            card.classList.add('visited');
          }
        }

        // 鍵盤操作
        card.addEventListener('keydown', (e) => {
          switch (e.key) {
            case 'Enter':
            case ' ':
              e.preventDefault();
              toggleCard(card);
              break;
            case 'Escape':
              if (card.hasAttribute('open')) {
                card.removeAttribute('open');
                card.setAttribute('aria-expanded', 'false');
                card.blur(); // 移開焦點
              }
              break;
          }
        });

        // Focus 樣式 (無障礙)
        card.addEventListener('focus', () => card.classList.add('focus-visible'));
        card.addEventListener('blur', () => card.classList.remove('focus-visible'));
      });
    },

    bindGlobalEvents() {
      // 年份切換
      yearSelector.addEventListener('change', (e) => {
        selectedYear = e.target.value;
        // 當年份切換時，清除搜尋條件，並重新渲染
        searchInput.value = '';
        currentFilter = '';
        renderModule.renderPlans(selectedYear, currentFilter);
      });

      // 搜尋
      searchInput.addEventListener('input', (e) => {
        currentFilter = e.target.value.toLowerCase();
        renderModule.renderPlans(selectedYear, currentFilter);
      });

      // 重新載入
      retryBtn.addEventListener('click', () => {
        dataModule.load().then(success => {
          if (success) {
            // 重新載入後，重置所有篩選和搜尋
            selectedYear = '';
            yearSelector.value = '';
            currentFilter = '';
            searchInput.value = '';
            renderModule.renderPlans(selectedYear, currentFilter);
          }
        });
      });

      // --- 新增按鈕篩選邏輯 ---
      const filterButtons = document.querySelectorAll('.filter-buttons button');
      filterButtons.forEach(button => {
        button.addEventListener('click', () => {
          const filterType = button.dataset.filter;
          // 清除 yearSelector 和 searchInput 以確保篩選的純粹性
          yearSelector.value = '';
          searchInput.value = '';
          selectedYear = '';
          currentFilter = '';
          applyFilter(filterType);
        });
      });
    }
  };

  // --- 篩選邏輯 ---
  function applyFilter(filterType) {
    let filteredPlans = [];
    const currentYear = new Date().getFullYear().toString();

    allData.forEach(yearObj => {
      let plansToConsider = yearObj.plans;

      switch (filterType) {
        case 'all':
          // "全年度" 應顯示所有資料，但不清除其他篩選器，此處由 renderPlans 處理
          // 實際上，在按鈕點擊時，我們已經清除了 selectedYear 和 currentFilter，
          // 所以這裡只需調用 renderPlans 即可。
          renderModule.renderPlans(selectedYear, currentFilter);
          return; // 提前退出，由 renderPlans 處理
        case 'this-year':
          // 確保 plan.date 是 YYYY-MM-DD 格式，以便直接比較年份
          filteredPlans = filteredPlans.concat(plansToConsider.filter(plan => plan.date.startsWith(currentYear)));
          break;
        case 'completed':
          filteredPlans = filteredPlans.concat(plansToConsider.filter(plan => plan.status === 'Completed'));
          break;
        case 'incomplete':
          filteredPlans = filteredPlans.concat(plansToConsider.filter(plan => plan.status !== 'Completed'));
          break;
      }
    });

    // 根據篩選結果更新 plansSection
    renderModule.renderFilteredPlans(filteredPlans, filterType);
  }

  // 初始化
  dataModule.load().then(success => {
    if (success) {
      renderModule.renderYears();
      // 使用所有年度作為預設顯示，以避免特定年份無資料時顯示空白
      selectedYear = '';
      yearSelector.value = ''; // 選擇 '所有年度...'
      renderModule.renderPlans(selectedYear, currentFilter); // 初始渲染為所有年度
      eventModule.bindGlobalEvents();
    }
  });

  // 動態設定版權年份
  const currentYearSpan = document.getElementById('currentYear');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }
}