/**
 * Main Controller Application JS for ROSEVELLE Luxury Cosmetics Analytics SPA.
 * Complete Product-Image Pipeline with Image Resolution and Fallback Error Handling.
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("[*] Initializing ROSEVELLE Luxury Cosmetics Analytics SPA...");
  initNavigation();
  initModeSwitcher();
  loadLiveStatus();
  loadDatasetExplorer();
  loadRecommendations();
  loadEvaluationMetrics();
  loadAprioriRules();
  loadRfmClusters();
  loadSalesOlap();
  loadDecisionTree();
  loadLiveProducts();

  // Attach Live Products UI listeners
  const btnFetchLive = document.getElementById('btn-fetch-live-products');
  const brandSelect = document.getElementById('live-brand-select');
  const catSelect = document.getElementById('live-category-select');
  const limitSelect = document.getElementById('live-limit-select');

  if (btnFetchLive) btnFetchLive.addEventListener('click', loadLiveProducts);
  if (brandSelect) brandSelect.addEventListener('change', loadLiveProducts);
  if (catSelect) catSelect.addEventListener('change', loadLiveProducts);
  if (limitSelect) limitSelect.addEventListener('change', loadLiveProducts);
});

/* Navigation & Tabs */
function initNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.dataset.tab;
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
    });
  });
}

