/**
 * API Client Module for ROSEVELLE App.
 * Interfaces with Flask backend REST endpoints supporting dual-mode (live | local).
 */

window.currentDataSource = 'local'; // Default mode: Real Cosmetics E-Commerce Dataset

const API = {
  async getHealth() {
    const res = await fetch('/api/health');
    return await res.json();
  },

  async getLiveStatus() {
    const res = await fetch('/api/live-status');
    return await res.json();
  },

  async postLiveRefresh() {
    const res = await fetch('/api/live-refresh', { method: 'POST' });
    return await res.json();
  },

  async getDatasetExplorer(source = window.currentDataSource) {
    const params = new URLSearchParams({ source });
    const res = await fetch(`/api/dataset-explorer?${params.toString()}`);
    return await res.json();
  },

  async getDatasetRecords(dataset = 'real_cosmetics_ecommerce', page = 1, limit = 10, search = '', source = window.currentDataSource) {
    const params = new URLSearchParams({ dataset, page, limit, search, source });
    const res = await fetch(`/api/dataset-records?${params.toString()}`);
    return await res.json();
  },

  async getRecommendations(userId, algorithm, topK = 5, source = window.currentDataSource) {
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, algorithm, top_k: topK, source })
    });
    return await res.json();
  },

  async getEvaluationMetrics(topK = 5, source = window.currentDataSource) {
    const params = new URLSearchParams({ top_k: topK, source });
    const res = await fetch(`/api/evaluation-metrics?${params.toString()}`);
    return await res.json();
  },

  async getAprioriRules(minSupport = 0.04, minConfidence = 0.2, source = window.currentDataSource) {
    const params = new URLSearchParams({ min_support: minSupport, min_confidence: minConfidence, source });
    const res = await fetch(`/api/apriori-rules?${params.toString()}`);
    return await res.json();
  },

  async getRfmClusters(kClusters = 4, source = window.currentDataSource) {
    const params = new URLSearchParams({ k_clusters: kClusters, source });
    const res = await fetch(`/api/rfm-clusters?${params.toString()}`);
    return await res.json();
  },

  async getSalesOlap(operation = 'summary', channel = 'ALL', quarter = 'ALL', category = 'ALL', source = window.currentDataSource) {
    const params = new URLSearchParams({ operation, channel, quarter, category, source });
    const res = await fetch(`/api/sales-olap?${params.toString()}`);
    return await res.json();
  },

  async getDecisionTree(maxDepth = 3, source = window.currentDataSource) {
    const params = new URLSearchParams({ max_depth: maxDepth, source });
    const res = await fetch(`/api/decision-tree?${params.toString()}`);
    return await res.json();
  },

  async predictBehavior(payload) {
    const bodyPayload = { ...payload, source: payload.source || window.currentDataSource };
    const res = await fetch('/api/predict-behavior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    });
    return await res.json();
  },

  async getLiveProducts(brand = 'all', productType = 'all', limit = 20) {
    const params = new URLSearchParams({ brand, product_type: productType, limit });
    const res = await fetch(`/api/live-products?${params.toString()}`);
    return await res.json();
  }
};
