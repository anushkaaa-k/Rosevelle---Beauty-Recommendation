/**
 * API Client Module for Beauty Recommender App.
 * Interfaces with Flask backend REST endpoints.
 */

const API = {
  async getHealth() {
    const res = await fetch('/api/health');
    return await res.json();
  },

  async getDatasetExplorer() {
    const res = await fetch('/api/dataset-explorer');
    return await res.json();
  },

  async getDatasetRecords(dataset = 'amazon_reviews', page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({ dataset, page, limit, search });
    const res = await fetch(`/api/dataset-records?${params.toString()}`);
    return await res.json();
  },

  async getRecommendations(userId, algorithm, topK = 5) {
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, algorithm, top_k: topK })
    });
    return await res.json();
  },

  async getEvaluationMetrics(topK = 5) {
    const res = await fetch(`/api/evaluation-metrics?top_k=${topK}`);
    return await res.json();
  },

  async getAprioriRules(minSupport = 0.08, minConfidence = 0.3) {
    const params = new URLSearchParams({ min_support: minSupport, min_confidence: minConfidence });
    const res = await fetch(`/api/apriori-rules?${params.toString()}`);
    return await res.json();
  },

  async getRfmClusters(kClusters = 4) {
    const res = await fetch(`/api/rfm-clusters?k_clusters=${kClusters}`);
    return await res.json();
  },

  async getSalesOlap(operation = 'summary', channel = 'ALL', quarter = 'ALL', category = 'ALL') {
    const params = new URLSearchParams({ operation, channel, quarter, category });
    const res = await fetch(`/api/sales-olap?${params.toString()}`);
    return await res.json();
  },

  async getDecisionTree(maxDepth = 3) {
    const res = await fetch(`/api/decision-tree?max_depth=${maxDepth}`);
    return await res.json();
  },

  async predictBehavior(payload) {
    const res = await fetch('/api/predict-behavior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }
};