/* Helper formatting & image functions */
function formatINR(val) {
  if (val == null || isNaN(val)) return window.currentDataSource === 'live' ? '$0.00' : '₹0.00';
  const num = Number(val);
  if (window.currentDataSource === 'live') {
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

/* Dual Mode Switcher & Live Status Controls */
function initModeSwitcher() {
  const btnLive = document.getElementById('btn-mode-live');
  const btnLocal = document.getElementById('btn-mode-local');
  const btnRefresh = document.getElementById('btn-refresh-live-data');

  if (btnLive) {
    btnLive.addEventListener('click', () => {
      if (window.currentDataSource === 'live') return;
      window.currentDataSource = 'live';
      updateModeButtonsUI();
      updateCustomerDropdownOptions();
      reloadAllAnalytics();
    });
  }

  if (btnLocal) {
    btnLocal.addEventListener('click', () => {
      if (window.currentDataSource === 'local') return;
      window.currentDataSource = 'local';
      updateModeButtonsUI();
      updateCustomerDropdownOptions();
      reloadAllAnalytics();
    });
  }

  if (btnRefresh) {
    btnRefresh.addEventListener('click', handleRefreshLiveData);
  }

  updateModeButtonsUI();
  updateCustomerDropdownOptions();
}

function updateModeButtonsUI() {
  const btnLive = document.getElementById('btn-mode-live');
  const btnLocal = document.getElementById('btn-mode-local');
  if (!btnLive || !btnLocal) return;

  if (window.currentDataSource === 'live') {
    btnLive.style.background = 'var(--maroon-primary)';
    btnLive.style.color = 'var(--text-ivory)';
    btnLive.classList.add('active');

    btnLocal.style.background = 'transparent';
    btnLocal.style.color = 'var(--text-secondary)';
    btnLocal.classList.remove('active');
  } else {
    btnLocal.style.background = 'var(--maroon-primary)';
    btnLocal.style.color = 'var(--text-ivory)';
    btnLocal.classList.add('active');

    btnLive.style.background = 'transparent';
    btnLive.style.color = 'var(--text-secondary)';
    btnLive.classList.remove('active');
  }
}

function updateCustomerDropdownOptions() {
  const recSelect = document.getElementById('rec-user-select');
  if (!recSelect) return;

  recSelect.innerHTML = `
    <option value="CUST-10" selected>CUST-10</option>
    <option value="CUST-50">CUST-50</option>
    <option value="CUST-100">CUST-100</option>
    <option value="cust_code-16">cust_code-16</option>
    <option value="cust_code-19">cust_code-19</option>
    <option value="cust_code-22">cust_code-22</option>
    <option value="cust_code-25">cust_code-25</option>
  `;
}

async function handleRefreshLiveData() {
  const btnRefresh = document.getElementById('btn-refresh-live-data');
  if (btnRefresh) {
    btnRefresh.disabled = true;
    btnRefresh.innerHTML = `⏳ Refreshing Live Cosmetics...`;
  }

  try {
    const res = await API.postLiveRefresh();
    if (res.status === 'success') {
      const fetchedTime = res.fetched_at ? new Date(res.fetched_at).toLocaleTimeString() : 'Just now';
      alert(`✅ Live cosmetics catalogue refreshed successfully from Makeup API!\nFetched ${res.total_products_available || 0} items at ${fetchedTime}`);
      await loadLiveStatus();
      await loadLiveProducts();
    } else {
      alert(`⚠️ Failed to refresh live cosmetics API: ${res.message}`);
      await loadLiveStatus();
    }
  } catch (err) {
    alert(`⚠️ Refresh request failed: ${err.message}`);
  } finally {
    if (btnRefresh) {
      btnRefresh.disabled = false;
      btnRefresh.innerHTML = `🔄 Refresh Live Cosmetics`;
    }
  }
}

async function reloadAllAnalytics() {
  console.log(`[*] Reloading all analytics tabs for active source: [${window.currentDataSource}]`);
  await loadLiveStatus();
  await loadDatasetExplorer();
  await loadRecommendations();
  await loadEvaluationMetrics();
  await loadAprioriRules();
  await loadRfmClusters();
  await loadSalesOlap();
  await loadDecisionTree();
}

async function loadLiveStatus() {
  const badgeEl = document.getElementById('live-connection-badge');
  const titleEl = document.getElementById('live-source-title');
  const labelEl = document.getElementById('live-mode-label');
  const countsEl = document.getElementById('live-counts-summary');
  const timeEl = document.getElementById('live-fetched-time');

  try {
    const statusData = await API.getLiveStatus();
    if (statusData.status === 'success') {
      if (badgeEl) {
        badgeEl.textContent = '● LIVE COSMETICS API CONNECTED';
        badgeEl.style.background = '#2e7d32';
      }
      if (titleEl) {
        titleEl.innerHTML = '<strong>LIVE PRODUCT SOURCE:</strong> Makeup API &nbsp;|&nbsp; <strong>ANALYTICS SOURCE:</strong> Real Cosmetics E-Commerce Transaction Dataset';
      }
      if (labelEl) {
        labelEl.textContent = 'Live API provides fresh cosmetics product catalogue. Historical transaction data powers customer & DWM analytics.';
      }
      if (countsEl) {
        const cnt = statusData.total_products_available || statusData.total_fetched || 0;
        countsEl.innerHTML = `<span><strong>LIVE PRODUCT CATALOGUE:</strong> ${cnt} Real Cosmetics Products (Makeup API)</span>`;
      }
      if (timeEl) {
        const tStr = statusData.fetched_at ? new Date(statusData.fetched_at).toLocaleTimeString() : 'Just now';
        timeEl.textContent = `Last Updated: ${tStr}`;
      }
    } else {
      if (badgeEl) {
        badgeEl.textContent = '● LIVE COSMETICS API UNAVAILABLE';
        badgeEl.style.background = '#c62828';
      }
      if (titleEl) titleEl.textContent = 'LIVE PRODUCT SOURCE: Makeup API (Unavailable)';
      if (labelEl) labelEl.textContent = statusData.message || 'API connection error';
      if (countsEl) countsEl.innerHTML = `<span>API Connection Offline</span>`;
      if (timeEl) timeEl.textContent = 'Offline';
    }
  } catch (err) {
    console.error("[LiveStatus] Error fetching status:", err);
  }
}

function getNormalizedImageUrl(row, fallbackName) {
  if (!row) return '';

  if (typeof row === 'string') {
    if (row.startsWith('/') || row.startsWith('http')) return row;
    return '';
  }

  if (row.image_url && typeof row.image_url === 'string' && row.image_url.trim() !== '') {
    return row.image_url;
  }

  if (Array.isArray(row.images) && row.images.length > 0) {
    const first = row.images[0];
    if (typeof first === 'string' && first.trim() !== '' && !first.includes('fallback_cosmetics')) return first;
    if (first && (first.local_url || first.real_photo || first.url)) {
      const u = first.local_url || first.real_photo || first.url;
      if (u && typeof u === 'string' && u.trim() !== '' && !u.includes('fallback_cosmetics')) return u;
    }
  }

  return '';
}

function renderProductPhotoCell(imgUrl, pName) {
  if (imgUrl && imgUrl.trim() !== '' && !imgUrl.includes('fallback_cosmetics')) {
    return `<div style="width:44px; height:44px; display:flex; align-items:center; justify-content:center; background:var(--bg-main); border-radius:6px; border:1px solid var(--rose-accent); padding:2px; flex-shrink:0;">
              <img src="${imgUrl}"
                   alt="${(pName || 'Product').replace(/"/g, '&quot;')}"
                   loading="lazy"
                   style="max-width:100%; max-height:100%; object-fit:contain;"
                   onerror="handleProductImgError(this)" />
            </div>`;
  }
  return `<div class="img-unavailable-badge">
            <span style="font-size:0.8rem;">📷</span>
            <span>Image unavailable</span>
          </div>`;
}

window.handleProductImgError = function(img) {
  img.onerror = null;
  const parent = img.parentElement;
  if (parent) {
    parent.outerHTML = `<div class="img-unavailable-badge"><span style="font-size:0.8rem;">📷</span><span>Image unavailable</span></div>`;
  } else {
    img.style.display = 'none';
  }
};


/* =====================================================================
   1. DATASET EXPLORER
   ===================================================================== */
let currentExplorerDataset = 'real_cosmetics_ecommerce';
let currentExplorerPage = 1;

async function loadDatasetExplorer() {
  console.log("[*] Loading Dataset Explorer overview...");
  try {
    const summary = await API.getDatasetExplorer();
    const real = summary.real_cosmetics_dataset || summary.real_amazon_dataset;
    
    console.log(`[Dataset Explorer] Total dataset records: ${real.total_records || real.total_reviews}, Unique Orders: ${real.unique_orders}, Customers: ${real.unique_customers}`);
    
    renderExplorerOverview(summary);
    fetchExplorerRecords();
  } catch (err) {
    console.error("[Dataset Explorer] Error loading summary:", err);
  }
}

function renderExplorerOverview(summary) {
  const real = summary.real_cosmetics_dataset || summary.real_amazon_dataset;

  if (document.getElementById('stat-real-reviews')) document.getElementById('stat-real-reviews').textContent = (real.total_records || real.total_reviews).toLocaleString();
  if (document.getElementById('stat-real-users')) document.getElementById('stat-real-users').textContent = (real.unique_customers || real.unique_users).toLocaleString();
  if (document.getElementById('stat-real-products')) document.getElementById('stat-real-products').textContent = (real.unique_products).toLocaleString();
  if (document.getElementById('stat-real-orders')) document.getElementById('stat-real-orders').textContent = (real.unique_orders || real.total_reviews).toLocaleString();
  if (document.getElementById('stat-syn-revenue')) document.getElementById('stat-syn-revenue').textContent = formatINR(real.total_revenue);
  if (document.getElementById('stat-syn-aov')) document.getElementById('stat-syn-aov').textContent = formatINR(real.avg_basket_value);

  const catDist = real.categories_distribution || real.categories;
  if (catDist) {
    Charts.renderRatingDistribution('chart-rating-dist', catDist);
  }

  const selector = document.getElementById('explorer-dataset-select');
  if (selector) {
    selector.addEventListener('change', (e) => {
      currentExplorerDataset = e.target.value;
      currentExplorerPage = 1;
      fetchExplorerRecords();
    });
  }

  const searchInput = document.getElementById('explorer-search-input');
  const clearSearchBtn = document.getElementById('btn-reset-explorer-search');

  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        currentExplorerPage = 1;
        fetchExplorerRecords();
      }, 300);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      currentExplorerPage = 1;
      fetchExplorerRecords();
    });
  }
}

