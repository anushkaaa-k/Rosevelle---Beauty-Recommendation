"""
Unit & Integration Test Suite for Real Cosmetics E-Commerce Analytics App.
Validates API endpoints, dataset loader integrity, algorithms, and disclaimers.
"""

import unittest
import json
from app import app
from data_loader import (
    load_and_clean_cosmetics_df,
    get_dataset_summary
)
from algorithms import RecommenderEngine, run_apriori_market_basket, run_customer_rfm_clustering, run_sales_olap_analysis


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
        self.assertTrue(data["datasets_ready"])

    def test_dataset_loader_integrity(self):
        """Test real cosmetics dataset loading integrity."""
        df = load_and_clean_cosmetics_df()
        self.assertEqual(len(df), 8164)

        # Check required columns
        self.assertIn("Date", df.columns)
        self.assertIn("Order Id", df.columns)
        self.assertIn("Customer Code", df.columns)
        self.assertIn("Product Name", df.columns)
        self.assertIn("Order quantity", df.columns)
        self.assertIn("Gross amount", df.columns)
        self.assertIn("Category 2", df.columns)

    def test_dataset_explorer_api(self):
        """Test dataset explorer API endpoint."""
        res = self.client.get("/api/dataset-explorer")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        self.assertIn("real_cosmetics_dataset", data)
        real = data["real_cosmetics_dataset"]
        self.assertFalse(real["is_synthetic"])
        self.assertEqual(real["total_records"], 8164)
        self.assertEqual(real["unique_orders"], 2217)
        self.assertEqual(real["unique_customers"], 2012)
        self.assertEqual(real["unique_products"], 32)
        self.assertEqual(real["total_revenue"], 986695.0)

    def test_dataset_records_pagination(self):
        """Test dataset records endpoint with filtering."""
        res = self.client.get("/api/dataset-records?page=1&limit=5")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["page"], 1)
        self.assertEqual(data["limit"], 5)
        self.assertEqual(len(data["records"]), 5)

    def test_recommendation_algorithms(self):
        """Test all 5 recommendation algorithms."""
        algorithms = ["hybrid", "svd", "user_cf", "item_cf", "content_tfidf"]
        for algo in algorithms:
            payload = {"user_id": "CUST-0001", "algorithm": algo, "top_k": 3}
            res = self.client.post("/api/recommend", data=json.dumps(payload), content_type="application/json")
            self.assertEqual(res.status_code, 200, f"Algorithm {algo} failed")
            data = res.get_json()
            self.assertEqual(data["status"], "success")
            self.assertEqual(len(data["recommendations"]), 3)
            self.assertIn("predicted_rating", data["recommendations"][0])
            self.assertIn("explanation", data["recommendations"][0])

    def test_evaluation_metrics_api(self):
        """Test recommender system evaluation metrics endpoint."""
        res = self.client.get("/api/evaluation-metrics?top_k=5")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("metrics", data)
        self.assertIn("RMSE", data["metrics"])
        self.assertIn("MAE", data["metrics"])
        self.assertIn("Precision@K", data["metrics"])
        self.assertIn("NDCG@K", data["metrics"])
        self.assertGreater(data["metrics"]["Precision@K"], 0.0)

    def test_apriori_api(self):
        """Test Apriori Market Basket Analysis endpoint on real cosmetics dataset."""
        res = self.client.get("/api/apriori-rules?min_support=0.04&min_confidence=0.2")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIsInstance(data["association_rules"], list)
        self.assertIn("basket_analytics", data)

        analytics = data["basket_analytics"]
        tot_rev = analytics["total_simulated_revenue"]
        tot_orders = analytics["total_simulated_orders"]
        avg_val = analytics["avg_basket_value"]

        self.assertEqual(tot_orders, 2217)
        self.assertEqual(tot_rev, 986695.0)
        self.assertEqual(avg_val, 445.06)

    def test_rfm_clustering_api(self):
        """Test Customer RFM Clustering endpoint."""
        res = self.client.get("/api/rfm-clusters?k_clusters=4")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["k_clusters"], 4)
        self.assertIn("silhouette_score", data)
        self.assertIn("actionable_insight", data["cluster_profiles"][0])

    def test_sales_olap_api(self):
        """Test Multidimensional Sales OLAP endpoint."""
        res = self.client.get("/api/sales-olap?channel=ALL&quarter=ALL&category=ALL")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("summary", data)
        self.assertIn("by_channel", data)
        self.assertIn("by_category", data)
        self.assertIn("top_products", data)

    def test_decision_tree_api(self):
        """Test Decision Tree analysis endpoint."""
        res = self.client.get("/api/decision-tree?max_depth=3")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("metrics", data)
        self.assertIn("accuracy", data["metrics"])
        self.assertIn("feature_importances", data)

    def test_predict_behavior_api(self):
        """Test Customer behavior prediction endpoint."""
        payload = {"recency": 10, "frequency": 3, "monetary": 850, "avg_basket_items": 3.0}
        res = self.client.post("/api/predict-behavior", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("predicted_segment", data)
        self.assertIn("confidence_score", data)
        self.assertIn("decision_path", data)


if __name__ == "__main__":
    unittest.main()
