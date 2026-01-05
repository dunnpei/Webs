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
        console.log('Loaded allData:', allData); // <-- 加入 console log 輸出 allData
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
      // 檢查 allData 是否為空，避免在空陣列上迭代
      if (allData && allData.length > 0) {
        allData.forEach(yearObj => {
          const option = document.createElement('option');
          option.value = yearObj.year;
          option.textContent = `${yearObj.year} 年`;
          yearSelector.appendChild(option);
        });
      }
    },

    renderPlans(yearFilter = '', searchFilter = '') {
      plansSection.innerHTML = '';
      
      // 檢查 allData 是否為空
      if (!allData || allData.length === 0) {
        plansSection.innerHTML = '<p style="text-align: center; color: #666;">無修繕紀錄資料。</p>';
        return;
      }

      const filteredDataByYear = allData.filter(yearObj => !yearFilter || yearObj.year.toString() === yearFilter);
      
      if (filteredDataByYear.length === 0 && yearFilter) { 
        plansSection.innerHTML = '<p style="text-align: center; color: #666;">無此年度的修繕紀錄。</p>';
        return;
      }
      
      filteredDataByYear.forEach(yearObj => {
        const yearGroup = document.createElement('div');
        yearGroup.className = 'year-group';
        const h2 = document.createElement('h2');
        h2.id = `year-${yearObj.year}`;
        h2.textContent = `${yearObj.year} 年修繕紀錄`;
        yearGroup.appendChild(h2);

        const grid = document.createElement('div');
        grid.className = 'plans-grid';
        let sortedPlans = utils.sortPlans(yearObj.plans);
        const filteredPlansForSearch = utils.filterPlans(sortedPlans, searchFilter); 
        
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

      // 移除先前獨立的 allData.length 檢查，因為上面的邏輯已涵蓋
      // if (filteredDataByYear.length === 0 && allData.length > 0) { ... }
      // else if (allData.length === 0) { ... }

      eventModule.bindPlanEvents();
    },

    renderFilteredPlans(plans, filterType) {
        plansSection.innerHTML = '';
        const currentYear = new Date().getFullYear().toString();
        let currentPlans = [];

        switch (filterType) {
            case 'this-year':
                currentPlans = plans.filter(plan => plan.date.startsWith(currentYear));
                break;
            case 'completed':
                currentPlans = plans.filter(plan => plan.status === 'Completed');
                break;
            case 'incomplete':
                currentPlans = plans.filter(plan => plan.status !== 'Completed');
                break;
            case 'all': 
                renderModule.renderPlans(selectedYear, currentFilter);
                return; 
            default: 
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

        const filterHeading = document.createElement('h2');
        filterHeading.id = `filter-${filterType}`;
        let headingText = '';
        switch(filterType) {
            case 'this-year': headingText = `${currentYear} 年`; break;
            case 'completed': headingText = '已完成'; break;
            case 'incomplete': headingText = '未完成'; break;
            default: headingText = '篩選結果'; 
        }
        if (headingText) {
             filterHeading.textContent = `${headingText} 修繕紀錄`;
        } else {
             filterHeading.textContent = '修繕紀錄';
        }
        
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
        card.tabIndex = 0; 

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

        if (summary) {
          summary.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCard(card);
          });
        }

        card.addEventListener('click', (e) => {
          if (e.target.closest('summary')) return; 
          toggleCard(card);
        });

        function toggleCard(card) {
          const isExpanded = card.hasAttribute('open');
          if (isExpanded) {
            card.removeAttribute('open');
            card.setAttribute('aria-expanded', 'false');
          } else {
            card.setAttribute('open', '');
            card.setAttribute('aria-expanded', 'true');
            dataModule.markVisited(card.dataset.id);
            card.classList.add('visited');
          }
        }

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
                card.blur(); 
              }
              break;
          }
        });

        card.addEventListener('focus', () => card.classList.add('focus-visible'));
        card.addEventListener('blur', () => card.classList.remove('focus-visible'));
      });
    },

    bindGlobalEvents() {
      yearSelector.addEventListener('change', (e) => {
        selectedYear = e.target.value;
        searchInput.value = '';
        currentFilter = '';
        renderModule.renderPlans(selectedYear, currentFilter);
      });

      searchInput.addEventListener('input', (e) => {
        currentFilter = e.target.value.toLowerCase();
        renderModule.renderPlans(selectedYear, currentFilter);
      });

      retryBtn.addEventListener('click', () => {
        dataModule.load().then(success => {
          if (success) {
            selectedYear = '';
            yearSelector.value = '';
            currentFilter = '';
            searchInput.value = '';
            renderModule.renderPlans(selectedYear, currentFilter);
          }
        });
      });

      const filterButtons = document.querySelectorAll('.filter-buttons button');
      filterButtons.forEach(button => {
        button.addEventListener('click', () => {
          const filterType = button.dataset.filter;
          yearSelector.value = '';
          searchInput.value = '';
          selectedYear = '';
          currentFilter = '';
          applyFilter(filterType);
        });
      });
    }
  };

  function applyFilter(filterType) {
    let filteredPlansForButton = []; 
    const currentYear = new Date().getFullYear().toString();

    allData.forEach(yearObj => {
      let plansToConsider = yearObj.plans;

      switch (filterType) {
        case 'all':
          renderModule.renderPlans(selectedYear, currentFilter);
          return; 
        case 'this-year':
          filteredPlansForButton = filteredPlansForButton.concat(plansToConsider.filter(plan => plan.date.startsWith(currentYear)));
          break;
        case 'completed':
          filteredPlansForButton = filteredPlansForButton.concat(plansToConsider.filter(plan => plan.status === 'Completed'));
          break;
        case 'incomplete':
          filteredPlansForButton = filteredPlansForButton.concat(plansToConsider.filter(plan => plan.status !== 'Completed'));
          break;
      }
    });

    renderModule.renderFilteredPlans(filteredPlansForButton, filterType);
  }

  dataModule.load().then(success => {
    if (success) {
      renderModule.renderYears();
      selectedYear = '';
      yearSelector.value = ''; 
      renderModule.renderPlans(selectedYear, currentFilter); 
      eventModule.bindGlobalEvents();
    }
  });

  const currentYearSpan = document.getElementById('currentYear');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }
}