async function fetchExplorerRecords() {
  const container = document.getElementById('explorer-table-container');
  const paginationEl = document.getElementById('explorer-pagination');

  if (container) container.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--text-secondary);">Loading dataset records...</div>`;

  try {
    const searchVal = document.getElementById('explorer-search-input')?.value || '';
    const data = await API.getDatasetRecords(currentExplorerDataset, currentExplorerPage, 10, searchVal);

    if (!data.records || data.records.length === 0) {
      if (container) container.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--text-muted)">No matching records found.</div>`;
      if (paginationEl) paginationEl.innerHTML = '';
      return;
    }

    let tableHtml = `<table class="data-table" id="explorer-data-table"><thead><tr>
      <th>Product Photo</th>
      <th>Date</th>
      <th>Order ID</th>
      <th>Customer Code</th>
      <th>Location (Zone)</th>
      <th>Product Name</th>
      <th>Category</th>
      <th>Qty</th>
      <th>Gross Amount</th>
      <th>Status</th>
    </tr></thead><tbody>`;

    data.records.forEach((row) => {
      const pName = row["Product Name"] || row.product_name || "Cosmetics";
      const imgUrl = getNormalizedImageUrl(row, pName);

      tableHtml += `
        <tr>
          <td>${renderProductPhotoCell(imgUrl, pName)}</td>
          <td>${row.Date}</td>
          <td><code>${row["Order Id"]}</code></td>
          <td><strong>${row["Customer Code"]}</strong></td>
          <td>${row.City}, ${row.Zone}</td>
          <td><strong>${pName}</strong></td>
          <td><span style="font-size:0.8rem; background:var(--bg-main); padding:2px 6px; border-radius:4px; border:1px solid var(--rose-accent); font-weight:600;">${row["Category 2"]}</span></td>
          <td>${row["Order quantity"]}</td>
          <td><strong>${formatINR(row["Gross amount"])}</strong></td>
          <td><span style="font-size:0.75rem; padding:2px 6px; border-radius:4px; font-weight:600; background:#e8f5e9; color:#2e7d32;">${row["Order Status"]}</span></td>
        </tr>
      `;
    });

    tableHtml += `</tbody></table>`;
    if (container) container.innerHTML = tableHtml;

    if (paginationEl) {
      let pageHtml = `
        <button class="pagination-btn" ${data.page <= 1 ? 'disabled' : ''} onclick="changeExplorerPage(${data.page - 1})">← Prev</button>
        <span style="font-size:0.85rem; color:var(--text-secondary); margin:0 0.5rem;">Page <strong>${data.page}</strong> of <strong>${data.total_pages}</strong> (${data.total_records.toLocaleString()} records)</span>
        <button class="pagination-btn" ${data.page >= data.total_pages ? 'disabled' : ''} onclick="changeExplorerPage(${data.page + 1})">Next →</button>
      `;
      paginationEl.innerHTML = pageHtml;
    }
  } catch (err) {
    console.error("[Dataset Explorer] Error fetching records:", err);
    if (container) container.innerHTML = `<div style="padding:2rem; text-align:center; color:red;">Unable to load visualization: ${err.message}</div>`;
  }
}

window.changeExplorerPage = function(newPage) {
  currentExplorerPage = newPage;
  fetchExplorerRecords();
};

window.exportExplorerCSV = function() {
  window.open(`/api/dataset-records?page=1&limit=8164`, '_blank');
};


/* =====================================================================
   2. RECOMMENDER ENGINE
   ===================================================================== */
async function loadRecommendations() {
  const btn = document.getElementById('btn-run-recommend');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const userId = document.getElementById('rec-user-select').value;
    const algo = document.getElementById('rec-algo-select').value;
    const topK = parseInt(document.getElementById('rec-topk-select').value);

    const container = document.getElementById('rec-results-container');
    if (container) container.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--text-secondary);">Loading recommendations...</div>`;

    try {
      const data = await API.getRecommendations(userId, algo, topK);
      renderRecommendations(data);
    } catch (err) {
      console.error("[Recommender Engine] Error:", err);
      if (container) container.innerHTML = `<div style="padding:2rem; text-align:center; color:red;">Unable to load recommendations: ${err.message}</div>`;
    }
  });

  btn.click();
}

