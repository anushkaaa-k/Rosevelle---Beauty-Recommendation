"""
Runtime verification script to test API payloads and resolutions for Real Cosmetics E-Commerce Dataset:
1. Recommender Engine
2. Dataset Explorer (real_cosmetics_ecommerce)
3. Evaluation Metrics (sample_evaluated_products)
4. Apriori Basket Rules
5. RFM Clustering
6. Sales OLAP
7. Decision Tree Classifier
"""

import sys
from app import app

client = app.test_client()

print("=======================================================")
print("[*] VERIFYING ALL ROSEVELLE REAL COSMETICS SECTIONS...")
print("=======================================================")

# 1. Recommender Engine Test
print("\n[1] Testing Recommender Engine Payload...")
res_rec = client.post("/api/recommend", json={"user_id": "CUST-0001", "algorithm": "hybrid", "top_k": 5})
if res_rec.status_code == 200:
    recs = res_rec.get_json().get("recommendations", [])
    print(f"  [OK] Returned {len(recs)} recommendations.")
    for r in recs[:2]:
        print(f"    - {r.get('title')} (Predicted Rating: {r.get('predicted_rating')})")
else:
    print(f"  [FAIL] Recommender returned status {res_rec.status_code}")
    sys.exit(1)

# 2. Dataset Explorer Test
print("\n[2] Testing Dataset Explorer Endpoint...")
res_ds = client.get("/api/dataset-records?page=1&limit=5")
if res_ds.status_code == 200:
    records = res_ds.get_json().get("records", [])
    print(f"  [OK] Dataset returned {len(records)} records.")
    sample = records[0]
    print(f"    Sample Order ID: {sample.get('Order Id')}, Customer Code: {sample.get('Customer Code')}, Product: {sample.get('Product Name')}")
else:
    print(f"  [FAIL] Dataset records returned status {res_ds.status_code}")
    sys.exit(1)

# 3. Evaluation Metrics Test
print("\n[3] Testing Evaluation Metrics & Sample Evaluated Products...")
res_eval = client.get("/api/evaluation-metrics?top_k=5")
if res_eval.status_code == 200:
    eval_json = res_eval.get_json()
    metrics = eval_json.get("metrics", {})
    eval_prods = eval_json.get("sample_evaluated_products", [])
    print(f"  [OK] Metrics computed: RMSE={metrics.get('RMSE')}, MAE={metrics.get('MAE')}, Precision@5={metrics.get('Precision@K')}, NDCG@5={metrics.get('NDCG@K')}")
    print(f"  [OK] Returned {len(eval_prods)} evaluated product cases for table display.")
else:
    print(f"  [FAIL] Evaluation Metrics returned status {res_eval.status_code}")
    sys.exit(1)

# 4. Apriori Basket Rules Test
print("\n[4] Testing Apriori Association Rules...")
res_apr = client.get("/api/apriori-rules?min_support=0.04&min_confidence=0.2")
if res_apr.status_code == 200:
    data_apr = res_apr.get_json()
    rules = data_apr.get("association_rules", [])
    analytics = data_apr.get("basket_analytics", {})
    print(f"  [OK] Returned {len(rules)} association rules.")
    print(f"  [OK] Revenue: INR {analytics.get('total_simulated_revenue'):,.2f}, Orders: {analytics.get('total_simulated_orders')}, AOV: INR {analytics.get('avg_basket_value'):,.2f}")
    for rule in rules[:2]:
        print(f"    - {rule.get('antecedent_name')} => {rule.get('consequent_name')} (Lift: {rule.get('lift')}x)")
else:
    print(f"  [FAIL] Apriori returned status {res_apr.status_code}")
    sys.exit(1)

# 5. RFM Clustering Test
print("\n[5] Testing Customer RFM Clustering...")
res_rfm = client.get("/api/rfm-clusters?k_clusters=4")
if res_rfm.status_code == 200:
    rfm_json = res_rfm.get_json()
    print(f"  [OK] RFM Clusters calculated. Silhouette Score: {rfm_json.get('silhouette_score')}")
else:
    print(f"  [FAIL] RFM returned status {res_rfm.status_code}")
    sys.exit(1)

# 6. Sales OLAP Test
print("\n[6] Testing Sales OLAP Cubes...")
res_olap = client.get("/api/sales-olap?channel=ALL&quarter=ALL&category=ALL")
if res_olap.status_code == 200:
    olap_json = res_olap.get_json()
    print(f"  [OK] OLAP summary revenue: INR {olap_json.get('summary', {}).get('total_revenue'):,.2f}")
else:
    print(f"  [FAIL] OLAP returned status {res_olap.status_code}")
    sys.exit(1)

# 7. Decision Tree Classifier Test
print("\n[7] Testing Decision Tree Classifier...")
res_dt = client.get("/api/decision-tree?max_depth=3")
if res_dt.status_code == 200:
    dt_json = res_dt.get_json()
    metrics = dt_json.get("metrics", {})
    print(f"  [OK] Decision Tree accuracy: {metrics.get('accuracy') * 100:.1f}%, F1: {metrics.get('f1_score') * 100:.1f}%")
else:
    print(f"  [FAIL] Decision Tree returned status {res_dt.status_code}")
    sys.exit(1)

print("\n=======================================================")
print("[SUCCESS] ALL SECTIONS ON REAL COSMETICS DATASET ARE 100% VERIFIED!")
print("=======================================================")
