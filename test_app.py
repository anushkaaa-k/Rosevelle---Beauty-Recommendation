"""
Unit & Integration Test Suite for ROSEVELLE Analytics Platform.
Validates local real cosmetics offline dataset and Makeup API live cosmetics catalogue endpoints.
"""

import unittest
import json
from app import app
from data_loader import load_and_clean_cosmetics_df


class TestBeautyRecommenderApp(unittest.TestCase):
    def setUp(self):
        """Configure test client."""
        self.client = app.test_client()
        self.client.testing = True

    def test_health_check(self):
        """Test system health check endpoint."""
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")

    def test_live_status_api(self):
        """Test Makeup API Live Cosmetics status endpoint."""
        res = self.client.get("/api/live-status")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["data_source"], "Makeup API")
        self.assertTrue(data["live"])

    def test_dataset_loader_integrity(self):
        """Test local real cosmetics dataset loading integrity."""
        df = load_and_clean_cosmetics_df()
        self.assertEqual(len(df), 8164)

    def test_dataset_explorer(self):
        """Test dataset explorer API."""
        res = self.client.get("/api/dataset-explorer")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("real_cosmetics_dataset", data)
        self.assertEqual(data["real_cosmetics_dataset"]["total_records"], 8164)

    def test_dataset_records_pagination(self):
        """Test dataset records endpoint."""
        res = self.client.get("/api/dataset-records?page=1&limit=5")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(len(data["records"]), 5)

    def test_recommendation_algorithms(self):
        """Test recommendation algorithms on cosmetics transaction dataset."""
        algorithms = ["hybrid", "svd", "user_cf", "item_cf", "content_tfidf"]
        for algo in algorithms:
            payload = {"user_id": "CUST-0001", "algorithm": algo, "top_k": 3}
            res = self.client.post("/api/recommend", data=json.dumps(payload), content_type="application/json")
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            self.assertEqual(data["status"], "success")
            self.assertIn("algorithm_name", data)
            self.assertEqual(len(data["recommendations"]), 3)

    def test_evaluation_metrics(self):
        """Test evaluation metrics on cosmetics transaction dataset."""
        res = self.client.get("/api/evaluation-metrics?top_k=5")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("RMSE", data["metrics"])

    def test_apriori_api(self):
        """Test Apriori Association Rule Mining on cosmetics order items."""
        res = self.client.get("/api/apriori-rules?min_support=0.01&min_confidence=0.1")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")

    def test_rfm_clustering_api(self):
        """Test Customer RFM Clustering on cosmetics orders."""
        res = self.client.get("/api/rfm-clusters?k_clusters=4")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")

    def test_sales_olap_api(self):
        """Test Multidimensional Sales OLAP on cosmetics transactions."""
        res = self.client.get("/api/sales-olap")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")

    def test_decision_tree_api(self):
        """Test Decision Tree Behavioral Classification on cosmetics dataset."""
        res = self.client.get("/api/decision-tree?max_depth=3")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")

    def test_live_products_api(self):
        """Test Live Cosmetics catalogue proxy endpoint."""
        res = self.client.get("/api/live-products?limit=5")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["data_source"], "Makeup API")

    def test_live_refresh_api(self):
        """Test Live Refresh endpoint for Makeup API."""
        res = self.client.post("/api/live-refresh")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["data_source"], "Makeup API")


if __name__ == "__main__":
    unittest.main()