function renderRecommendations(data) {
  const container = document.getElementById('rec-results-container');
  if (!data.recommendations || data.recommendations.length === 0) {
    if (container) container.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--text-muted);">No data available for this visualization.</div>`;
    return;
  }

  let html = `<div style="margin-bottom:0.75rem; font-size:0.85rem; color:var(--text-secondary);">Algorithm: <strong>${data.algorithm_name}</strong> | User: <strong>${data.user_id}</strong></div>`;
  html += `<div style="display:flex; flex-direction:column; gap:1rem;">`;

  data.recommendations.forEach((item, idx) => {
    const imgUrl = getNormalizedImageUrl(item, item.title);
    html += `
      <div style="display:flex; gap:1rem; padding:0.9rem; background:var(--bg-main); border-radius:var(--radius-sm); border:1px solid var(--rose-accent); align-items:center;">
        <div style="font-family:var(--font-serif); font-size:1.4rem; font-weight:800; color:var(--gold-accent); width:28px;">#${idx + 1}</div>
        ${renderProductPhotoCell(imgUrl, item.title)}
        <div style="flex:1;">
          <div style="font-weight:700; font-size:1rem; color:var(--maroon-primary);">${item.title}</div>
          <div style="font-size:0.8rem; color:var(--text-secondary); margin:0.2rem 0;">Predicted Affinity Rating: <strong style="color:var(--gold-accent);">${item.predicted_rating} ★</strong> | Price: <strong>${formatINR(item.price)}</strong></div>
          <div style="font-size:0.78rem; font-style:italic; color:var(--text-muted);">${item.explanation}</div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  if (container) container.innerHTML = html;
}


/* =====================================================================
   3. EVALUATION METRICS
   ===================================================================== */
async function loadEvaluationMetrics() {
  console.log("[*] Loading Evaluation Metrics...");
  const tableContainer = document.getElementById('eval-products-table-container');
  if (tableContainer) tableContainer.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--text-secondary);">Loading evaluation metrics...</div>`;

  try {
    const data = await API.getEvaluationMetrics(5);
    const m = data.metrics;

    console.log(`[Evaluation Metrics] Evaluated on ${data.test_sample_size} test interaction samples. RMSE: ${m.RMSE}, Precision@5: ${m["Precision@K"]}`);

    if (document.getElementById('metric-rmse')) document.getElementById('metric-rmse').textContent = m.RMSE;
    if (document.getElementById('metric-mae')) document.getElementById('metric-mae').textContent = m.MAE;
    if (document.getElementById('metric-precision')) document.getElementById('metric-precision').textContent = (m["Precision@K"] * 100).toFixed(1) + '%';
    if (document.getElementById('metric-ndcg')) document.getElementById('metric-ndcg').textContent = m["NDCG@K"].toFixed(3);
    if (document.getElementById('metric-recall')) document.getElementById('metric-recall').textContent = (m["Recall@K"] * 100).toFixed(1) + '%';
    if (document.getElementById('metric-map')) document.getElementById('metric-map').textContent = m["MAP@K"].toFixed(3);
    if (document.getElementById('metric-coverage')) document.getElementById('metric-coverage').textContent = m.Catalog_Coverage_Percent + '%';
    if (document.getElementById('metric-diversity')) document.getElementById('metric-diversity').textContent = m.Inter_List_Diversity_Score;

    if (data.algorithm_comparisons) {
      Charts.renderAlgorithmComparison('chart-algo-compare', data.algorithm_comparisons);
    }
    renderEvaluatedProductsTable(data.sample_evaluated_products);
  } catch (err) {
    console.error("[Evaluation Metrics] Error:", err);
    if (tableContainer) tableContainer.innerHTML = `<div style="padding:2rem; text-align:center; color:red;">Unable to load visualization: ${err.message}</div>`;
  }
}

function renderEvaluatedProductsTable(products) {
  const container = document.getElementById('eval-products-table-container');
  if (!products || products.length === 0) {
    if (container) container.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--text-muted);">No data available for this visualization.</div>`;
    return;
  }

  let html = `<table class="data-table"><thead><tr>
    <th>Product Photo</th>
    <th>Customer Code</th>
    <th>Product Name</th>
    <th>Actual Interaction</th>
    <th>Predicted Rating</th>
    <th>Absolute Error</th>
    <th>Relevant Hit</th>
  </tr></thead><tbody>`;

  products.forEach(p => {
    const imgUrl = getNormalizedImageUrl(p, p.title);
    html += `
      <tr>
        <td>${renderProductPhotoCell(imgUrl, p.title)}</td>
        <td><strong>${p.user_id}</strong></td>
        <td>${p.title}</td>
        <td>${p.actual_rating} ★</td>
        <td><strong>${p.predicted_rating} ★</strong></td>
        <td>${p.error}</td>
        <td><span style="color:#2e7d32; font-weight:600;">✓ Relevant</span></td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  if (container) container.innerHTML = html;
}

window.exportEvalCSV = function() {
  alert("Exporting evaluated products accuracy dataset...");
};


/* =====================================================================
   4. APRIORI MARKET BASKET ANALYSIS
   ===================================================================== */
async function loadAprioriRules() {
  const btn = document.getElementById('btn-run-apriori');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const supp = parseFloat(document.getElementById('apriori-supp').value);
    const conf = parseFloat(document.getElementById('apriori-conf').value);

    const container = document.getElementById('apriori-results-container');
    if (container) container.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--text-secondary);">Mining association rules...</div>`;

    try {
      console.log(`[Apriori Mining] Mining with min_support=${supp}, min_confidence=${conf}...`);
      const data = await API.getAprioriRules(supp, conf);
      console.log(`[Apriori Mining] Analyzed ${data.total_transactions_analyzed} order transactions. Mined ${data.association_rules_count} association rules.`);
      renderAprioriResults(data);
    } catch (err) {
      console.error("[Apriori Mining] Error:", err);
      if (container) container.innerHTML = `<div style="padding:2rem; text-align:center; color:red;">Unable to load visualization: ${err.message}</div>`;
    }
  });

  btn.click();
}

