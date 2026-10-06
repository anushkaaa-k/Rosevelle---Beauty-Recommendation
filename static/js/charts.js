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

  clearAprioriCharts(liftContainerId, metricsContainerId, scatterContainerId) {
    if (aprioriLiftChart) { aprioriLiftChart.destroy(); aprioriLiftChart = null; }
    if (aprioriMetricsChart) { aprioriMetricsChart.destroy(); aprioriMetricsChart = null; }
    if (aprioriScatterChart) { aprioriScatterChart.destroy(); aprioriScatterChart = null; }
  },

  renderAprioriCharts(liftContainerId, metricsContainerId, rules) {
    const ctxLift = document.getElementById(liftContainerId);
    const ctxMetrics = document.getElementById(metricsContainerId);
    if (!rules || rules.length === 0) {
      this.clearAprioriCharts(liftContainerId, metricsContainerId, null);
      return;
    }

    const topRules = rules.slice(0, 7);
    const labels = topRules.map(r => {
      const anteVal = String(r.antecedent_name || r.antecedent_asin || (Array.isArray(r.antecedents) ? r.antecedents.join(', ') : r.antecedents) || 'Item A');
      const consVal = String(r.consequent_name || r.consequent_asin || (Array.isArray(r.consequents) ? r.consequents.join(', ') : r.consequents) || 'Item B');
      return `${anteVal.split(' ')[0]} ➔ ${consVal.split(' ')[0]}`;
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

    const scatterData = rules.map(r => {
      const anteVal = String(r.antecedent_name || r.antecedent_asin || (Array.isArray(r.antecedents) ? r.antecedents.join(', ') : r.antecedents) || 'Item A');
      const consVal = String(r.consequent_name || r.consequent_asin || (Array.isArray(r.consequents) ? r.consequents.join(', ') : r.consequents) || 'Item B');
      return {
        x: Number((r.support * 100).toFixed(2)),
        y: Number((r.confidence * 100).toFixed(2)),
        lift: r.lift,
        rule: `${anteVal.split(' ')[0]} ➔ ${consVal.split(' ')[0]}`
      };
    });

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

    // 1. Calculate node depths and maxDepth
    let maxDepth = 0;
    function annotateDepth(node, depth = 0) {
      if (!node) return;
      node.depth = depth;
      if (depth > maxDepth) maxDepth = depth;
      if (!node.is_leaf) {
        if (node.left) annotateDepth(node.left, depth + 1);
        if (node.right) annotateDepth(node.right, depth + 1);
      }
    }
    annotateDepth(rootNode, 0);

    // Layout configuration constants
    const nodeW = 220;         // Node bounding box width (px)
    const nodeH = 82;          // Node bounding box height (px)
    const minGapX = 70;        // Minimum horizontal gap between node bounding boxes (px)
    const levelHeight = 135;   // Vertical distance between level centers (px)
    const paddingX = 60;       // Horizontal padding on SVG canvas (px)
    const paddingY = 45;       // Vertical padding on SVG canvas (px)

    // 2. Assign horizontal (x) and vertical (y) positions bottom-up using leaf indexing
    let leafCounter = 0;
    function assignNodeCoordinates(node) {
      if (!node) return;
      if (node.is_leaf) {
        node.x = paddingX + leafCounter * (nodeW + minGapX) + nodeW / 2;
        leafCounter++;
      } else {
        if (node.left) assignNodeCoordinates(node.left);
        if (node.right) assignNodeCoordinates(node.right);

        if (node.left && node.right) {
          node.x = (node.left.x + node.right.x) / 2;
        } else if (node.left) {
          node.x = node.left.x + (nodeW + minGapX) / 2;
        } else if (node.right) {
          node.x = node.right.x - (nodeW + minGapX) / 2;
        }
      }
      node.y = paddingY + node.depth * levelHeight + nodeH / 2;
    }
    assignNodeCoordinates(rootNode);

    // 3. Traverse tree to collect all nodes and directed edges
    const nodeMap = [];
    const edgeList = [];

    function collectNodesAndEdges(node) {
      if (!node) return;
      nodeMap.push(node);
      if (!node.is_leaf) {
        if (node.left) {
          let condText = node.feature === 'monetary'
            ? `≤ ₹${Number(node.threshold).toLocaleString('en-IN')}`
            : `≤ ${node.threshold}`;
          edgeList.push({
            from: node,
            to: node.left,
            label: condText,
            branchType: 'Yes'
          });
          collectNodesAndEdges(node.left);
        }
        if (node.right) {
          let condText = node.feature === 'monetary'
            ? `> ₹${Number(node.threshold).toLocaleString('en-IN')}`
            : `> ${node.threshold}`;
          edgeList.push({
            from: node,
            to: node.right,
            label: condText,
            branchType: 'No'
          });
          collectNodesAndEdges(node.right);
        }
      }
    }
    collectNodesAndEdges(rootNode);

    // Calculate canvas size
    const contentWidth = paddingX * 2 + (leafCounter > 0 ? leafCounter : 1) * (nodeW + minGapX);
    const containerWidth = container.clientWidth || 800;
    const canvasWidth = Math.max(contentWidth, containerWidth);
    const canvasHeight = paddingY * 2 + maxDepth * levelHeight + nodeH + 30;

    let svgHtml = `
      <div style="width:100%; overflow-x:auto; overflow-y:auto; padding:0.5rem 0.25rem;">
        <svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" style="font-family:'Plus Jakarta Sans', sans-serif; display:block; margin:0 auto;">
          <defs>
            <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#352329" flood-opacity="0.14" />
            </filter>
            <filter id="shadow-subtle" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#352329" flood-opacity="0.10" />
            </filter>
            <marker id="arrow-Yes" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#2e7d32" />
            </marker>
            <marker id="arrow-No" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#c62828" />
            </marker>
          </defs>
    `;

    // Render Edges & Labels FIRST (behind nodes)
    edgeList.forEach(edge => {
      const x1 = edge.from.x;
      const y1 = edge.from.y + nodeH / 2;
      const x2 = edge.to.x;
      const y2 = edge.to.y - nodeH / 2;

      const cy1 = y1 + (y2 - y1) * 0.45;
      const cy2 = y1 + (y2 - y1) * 0.55;

      const pathD = `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`;
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      const isYes = edge.branchType === 'Yes';
      const labelColor = isYes ? '#1b5e20' : '#b71c1c';
      const labelBg = isYes ? '#e8f5e9' : '#ffebee';
      const labelBorder = isYes ? '#81c784' : '#e57373';

      const badgeText = `${edge.branchType}: ${edge.label}`;
      const badgeW = Math.max(90, badgeText.length * 6.5 + 16);

      svgHtml += `
        <g class="dt-edge-group">
          <path d="${pathD}" stroke="#B98283" stroke-width="2.5" fill="none" marker-end="url(#arrow-${edge.branchType})" />
          <g transform="translate(${midX}, ${midY})">
            <rect x="${-badgeW/2}" y="-11" width="${badgeW}" height="22" rx="11" fill="${labelBg}" stroke="${labelBorder}" stroke-width="1.2" filter="url(#shadow-subtle)" />
            <text x="0" y="4" text-anchor="middle" font-size="10px" font-weight="700" fill="${labelColor}">${badgeText}</text>
          </g>
        </g>
      `;
    });

    // Render Nodes SECOND (in front of edges)
    nodeMap.forEach(node => {
      const rx = node.x - nodeW / 2;
      const ry = node.y - nodeH / 2;

      if (node.is_leaf) {
        const isVip = (node.prediction || "").toLowerCase().includes("vip") || node.class_index === 1;
        const headerBg = isVip ? '#641E2B' : '#4E1721';
        const cardBg = isVip ? '#FFF9F2' : '#FDFBF7';
        const borderColor = isVip ? '#C5A46D' : '#B98283';
        const titleText = isVip ? '⭐ VIP / Target Customer' : '🛍️ Standard Shopper';

        svgHtml += `
          <g class="dt-node-group" style="cursor:pointer;">
            <rect x="${rx}" y="${ry}" width="${nodeW}" height="${nodeH}" rx="10" fill="${cardBg}" stroke="${borderColor}" stroke-width="2" filter="url(#shadow)" />
            <path d="M ${rx} ${ry+10} Q ${rx} ${ry} ${rx+10} ${ry} L ${rx+nodeW-10} ${ry} Q ${rx+nodeW} ${ry} ${rx+nodeW} ${ry+10} L ${rx+nodeW} ${ry+24} L ${rx} ${ry+24} Z" fill="${headerBg}" />
            <text x="${node.x}" y="${ry + 16}" text-anchor="middle" font-size="11px" font-weight="700" fill="#FFF9F2">${titleText}</text>
            <text x="${node.x}" y="${ry + 41}" text-anchor="middle" font-size="10.5px" font-weight="700" fill="#641E2B">Leaf: ${node.prediction}</text>
            <text x="${node.x}" y="${ry + 58}" text-anchor="middle" font-size="9.5px" font-weight="600" fill="#352329">Samples: ${node.samples}  |  Gini: ${node.impurity}</text>
            <text x="${node.x}" y="${ry + 73}" text-anchor="middle" font-size="9px" font-weight="600" fill="#8C2D40">Class Ratio: [${(node.value || []).join(', ')}]</text>
          </g>
        `;
      } else {
        const condLabel = (node.feature_label || node.feature || 'Rule').split(' ')[0] + ' Rule';
        let splitText = node.feature === 'monetary'
          ? `Spend ≤ ₹${Number(node.threshold).toLocaleString('en-IN')}`
          : `${node.feature_label || node.feature} ≤ ${node.threshold}`;

        svgHtml += `
          <g class="dt-node-group" style="cursor:pointer;">
            <rect x="${rx}" y="${ry}" width="${nodeW}" height="${nodeH}" rx="10" fill="#FFF9F2" stroke="#641E2B" stroke-width="2" filter="url(#shadow)" />
            <path d="M ${rx} ${ry+10} Q ${rx} ${ry} ${rx+10} ${ry} L ${rx+nodeW-10} ${ry} Q ${rx+nodeW} ${ry} ${rx+nodeW} ${ry+10} L ${rx+nodeW} ${ry+24} L ${rx} ${ry+24} Z" fill="#641E2B" />
            <text x="${node.x}" y="${ry + 16}" text-anchor="middle" font-size="11px" font-weight="700" fill="#C5A46D">Split: ${condLabel}</text>
            <text x="${node.x}" y="${ry + 41}" text-anchor="middle" font-size="10.5px" font-weight="700" fill="#641E2B">Condition: ${splitText}</text>
            <text x="${node.x}" y="${ry + 58}" text-anchor="middle" font-size="9.5px" font-weight="600" fill="#352329">Samples: ${node.samples}  |  Gini: ${node.impurity}</text>
            <text x="${node.x}" y="${ry + 73}" text-anchor="middle" font-size="9px" font-weight="500" fill="#8C2D40">Subtree Samples: ${node.samples}</text>
          </g>
        `;
      }
    });

    svgHtml += `</svg></div>`;
    container.innerHTML = svgHtml;
  }
};
