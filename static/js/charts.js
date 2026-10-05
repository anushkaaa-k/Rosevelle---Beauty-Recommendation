/**
 * Chart.js & SVG Visualization Module for ROSEVELLE Luxury Cosmetics Analytics.
 * Color Palette: Maroon (#641E2B), Rose (#B98283), Gold (#C5A46D), Espresso (#352329), Cream (#FFF9F2).
 */

let ratingDistChart = null;
let algoCompareChart = null;
let rfmClusterChart = null;
let olapSalesChart = null;
let olapCategoryChart = null;
let aprioriLiftChart = null;
let aprioriMetricsChart = null;
let aprioriScatterChart = null;
let dtFeatureChart = null;

const Charts = {
  renderRatingDistribution(containerId, ratingMap) {
    const ctx = document.getElementById(containerId);
    if (!ctx || !ratingMap || Object.keys(ratingMap).length === 0) return;

    if (ratingDistChart) ratingDistChart.destroy();

    const labels = Object.keys(ratingMap);
    const data = Object.values(ratingMap);

    ratingDistChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Category Records Count',
          data: data,
          backgroundColor: [
            'rgba(100, 30, 43, 0.85)',
            'rgba(185, 130, 131, 0.85)',
            'rgba(197, 164, 109, 0.85)',
            'rgba(53, 35, 41, 0.85)',
            'rgba(78, 23, 33, 0.85)'
          ],
          borderColor: '#C5A46D',
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Real Cosmetics Category Distribution (~8,164 Records)',
            color: '#641E2B',
            font: { family: 'Playfair Display', size: 14, weight: 'bold' }
          }
        },
        scales: {
          x: { ticks: { color: '#352329', font: { family: 'Plus Jakarta Sans', weight: '600' } }, grid: { color: 'rgba(185, 130, 131, 0.2)' } },
          y: { ticks: { color: '#352329', font: { family: 'Plus Jakarta Sans', weight: '600' } }, grid: { color: 'rgba(185, 130, 131, 0.2)' } }
        }
      }
    });
  },

  renderAlgorithmComparison(containerId, comparisons) {
    const ctx = document.getElementById(containerId);
    if (!ctx || !comparisons || comparisons.length === 0) return;

    if (algoCompareChart) algoCompareChart.destroy();

    const labels = comparisons.map(c => c.algorithm.replace(" Collaborative Filtering", " CF").replace(" (SVD + TF-IDF)", " Hybrid"));
    const rmseData = comparisons.map(c => c.rmse);
    const precisionData = comparisons.map(c => c.precision);

    algoCompareChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'RMSE (Lower is Better)',
            data: rmseData,
            backgroundColor: '#641E2B',
            borderColor: '#4e1721',
            borderWidth: 1,
            borderRadius: 6
          },
          {
            label: 'Precision@K (Higher is Better)',
            data: precisionData,
            backgroundColor: '#C5A46D',
            borderColor: '#a38148',
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#352329', font: { family: 'Plus Jakarta Sans', weight: '600' } } },
          title: {
            display: true,
            text: 'Empirical Algorithm Metrics Comparison',
            color: '#641E2B',
            font: { family: 'Playfair Display', size: 15, weight: 'bold' }
          }
        },
        scales: {
          x: { ticks: { color: '#352329', font: { family: 'Plus Jakarta Sans', weight: '600' } }, grid: { color: 'rgba(185, 130, 131, 0.2)' } },
          y: { ticks: { color: '#352329', font: { family: 'Plus Jakarta Sans', weight: '600' } }, grid: { color: 'rgba(185, 130, 131, 0.2)' } }
        }
      }
    });
  },

  renderAlgoComparison(containerId, comparisons) {
    this.renderAlgorithmComparison(containerId, comparisons);
  },

  renderRfmClusters(containerId, profiles) {
    const ctx = document.getElementById(containerId);
    if (!ctx || !profiles || profiles.length === 0) return;

    if (rfmClusterChart) rfmClusterChart.destroy();

    const labels = profiles.map(p => p.cluster_name.split('(')[0].trim());
    const customerCounts = profiles.map(p => p.customer_count);

    rfmClusterChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: customerCounts,
          backgroundColor: [
            '#641E2B',  /* Primary Maroon */
            '#B98283',  /* Rose Accent */
            '#C5A46D',  /* Champagne Gold */
            '#352329'   /* Dark Espresso */
          ],
          borderWidth: 3,
          borderColor: '#FFF9F2'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#352329', font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } }
          },
          title: {
            display: true,
            text: 'Customer RFM Cluster Distribution (2,012 Customers)',
            color: '#641E2B',
            font: { family: 'Playfair Display', size: 14, weight: 'bold' }
          }
        }
      }
    });
  },

  renderOlapSales(containerId, channelData) {
    const ctx = document.getElementById(containerId);
    if (!ctx || !channelData || channelData.length === 0) return;

    if (olapSalesChart) olapSalesChart.destroy();

    const labels = channelData.map(c => c.channel);
    const revenues = channelData.map(c => c.total_revenue);

    olapSalesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Revenue (₹INR)',
          data: revenues,
          backgroundColor: '#641E2B',
          borderColor: '#C5A46D',
          borderWidth: 1.5,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Sales Revenue by Geographical Zone',
            color: '#641E2B',
            font: { family: 'Playfair Display', size: 14, weight: 'bold' }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const val = context.parsed.y || 0;
                return 'Revenue: ₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              }
            }
          }
        },
        scales: {
          x: { ticks: { color: '#352329', font: { family: 'Plus Jakarta Sans', weight: '600' } }, grid: { color: 'rgba(185, 130, 131, 0.2)' } },
          y: {
            ticks: {
              color: '#352329',
              font: { family: 'Plus Jakarta Sans', weight: '600' },
              callback: function(value) {
                return '₹' + Number(value).toLocaleString('en-IN');
              }
            },
            grid: { color: 'rgba(185, 130, 131, 0.2)' }
          }
        }
      }
    });
  },

  renderCategorySales(containerId, categoryData) {
    const ctx = document.getElementById(containerId);
    if (!ctx || !categoryData || categoryData.length === 0) return;

    if (olapCategoryChart) olapCategoryChart.destroy();

    const labels = categoryData.map(c => c.category);
    const revenues = categoryData.map(c => c.total_revenue);

    olapCategoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: revenues,
          backgroundColor: [
            '#641E2B',
            '#B98283',
            '#C5A46D',
            '#352329',
            '#4e1721',
            '#8a6e76'
          ],
          borderWidth: 2,
          borderColor: '#FFF9F2'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#352329', font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } } },
          title: { display: true, text: 'Category Sales Share (₹INR)', color: '#641E2B', font: { family: 'Playfair Display', size: 14, weight: 'bold' } }
        }
      }
    });
  },

  renderOlapCharts(salesId, catId, channelData, categoryData) {
    this.renderOlapSales(salesId, channelData);
    this.renderCategorySales(catId, categoryData);
  },

  renderAprioriCharts(liftContainerId, metricsContainerId, rules) {
    const ctxLift = document.getElementById(liftContainerId);
    const ctxMetrics = document.getElementById(metricsContainerId);
    if (!rules || rules.length === 0) return;

    const topRules = rules.slice(0, 7);
    const labels = topRules.map(r => {
      const a = (r.antecedent_name || r.antecedent_asin).split(' ')[0];
      const c = (r.consequent_name || r.consequent_asin).split(' ')[0];
      return `${a} ➔ ${c}`;
    });

    if (ctxLift) {
      if (aprioriLiftChart) aprioriLiftChart.destroy();
      aprioriLiftChart = new Chart(ctxLift, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Rule Lift Multiplier (x)',
            data: topRules.map(r => r.lift),
            backgroundColor: '#641E2B',
            borderColor: '#C5A46D',
            borderWidth: 1.5,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Top Co-Purchase Rules by Lift', color: '#641E2B', font: { family: 'Playfair Display', size: 14, weight: 'bold' } }
          },
          scales: {
            x: { ticks: { color: '#352329', font: { family: 'Plus Jakarta Sans', weight: '600' } }, grid: { color: 'rgba(185, 130, 131, 0.2)' } },
            y: { ticks: { color: '#352329', font: { family: 'Plus Jakarta Sans', weight: '600' } }, grid: { color: 'rgba(185, 130, 131, 0.2)' } }
          }
        }
      });
    }

    if (ctxMetrics) {
      if (aprioriMetricsChart) aprioriMetricsChart.destroy();
      aprioriMetricsChart = new Chart(ctxMetrics, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Support (%)',
              data: topRules.map(r => (r.support * 100).toFixed(1)),
              backgroundColor: '#B98283',
              borderRadius: 4
            },
            {
              label: 'Confidence (%)',
              data: topRules.map(r => (r.confidence * 100).toFixed(1)),
              backgroundColor: '#C5A46D',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { labels: { color: '#352329', font: { family: 'Plus Jakarta Sans', weight: '600' } } },
            title: { display: true, text: 'Support vs Confidence Comparison', color: '#641E2B', font: { family: 'Playfair Display', size: 14, weight: 'bold' } }
          },
          scales: {
            x: { ticks: { color: '#352329', font: { family: 'Plus Jakarta Sans', weight: '600' } }, grid: { color: 'rgba(185, 130, 131, 0.2)' } },
            y: { ticks: { color: '#352329', font: { family: 'Plus Jakarta Sans', weight: '600' }, callback: v => v + '%' }, grid: { color: 'rgba(185, 130, 131, 0.2)' } }
          }
        }
      });
    }
  },

  renderAprioriScatterChart(containerId, rules) {
    const ctx = document.getElementById(containerId);
    if (!ctx || !rules || rules.length === 0) return;

    if (aprioriScatterChart) aprioriScatterChart.destroy();

    const scatterData = rules.map(r => ({
      x: Number((r.support * 100).toFixed(2)),
      y: Number((r.confidence * 100).toFixed(2)),
      lift: r.lift,
      rule: `${(r.antecedent_name || r.antecedent_asin).split(' ')[0]} ➔ ${(r.consequent_name || r.consequent_asin).split(' ')[0]}`
    }));

    aprioriScatterChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Association Rules',
          data: scatterData,
          backgroundColor: '#641E2B',
          borderColor: '#C5A46D',
          borderWidth: 1.5,
          pointRadius: 6,
          pointHoverRadius: 9
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Support (%) vs Confidence (%) Scatter Plot', color: '#641E2B', font: { family: 'Playfair Display', size: 14, weight: 'bold' } },
          tooltip: {
            callbacks: {
              label: function(context) {
                const raw = context.raw;
                return [
                  `Rule: ${raw.rule}`,
                  `Support: ${raw.x}%`,
                  `Confidence: ${raw.y}%`,
                  `Lift: ${raw.lift}x`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Support (%)', color: '#641E2B', font: { family: 'Plus Jakarta Sans', weight: '700' } },
            ticks: { color: '#352329', font: { family: 'Plus Jakarta Sans', weight: '600' } },
            grid: { color: 'rgba(185, 130, 131, 0.2)' }
          },
          y: {
            title: { display: true, text: 'Confidence (%)', color: '#641E2B', font: { family: 'Plus Jakarta Sans', weight: '700' } },
            ticks: { color: '#352329', font: { family: 'Plus Jakarta Sans', weight: '600' } },
            grid: { color: 'rgba(185, 130, 131, 0.2)' }
          }
        }
      }
    });
  },

  renderFeatureImportanceChart(containerId, importances) {
    const ctx = document.getElementById(containerId);
    if (!ctx || !importances || importances.length === 0) return;

    if (dtFeatureChart) dtFeatureChart.destroy();

    const labels = importances.map(i => i.feature);
    const data = importances.map(i => (i.importance * 100).toFixed(1));

    dtFeatureChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Feature Importance (%)',
          data: data,
          backgroundColor: '#641E2B',
          borderColor: '#C5A46D',
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Decision Tree Feature Importance Weights', color: '#641E2B', font: { family: 'Playfair Display', size: 14, weight: 'bold' } }
        },
        scales: {
          x: { ticks: { color: '#352329', font: { family: 'Plus Jakarta Sans', weight: '600' }, callback: v => v + '%' }, grid: { color: 'rgba(185, 130, 131, 0.2)' } },
          y: { ticks: { color: '#352329', font: { family: 'Plus Jakarta Sans', weight: '600' } }, grid: { color: 'rgba(185, 130, 131, 0.2)' } }
        }
      }
    });
  },

  renderDtFeatureImportance(containerId, importances) {
    this.renderFeatureImportanceChart(containerId, importances);
  },

  renderDecisionTreeDiagram(containerId, rootNode) {
    const container = document.getElementById(containerId);
    if (!container || !rootNode) {
      if (container) container.innerHTML = `<div style="padding:1.5rem; text-align:center; color:var(--text-muted);">No decision tree model available.</div>`;
      return;
    }

    let maxDepth = 0;
    function calculateDepth(node, depth = 0) {
      if (!node) return;
      if (depth > maxDepth) maxDepth = depth;
      if (!node.is_leaf) {
        if (node.left) calculateDepth(node.left, depth + 1);
        if (node.right) calculateDepth(node.right, depth + 1);
      }
    }
    calculateDepth(rootNode, 0);

    const nodeW = 165;
    const nodeH = 58;
    const levelHeight = 110;
    const startY = 38;
    const width = 680;
    const height = startY + (maxDepth * levelHeight) + (nodeH / 2) + 20;

    const nodeMap = [];
    const edgeList = [];

    function assignCoordinates(node, depth, leftBound, rightBound) {
      if (!node) return;
      const x = (leftBound + rightBound) / 2;
      const y = startY + depth * levelHeight;
      node.x = x;
      node.y = y;
      nodeMap.push(node);

      if (!node.is_leaf) {
        if (node.left) {
          assignCoordinates(node.left, depth + 1, leftBound, x);
          edgeList.push({
            from: node,
            to: node.left,
            label: node.feature === 'monetary' ? `≤ ₹${Number(node.threshold).toLocaleString('en-IN')}` : `≤ ${node.threshold}`,
            branchType: 'Yes'
          });
        }
        if (node.right) {
          assignCoordinates(node.right, depth + 1, x, rightBound);
          edgeList.push({
            from: node,
            to: node.right,
            label: node.feature === 'monetary' ? `> ₹${Number(node.threshold).toLocaleString('en-IN')}` : `> ${node.threshold}`,
            branchType: 'No'
          });
        }
      }
    }

    assignCoordinates(rootNode, 0, 30, width - 30);

    let svgHtml = `
      <div style="width:100%; display:flex; justify-content:center; align-items:center; overflow:hidden;">
        <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" style="font-family:'Plus Jakarta Sans', sans-serif; display:block; max-width:100%;">
          <defs>
            <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="#352329" flood-opacity="0.12" />
            </filter>
            <marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#B98283" />
            </marker>
          </defs>
    `;

    edgeList.forEach(edge => {
      const x1 = edge.from.x;
      const y1 = edge.from.y + nodeH / 2;
      const x2 = edge.to.x;
      const y2 = edge.to.y - nodeH / 2;
      const cy1 = (y1 + y2) / 2;
      const cy2 = (y1 + y2) / 2;

      const pathD = `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`;
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      const labelColor = edge.branchType === 'Yes' ? '#2e7d32' : '#c62828';
      const labelBg = edge.branchType === 'Yes' ? '#e8f5e9' : '#ffebee';

      svgHtml += `
        <path d="${pathD}" stroke="#B98283" stroke-width="2" fill="none" marker-end="url(#arrow)" />
        <g transform="translate(${midX}, ${midY})">
          <rect x="-46" y="-10" width="92" height="20" rx="10" fill="${labelBg}" stroke="${labelColor}" stroke-width="1" />
          <text x="0" y="3.5" text-anchor="middle" font-size="9.5px" font-weight="700" fill="${labelColor}">${edge.branchType}: ${edge.label}</text>
        </g>
      `;
    });

    nodeMap.forEach(node => {
      const rx = node.x - nodeW / 2;
      const ry = node.y - nodeH / 2;

      if (node.is_leaf) {
        const isVip = node.prediction.includes("VIP");
        const headerBg = isVip ? '#641E2B' : '#4E1721';
        const cardBg = isVip ? '#FFF9F2' : '#F5EBDD';
        const borderColor = isVip ? '#C5A46D' : '#B98283';
        const titleText = isVip ? '⭐ VIP High Spender' : '🛍️ Standard Shopper';

        svgHtml += `
          <g class="dt-node-group" style="cursor:pointer;">
            <rect x="${rx}" y="${ry}" width="${nodeW}" height="${nodeH}" rx="8" fill="${cardBg}" stroke="${borderColor}" stroke-width="2" filter="url(#shadow)" />
            <rect x="${rx}" y="${ry}" width="${nodeW}" height="20" rx="8" fill="${headerBg}" />
            <rect x="${rx}" y="${ry+14}" width="${nodeW}" height="6" fill="${headerBg}" />
            <text x="${node.x}" y="${ry + 14}" text-anchor="middle" font-size="10px" font-weight="700" fill="#FFF9F2">${titleText}</text>
            <text x="${node.x}" y="${ry + 35}" text-anchor="middle" font-size="9.5px" font-weight="600" fill="#352329">Samples: ${node.samples} | Gini: ${node.impurity}</text>
            <text x="${node.x}" y="${ry + 48}" text-anchor="middle" font-size="9px" font-weight="600" fill="#641E2B">Class Ratio: [${node.value.join(', ')}]</text>
          </g>
        `;
      } else {
        const condLabel = (node.feature_label || node.feature).split(' ')[0] + ' Rule';
        const splitText = node.feature === 'monetary' ? `Spend ≤ ₹${Number(node.threshold).toLocaleString('en-IN')}` : `${node.feature_label} ≤ ${node.threshold}`;

        svgHtml += `
          <g class="dt-node-group" style="cursor:pointer;">
            <rect x="${rx}" y="${ry}" width="${nodeW}" height="${nodeH}" rx="8" fill="#FFF9F2" stroke="#641E2B" stroke-width="2" filter="url(#shadow)" />
            <rect x="${rx}" y="${ry}" width="${nodeW}" height="20" rx="8" fill="#641E2B" />
            <rect x="${rx}" y="${ry+14}" width="${nodeW}" height="6" fill="#641E2B" />
            <text x="${node.x}" y="${ry + 14}" text-anchor="middle" font-size="10px" font-weight="700" fill="#C5A46D">Split: ${condLabel}</text>
            <text x="${node.x}" y="${ry + 35}" text-anchor="middle" font-size="10px" font-weight="700" fill="#641E2B">${splitText}</text>
            <text x="${node.x}" y="${ry + 48}" text-anchor="middle" font-size="9px" font-weight="500" fill="#352329">Samples: ${node.samples} | Gini: ${node.impurity}</text>
          </g>
        `;
      }
    });

    svgHtml += `</svg></div>`;
    container.innerHTML = svgHtml;
  }
};