function renderAprioriResults(data) {
  const container = document.getElementById('apriori-results-container');
  const rules = data.association_rules || [];

  if (!rules || rules.length === 0) {
    if (container) {
      container.innerHTML = `
        <div style="padding:2.2rem; text-align:center; background:var(--bg-card); border:1px solid var(--rose-accent); border-radius:var(--radius-md);">
          <div style="font-size:2rem; margin-bottom:0.5rem;">🔍</div>
          <h3 style="color:var(--maroon-primary); font-family:var(--font-serif); margin-bottom:0.4rem;">No Association Rules Found</h3>
          <p style="color:var(--text-secondary); max-width:550px; margin:0 auto 0.8rem auto; font-size:0.88rem;">
            No co-purchase rules satisfied the selected thresholds (min_support = ${((data.parameters?.min_support || 0.04) * 100).toFixed(1)}%, min_confidence = ${((data.parameters?.min_confidence || 0.2) * 100).toFixed(1)}%).
          </p>
          <div style="font-size:0.82rem; color:var(--text-muted);">Rules evaluated: <strong>0</strong>. Try lowering Minimum Support or Minimum Confidence thresholds using the control panel above.</div>
        </div>
      `;
    }
    Charts.clearAprioriCharts('chart-apriori-lift', 'chart-apriori-metrics', 'chart-apriori-scatter');
    return;
  }

  Charts.renderAprioriCharts('chart-apriori-lift', 'chart-apriori-metrics', data.association_rules);
  Charts.renderAprioriScatterChart('chart-apriori-scatter', data.association_rules);

  const sortSelect = document.getElementById('apriori-sort-select');
  if (sortSelect) {
    sortSelect.onchange = () => {
      const val = sortSelect.value;
      data.association_rules.sort((a, b) => b[val] - a[val]);
      buildTable();
    };
  }

  function buildTable() {
    let html = `<table class="data-table"><thead><tr>
      <th>Rule #</th>
      <th>Antecedent Product (If Bought)</th>
      <th>Consequent Product (Also Bought)</th>
      <th>Support</th>
      <th>Confidence</th>
      <th>Lift</th>
    </tr></thead><tbody>`;

    data.association_rules.forEach((r, idx) => {
      html += `
        <tr>
          <td><strong>#${idx + 1}</strong></td>
          <td><strong style="color:var(--maroon-primary);">${r.antecedent_name}</strong></td>
          <td><strong style="color:var(--maroon-primary);">${r.consequent_name}</strong></td>
          <td>${(r.support * 100).toFixed(1)}%</td>
          <td><strong>${(r.confidence * 100).toFixed(1)}%</strong></td>
          <td><span style="font-family:var(--font-serif); font-weight:800; color:var(--maroon-primary); font-size:1.1rem;">${r.lift.toFixed(2)}x</span></td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    if (container) container.innerHTML = html;
  }

  buildTable();
}

window.exportAprioriCSV = function() {
  alert("Exporting Apriori co-purchase rules CSV...");
};


/* =====================================================================
   5. CUSTOMER RFM CLUSTERING
   ===================================================================== */
async function loadRfmClusters() {
  const btn = document.getElementById('btn-run-rfm');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const k = parseInt(document.getElementById('rfm-k-select').value);
    const profilesContainer = document.getElementById('rfm-profiles-container');
    if (profilesContainer) profilesContainer.innerHTML = `<div style="padding:1rem; text-align:center; color:var(--text-secondary);">Calculating K-Means customer clusters...</div>`;

    try {
      console.log(`[RFM Clustering] Running K-Means clustering with K=${k}...`);
      const data = await API.getRfmClusters(k);
      console.log(`[RFM Clustering] Clustered ${data.total_customers_analyzed} customers. Silhouette Score: ${data.silhouette_score}`);
      renderRfmResults(data);
    } catch (err) {
      console.error("[RFM Clustering] Error:", err);
      if (profilesContainer) profilesContainer.innerHTML = `<div style="padding:1rem; text-align:center; color:red;">Unable to load visualization: ${err.message}</div>`;
    }
  });

  btn.click();
}

function renderRfmResults(data) {
  if (document.getElementById('rfm-sil-score')) {
    document.getElementById('rfm-sil-score').textContent = data.silhouette_score;
  }

  Charts.renderRfmClusters('chart-rfm-clusters', data.cluster_profiles);

  const container = document.getElementById('rfm-profiles-container');
  if (!data.cluster_profiles || data.cluster_profiles.length === 0) {
    if (container) container.innerHTML = `<div style="padding:1rem; text-align:center; color:var(--text-muted);">No data available for this visualization.</div>`;
    return;
  }

  let html = `<div style="display:flex; flex-direction:column; gap:0.9rem;">`;

  data.cluster_profiles.forEach(p => {
    html += `
      <div style="background:var(--bg-main); padding:0.9rem; border-radius:var(--radius-sm); border:1px solid var(--rose-accent);">
        <div style="font-weight:700; font-size:1rem; color:var(--maroon-primary);">${p.cluster_name} (${p.customer_count} Customers)</div>
        <div style="font-size:0.8rem; color:var(--text-secondary); margin:0.25rem 0;">
          Avg Recency: <strong>${p.avg_recency_days} days</strong> | Avg Frequency: <strong>${p.avg_frequency_orders} orders</strong> | Avg Spend: <strong>${formatINR(p.avg_monetary_spend)}</strong>
        </div>
        <div style="font-size:0.8rem; font-style:italic; color:var(--maroon-primary); margin-top:0.35rem;">${p.actionable_insight}</div>
      </div>
    `;
  });

  html += `</div>`;
  if (container) container.innerHTML = html;
}


/* =====================================================================
   6. SALES OLAP & EXECUTIVE DASHBOARD
   ===================================================================== */
async function loadSalesOlap() {
  const chSel = document.getElementById('olap-channel-select');
  const qtrSel = document.getElementById('olap-quarter-select');
  const catSel = document.getElementById('olap-category-select');
  const resetBtn = document.getElementById('btn-reset-olap-filters');

  async function updateOlap() {
    const channel = chSel ? chSel.value : 'ALL';
    const quarter = qtrSel ? qtrSel.value : 'ALL';
    const category = catSel ? catSel.value : 'ALL';

    const topProdContainer = document.getElementById('olap-top-products-container');
    const pivotContainer = document.getElementById('olap-pivot-container');

    if (topProdContainer) topProdContainer.innerHTML = `<div style="padding:1.5rem; text-align:center; color:var(--text-secondary);">Loading OLAP cube...</div>`;
    if (pivotContainer) pivotContainer.innerHTML = `<div style="padding:1.5rem; text-align:center; color:var(--text-secondary);">Loading OLAP pivot...</div>`;

    try {
      console.log(`[Sales OLAP] Slicing & Dicing OLAP cube (Zone=${channel}, Status=${quarter}, Category=${category})...`);
      const data = await API.getSalesOlap('summary', channel, quarter, category);
      console.log(`[Sales OLAP] Aggregated ${data.summary?.total_orders} orders. Total Revenue: ₹${data.summary?.total_revenue}`);
      renderOlapResults(data);
    } catch (err) {
      console.error("[Sales OLAP] Error:", err);
      if (topProdContainer) topProdContainer.innerHTML = `<div style="padding:1.5rem; text-align:center; color:red;">Unable to load visualization: ${err.message}</div>`;
      if (pivotContainer) pivotContainer.innerHTML = `<div style="padding:1.5rem; text-align:center; color:red;">Unable to load pivot matrix: ${err.message}</div>`;
    }
  }

  if (chSel) chSel.addEventListener('change', updateOlap);
  if (qtrSel) qtrSel.addEventListener('change', updateOlap);
  if (catSel) catSel.addEventListener('change', updateOlap);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (chSel) chSel.value = 'ALL';
      if (qtrSel) qtrSel.value = 'ALL';
      if (catSel) catSel.value = 'ALL';
      updateOlap();
    });
  }

  updateOlap();
}

function renderOlapResults(data) {
  const s = data.summary || {};
  if (document.getElementById('olap-kpi-revenue')) document.getElementById('olap-kpi-revenue').textContent = formatINR(s.total_revenue);
  if (document.getElementById('olap-kpi-orders')) document.getElementById('olap-kpi-orders').textContent = (s.total_orders || 0).toLocaleString();
  if (document.getElementById('olap-kpi-aov')) document.getElementById('olap-kpi-aov').textContent = formatINR(s.avg_order_value);
  if (document.getElementById('olap-kpi-items')) document.getElementById('olap-kpi-items').textContent = (s.total_items_sold || 0).toLocaleString();

  const chSel = document.getElementById('olap-channel-select');
  const qtrSel = document.getElementById('olap-quarter-select');
  const catSel = document.getElementById('olap-category-select');

  if (chSel && chSel.options.length <= 1 && data.available_filters) {
    data.available_filters.channels.forEach(ch => {
      chSel.appendChild(new Option(ch, ch));
    });
  }
  if (qtrSel && qtrSel.options.length <= 1 && data.available_filters) {
    data.available_filters.quarters.forEach(q => {
      qtrSel.appendChild(new Option(q, q));
    });
  }
  if (catSel && catSel.options.length <= 1 && data.available_filters) {
    data.available_filters.categories.forEach(cat => {
      catSel.appendChild(new Option(cat, cat));
    });
  }

  Charts.renderOlapSales('chart-olap-sales', data.by_channel);
  Charts.renderCategorySales('chart-olap-category', data.by_category);
  renderOlapTopProducts(data.top_products);
  renderOlapPivot(data.pivot_channel_vs_quarter);
}

function renderOlapTopProducts(products) {
  const container = document.getElementById('olap-top-products-container');
  if (!products || products.length === 0) {
    if (container) container.innerHTML = `<div style="padding:1.5rem; text-align:center; color:var(--text-muted)">No data available for this visualization.</div>`;
    return;
  }

  let html = `<div style="display:flex; flex-direction:column; gap:0.75rem;">`;
  products.forEach((p, idx) => {
    const imgUrl = getNormalizedImageUrl(p, p.product_name);
    html += `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem; background:var(--bg-main); border-radius:var(--radius-sm); border:1px solid var(--rose-accent);">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          ${renderProductPhotoCell(imgUrl, p.product_name)}
          <div>
            <div style="font-weight:700; font-size:0.95rem; color:var(--maroon-primary);">#${idx + 1} ${p.product_name}</div>
            <div style="font-size:0.78rem; color:var(--text-secondary);">${p.category} | Units Sold: <strong>${p.units_sold}</strong></div>
          </div>
        </div>
        <div style="font-family:var(--font-serif); font-weight:800; font-size:1.1rem; color:var(--maroon-primary);">${formatINR(p.total_revenue)}</div>
      </div>
    `;
  });

  html += `</div>`;
  if (container) container.innerHTML = html;
}

function renderOlapPivot(pivotData) {
  const container = document.getElementById('olap-pivot-container');
  if (!pivotData || pivotData.length === 0) {
    if (container) container.innerHTML = `<div style="padding:1.5rem; text-align:center; color:var(--text-muted);">No data available for this visualization.</div>`;
    return;
  }

  const keys = Object.keys(pivotData[0]);
  let html = `<table class="data-table"><thead><tr>`;
  keys.forEach(k => {
    html += `<th>${k === 'channel' ? 'Zone' : k}</th>`;
  });
  html += `</tr></thead><tbody>`;

  pivotData.forEach(row => {
    html += `<tr>`;
    keys.forEach(k => {
      const val = row[k];
      html += `<td>${typeof val === 'number' ? formatINR(val) : `<strong>${val}</strong>`}</td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  if (container) container.innerHTML = html;
}

window.exportOlapCSV = function() {
  alert("Exporting OLAP pivot CSV...");
};


/* =====================================================================
   7. PREDICTIVE ANALYTICS — DECISION TREE
   ===================================================================== */
async function loadDecisionTree() {
  console.log("[*] Training & Evaluating Decision Tree Classifier...");
  const container = document.getElementById('dt-tree-visualization-container');
  if (container) container.innerHTML = `<div style="padding:1.5rem; text-align:center; color:var(--text-secondary);">Training Decision Tree model...</div>`;

  try {
    const data = await API.getDecisionTree(3);
    console.log(`[Predictive Analytics] Trained Decision Tree classifier on ${data.train_sample_count} records. Test accuracy: ${data.metrics?.accuracy}`);
    renderDecisionTreeResults(data);
  } catch (err) {
    console.error("[Predictive Analytics] Decision Tree error:", err);
    if (container) container.innerHTML = `<div style="padding:1.5rem; text-align:center; color:red;">Unable to load visualization: ${err.message}</div>`;
  }
}

function renderDecisionTreeResults(data) {
  const m = data.metrics || {};
  if (document.getElementById('dt-stat-accuracy')) document.getElementById('dt-stat-accuracy').textContent = ((m.accuracy || 0) * 100).toFixed(1) + '%';
  if (document.getElementById('dt-stat-precision')) document.getElementById('dt-stat-precision').textContent = ((m.precision || 0) * 100).toFixed(1) + '%';
  if (document.getElementById('dt-stat-recall')) document.getElementById('dt-stat-recall').textContent = ((m.recall || 0) * 100).toFixed(1) + '%';
  if (document.getElementById('dt-stat-f1')) document.getElementById('dt-stat-f1').textContent = ((m.f1_score || 0) * 100).toFixed(1) + '%';

  if (data.feature_importances) {
    Charts.renderFeatureImportanceChart('chart-dt-features', data.feature_importances);
  }

  if (data.tree_structure && data.tree_structure.hierarchical_tree) {
    Charts.renderDecisionTreeDiagram('dt-tree-visualization-container', data.tree_structure.hierarchical_tree);
  } else {
    const container = document.getElementById('dt-tree-visualization-container');
    if (container) container.innerHTML = `<div style="padding:1.5rem; text-align:center; color:var(--text-muted);">No data available for this visualization.</div>`;
  }
}

window.handleDtPredict = async function(event) {
  event.preventDefault();
  const recency = parseFloat(document.getElementById('dt-recency').value);
  const frequency = parseFloat(document.getElementById('dt-frequency').value);
  const monetary = parseFloat(document.getElementById('dt-monetary').value);
  const avgBasket = parseFloat(document.getElementById('dt-avg-basket').value);

  try {
    const data = await API.predictBehavior({ recency, frequency, monetary, avg_basket_items: avgBasket });
    const resultBox = document.getElementById('dt-prediction-result');
    const labelEl = document.getElementById('dt-predicted-label');
    const confEl = document.getElementById('dt-confidence-score');
    const pathEl = document.getElementById('dt-decision-path-list');

    if (resultBox) resultBox.style.display = 'block';
    if (labelEl) labelEl.textContent = data.predicted_segment;
    if (confEl) confEl.textContent = `Classification Confidence Score: ${data.confidence_score}%`;

    if (pathEl) {
      pathEl.innerHTML = data.decision_path.map(step => `<div style="margin-bottom:0.3rem;">• ${step}</div>`).join('');
    }
  } catch (err) {
    alert("Failed to predict customer behavior: " + err.message);
  }
};


/* =====================================================================
   8. LIVE BEAUTY CATALOGUE (EXTERNAL REST API)
   ===================================================================== */
async function loadLiveProducts() {
  console.log("[*] Fetching Live Beauty Products from External REST API Proxy...");
  const gridContainer = document.getElementById('live-products-grid');
  const counterEl = document.getElementById('live-products-counter');
  const brandSel = document.getElementById('live-brand-select');
  const catSel = document.getElementById('live-category-select');
  const limitSel = document.getElementById('live-limit-select');

  const brand = brandSel ? brandSel.value : 'all';
  const category = catSel ? catSel.value : 'all';
  const limit = limitSel ? parseInt(limitSel.value) : 24;

  if (gridContainer) {
    gridContainer.innerHTML = renderLiveProductsLoadingSkeleton(limit > 8 ? 8 : limit);
  }
  if (counterEl) {
    counterEl.innerHTML = `<span style="color:var(--text-muted);">Fetching dynamic catalogue via Flask proxy...</span>`;
  }

  try {
    const res = await API.getLiveProducts(brand, category, limit);

    if (res.status === 'success' && Array.isArray(res.products)) {
      if (counterEl) {
        counterEl.innerHTML = `<span style="color:#2e7d32;">✓ Loaded ${res.total_fetched} live products from ${res.data_source}</span>`;
      }
      renderLiveProductsGrid(res.products, gridContainer);
    } else {
      const errMsg = res.message || "Failed to load external beauty products";
      if (counterEl) {
        counterEl.innerHTML = `<span style="color:var(--maroon-primary);">⚠️ External API Error</span>`;
      }
      renderLiveProductsError(errMsg, gridContainer);
    }
  } catch (err) {
    console.error("[Live API] Request failed:", err);
    if (counterEl) {
      counterEl.innerHTML = `<span style="color:var(--maroon-primary);">⚠️ Connection Error</span>`;
    }
    renderLiveProductsError(`Unable to connect to server proxy: ${err.message}`, gridContainer);
  }
}

function renderLiveProductsLoadingSkeleton(count = 8) {
  let cards = '';
  for (let i = 0; i < count; i++) {
    cards += `
      <div class="card product-card" style="opacity:0.7; animation: pulse 1.5s infinite ease-in-out;">
        <div class="product-image" style="background:var(--bg-main);"></div>
        <div class="product-body">
          <div style="height:16px; width:40%; background:var(--rose-light); border-radius:4px; margin-bottom:0.5rem;"></div>
          <div style="height:20px; width:80%; background:var(--bg-main); border-radius:4px; margin-bottom:0.5rem;"></div>
          <div style="height:16px; width:60%; background:var(--bg-main); border-radius:4px;"></div>
        </div>
      </div>
    `;
  }
  return cards;
}

function renderLiveProductsError(message, container) {
  if (!container) return;
  container.innerHTML = `
    <div class="card" style="grid-column: 1 / -1; text-align:center; padding:2.5rem 1.5rem; background:var(--bg-card); border:1px solid var(--rose-accent);">
      <div style="font-size:2.5rem; margin-bottom:0.5rem;">⚠️</div>
      <h3 style="color:var(--maroon-primary); margin-bottom:0.5rem; font-family:var(--font-serif);">External Beauty REST API Notice</h3>
      <p style="color:var(--text-secondary); max-width:600px; margin:0 auto 1.25rem auto; font-size:0.9rem; line-height:1.5;">
        ${message}
      </p>
      <button class="btn btn-primary" onclick="loadLiveProducts()" style="padding:0.6rem 1.5rem;">
        🔄 Retry Connection
      </button>
    </div>
  `;
}

function renderLiveProductsGrid(products, container) {
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column: 1 / -1; text-align:center; padding:2.5rem; color:var(--text-muted);">
        <div style="font-size:2rem; margin-bottom:0.5rem;">💄</div>
        <h3>No Products Found</h3>
        <p style="font-size:0.9rem; margin-top:0.25rem;">Try adjusting the Brand or Category filter settings.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(p => {
    const imgHtml = p.image_url
      ? `<img src="${p.image_url}" alt="${p.name.replace(/"/g, '&quot;')}" loading="lazy" style="max-height:100%; max-width:100%; object-fit:contain;" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=80';" />`
      : `<div style="font-size:2.5rem;">💄</div>`;

    const ratingHtml = p.rating
      ? `<span style="color:#e67e22; font-weight:600; font-size:0.8rem;">★ ${p.rating}</span>`
      : `<span style="color:var(--text-muted); font-size:0.75rem;">Not rated</span>`;

    const descSnippet = p.description
      ? `<p style="font-size:0.78rem; color:var(--text-muted); margin-top:0.4rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${p.description}</p>`
      : '';

    return `
      <div class="card product-card" style="transition:transform 0.2s ease, box-shadow 0.2s ease;">
        <div class="product-image">
          ${imgHtml}
        </div>
        <div class="product-body">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem; flex-wrap:wrap; gap:0.25rem;">
            <span class="badge badge-real" style="font-size:0.7rem; font-weight:600;">${p.brand}</span>
            <span class="badge badge-synthetic" style="font-size:0.7rem;">${p.category}</span>
          </div>
          <h4 style="font-size:0.95rem; font-family:var(--font-serif); color:var(--maroon-primary); line-height:1.3; margin-bottom:0.3rem;">
            ${p.name}
          </h4>
          ${descSnippet}
        </div>
        <div class="product-footer">
          <div>
            <div style="font-size:0.95rem; font-weight:700; color:var(--maroon-primary); font-family:var(--font-serif);">
              ${p.price_formatted}
            </div>
            <div>${ratingHtml}</div>
          </div>
          ${p.product_link ? `
            <a href="${p.product_link}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding:0.35rem 0.65rem; font-size:0.75rem; text-decoration:none;">
              View Details ↗
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}
