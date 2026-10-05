/**
 * Main Controller Application JS for ROSEVELLE Luxury Cosmetics Analytics SPA.
 * Complete Product-Image Pipeline with Image Resolution and Fallback Error Handling.
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("[*] Initializing ROSEVELLE Luxury Cosmetics Analytics SPA...");
  initNavigation();
  loadDatasetExplorer();
  loadRecommendations();
  loadEvaluationMetrics();
  loadAprioriRules();
  loadRfmClusters();
  loadSalesOlap();
  loadDecisionTree();
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
  if (val == null || isNaN(val)) return '₹0.00';
  const num = Number(val);
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

  if (real.categories_distribution) {
    Charts.renderRatingDistribution('chart-rating-dist', real.categories_distribution);
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
  if (!data.association_rules || data.association_rules.length === 0) {
    if (container) container.innerHTML = `<div style="padding:2rem; text-align:center; color:var(--maroon-primary); font-weight:600;">No association rules found for the current thresholds (min_support=${data.parameters?.min_support}, min_confidence=${data.parameters?.min_confidence}). Try adjusting values.</div>`;
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
