"""
ROSEVELLE Luxury Cosmetics Analytics & Live Data Engine Flask Server.

Provides REST API endpoints supporting dual-mode execution:
1. LIVE API DATA Mode (Makeup API)
2. LOCAL DATASET Mode (Real Cosmetics E-Commerce Dataset ~8,164 records)

Endpoints:
- /api/health
- /api/live-status
- /api/live-refresh
- /api/dataset-explorer
- /api/dataset-records
- /api/recommend
- /api/evaluation-metrics
- /api/apriori-rules
- /api/rfm-clusters
- /api/sales-olap
- /api/decision-tree
- /api/predict-behavior
- /api/live-products
"""

import os
from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np

from data_loader import (
    initialize_datasets_if_missing,
    get_dataset_summary,
    load_and_clean_cosmetics_df
)
from algorithms import (
    RecommenderEngine,
    run_apriori_market_basket,
    run_customer_rfm_clustering,
    run_sales_olap_analysis,
    run_decision_tree_analysis,
    predict_customer_behavior,
    evaluate_all_algorithms,
    get_dataset
)
from live_cosmetics_service import fetch_live_cosmetics

app = Flask(__name__, static_folder="static", template_folder="templates")

# Initialize dataset loader
initialize_datasets_if_missing()


@app.route("/")
def index():
    """Serves the main SPA Dashboard HTML interface."""
    return render_template("index.html")


@app.route("/api/health", methods=["GET"])
def health_check():
    """System health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "ROSEVELLE Recommender & Analytics Engine API",
        "version": "3.0.0",
        "datasets_ready": True
    }), 200


@app.route("/api/live-status", methods=["GET"])
def live_status():
    """Returns connection status and metadata for Live Cosmetics REST API (Makeup API)."""
    try:
        res = fetch_live_cosmetics(limit=50)
        return jsonify(res), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "data_source": "Makeup API",
            "live": True,
            "message": f"LIVE COSMETICS API UNAVAILABLE: {str(e)}",
            "products": []
        }), 500


@app.route("/api/live-refresh", methods=["POST"])
def live_refresh():
    """Forces cache invalidation and fetches fresh catalogue from Makeup API."""
    try:
        res = fetch_live_cosmetics(limit=50, force_refresh=True)
        if res.get("status") == "success":
            return jsonify({
                "status": "success",
                "message": "Live cosmetics catalogue refreshed successfully from Makeup API.",
                "data_source": "Makeup API",
                "fetched_at": res.get("fetched_at"),
                "total_products_available": res.get("total_products_available")
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": res.get("message") or "LIVE COSMETICS API UNAVAILABLE"
            }), 502
    except Exception as e:
        return jsonify({"status": "error", "message": f"Refresh error: {str(e)}"}), 500


@app.route("/api/dataset-explorer", methods=["GET"])
def dataset_explorer():
    """Returns dataset schemas, field descriptions, statistics, and metadata for Real Cosmetics E-Commerce Dataset."""
    try:
        summary = get_dataset_summary()
        summary["source"] = "Real Cosmetics E-Commerce Transaction Dataset (~8,164 records)"
        summary["live"] = False
        return jsonify(summary), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch dataset summary", "message": str(e)}), 500


@app.route("/api/dataset-records", methods=["GET"])
def get_dataset_records():
    """Returns paginated, filtered transaction records."""
    source = request.args.get("source", "local").lower().strip()
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    search_query = request.args.get("search", "").lower().strip()

    try:
        df, meta = get_dataset(source=source)
        is_live = "customer_id_str" in df.columns

        if search_query:
            if is_live:
                df = df[
                    df["order_id_str"].str.lower().str.contains(search_query) |
                    df["customer_id_str"].str.lower().str.contains(search_query) |
                    df["product_name"].str.lower().str.contains(search_query) |
                    df["category"].str.lower().str.contains(search_query) |
                    df["brand"].str.lower().str.contains(search_query)
                ]
            else:
                df = df[
                    df["Order Id"].str.lower().str.contains(search_query) |
                    df["Customer Code"].str.lower().str.contains(search_query) |
                    df["Product Name"].str.lower().str.contains(search_query) |
                    df["Category 2"].str.lower().str.contains(search_query) |
                    df["Zone"].str.lower().str.contains(search_query)
                ]

        total_records = len(df)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_df = df.iloc[start_idx:end_idx].copy()

        records = []
        for _, row in paginated_df.iterrows():
            if is_live:
                records.append({
                    "Date": str(row["order_date"]),
                    "Order Id": str(row["order_id_str"]),
                    "Order Status": str(row["order_status"]).title(),
                    "Customer Code": str(row["customer_id_str"]),
                    "City": "Online",
                    "State": str(row["customer_tier"]),
                    "Zone": str(row["brand"]),
                    "Product Name": str(row["product_name"]),
                    "Category 2": str(row["category"]),
                    "Order quantity": int(row["quantity"]),
                    "Gross amount": float(row["line_total"]),
                    "Variant Name": f"${row['unit_price']:.2f}/unit",
                    "Skin Tones": f"Rating: {row['rating']} ★"
                })
            else:
                records.append({
                    "Date": str(row["Date"]),
                    "Order Id": str(row["Order Id"]),
                    "Order Status": str(row["Order Status"]),
                    "Customer Code": str(row["Customer Code"]),
                    "City": str(row["City"]),
                    "State": str(row["State"]),
                    "Zone": str(row["Zone"]),
                    "Product Name": str(row["Product Name"]),
                    "Category 2": str(row["Category 2"]),
                    "Order quantity": int(row["Order quantity"]),
                    "Gross amount": float(row["Gross amount"]),
                    "Variant Name": str(row["Variant Name"]),
                    "Skin Tones": str(row["Skin Tones"])
                })

        return jsonify({
            "status": "success",
            "source": meta.get("source", "Makeup API" if is_live else "Local Dataset"),
            "live": is_live,
            "page": page,
            "limit": limit,
            "total_records": total_records,
            "total_pages": int(np.ceil(total_records / limit)) if limit > 0 else 1,
            "records": records
        }), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch dataset records", "message": str(e)}), 500


@app.route("/api/recommend", methods=["POST"])
def recommend():
    """Generates personalized product recommendations."""
    if not request.is_json:
        return jsonify({"error": "Bad Request", "message": "Content-Type must be application/json"}), 400

    payload = request.get_json() or {}
    source = payload.get("source", "local").lower().strip()
    user_id = payload.get("user_id", "CUST-10")
    algorithm = payload.get("algorithm", "hybrid").lower().strip()
    top_k = int(payload.get("top_k", 5))

    algo_names = {
        "hybrid": "Hybrid Engine (SVD + TF-IDF)",
        "svd": "Matrix Factorization (Truncated SVD)",
        "user_cf": "User-Based Collaborative Filtering",
        "item_cf": "Item-Based Collaborative Filtering",
        "content_tfidf": "Content-Based Filtering (TF-IDF)"
    }
    algo_display_name = algo_names.get(algorithm, "Hybrid Engine (SVD + TF-IDF)")

    try:
        engine = RecommenderEngine(source=source)

        if algorithm == "svd":
            recs = engine.recommend_svd(user_id, top_k=top_k)
        elif algorithm == "user_cf":
            recs = engine.recommend_user_collaborative(user_id, top_k=top_k)
        elif algorithm == "item_cf":
            recs = engine.recommend_item_collaborative(user_id, top_k=top_k)
        elif algorithm == "content_tfidf":
            recs = engine.recommend_content_based(user_id, top_k=top_k)
        else:
            recs = engine.recommend_hybrid(user_id, top_k=top_k)

        return jsonify({
            "status": "success",
            "source": "Makeup API" if source == "live" else "Local Dataset",
            "live": source == "live",
            "user_id": user_id,
            "algorithm": algorithm,
            "algorithm_name": algo_display_name,
            "top_k": top_k,
            "recommendations": recs
        }), 200
    except Exception as e:
        return jsonify({"error": "Recommendation error", "message": str(e)}), 500


@app.route("/api/evaluation-metrics", methods=["GET"])
def get_evaluation_metrics():
    """Computes recommender system benchmark evaluation metrics."""
    top_k = int(request.args.get("top_k", 5))
    source = request.args.get("source", "local").lower().strip()
    try:
        metrics_data = evaluate_all_algorithms(top_k=top_k, source=source)
        return jsonify(metrics_data), 200
    except Exception as e:
        return jsonify({"error": "Evaluation calculation error", "message": str(e)}), 500


@app.route("/api/apriori-rules", methods=["GET"])
def get_apriori_rules():
    """Mines market basket association rules."""
    min_support = float(request.args.get("min_support", 0.04))
    min_confidence = float(request.args.get("min_confidence", 0.2))
    source = request.args.get("source", "local").lower().strip()

    try:
        rules_data = run_apriori_market_basket(min_support=min_support, min_confidence=min_confidence, source=source)
        return jsonify(rules_data), 200
    except Exception as e:
        return jsonify({"error": "Apriori calculation error", "message": str(e)}), 500


@app.route("/api/rfm-clusters", methods=["GET"])
def get_rfm_clusters():
    """Returns Customer RFM Segmentation & K-Means Clusters."""
    k_clusters = int(request.args.get("k_clusters", 4))
    source = request.args.get("source", "local").lower().strip()
    try:
        rfm_result = run_customer_rfm_clustering(k_clusters=k_clusters, source=source)
        return jsonify(rfm_result), 200
    except Exception as e:
        return jsonify({"error": "RFM Clustering error", "message": str(e)}), 500


@app.route("/api/sales-olap", methods=["GET"])
def get_sales_olap():
    """Returns Multidimensional OLAP Cubes analysis."""
    operation = request.args.get("operation", "summary")
    channel = request.args.get("channel", "ALL")
    quarter = request.args.get("quarter", "ALL")
    category = request.args.get("category", "ALL")
    source = request.args.get("source", "local").lower().strip()

    try:
        olap_result = run_sales_olap_analysis(
            operation=operation,
            filter_channel=channel,
            filter_quarter=quarter,
            filter_category=category,
            source=source
        )
        return jsonify(olap_result), 200
    except Exception as e:
        return jsonify({"error": "OLAP analysis error", "message": str(e)}), 500


@app.route("/api/decision-tree", methods=["GET"])
def get_decision_tree():
    """Returns Decision Tree model performance metrics and visual structure."""
    max_depth = int(request.args.get("max_depth", 3))
    source = request.args.get("source", "local").lower().strip()
    try:
        dt_result = run_decision_tree_analysis(max_depth=max_depth, source=source)
        return jsonify(dt_result), 200
    except Exception as e:
        return jsonify({"error": "Decision Tree calculation error", "message": str(e)}), 500


@app.route("/api/predict-behavior", methods=["POST"])
def predict_behavior():
    """Predicts customer tier classification."""
    if not request.is_json:
        return jsonify({"error": "Bad Request", "message": "Content-Type must be application/json"}), 400

    payload = request.get_json() or {}
    source = payload.get("source", "local").lower().strip()
    try:
        recency = float(payload.get("recency", 14.0))
        frequency = float(payload.get("frequency", 2.0))
        monetary = float(payload.get("monetary", 650.0))
        avg_items = float(payload.get("avg_basket_items", 3.0))

        prediction_res = predict_customer_behavior(recency, frequency, monetary, avg_items, source=source)
        return jsonify(prediction_res), 200
    except Exception as e:
        return jsonify({"error": "Prediction error", "message": str(e)}), 500


@app.route("/api/live-products", methods=["GET"])
def get_live_products():
    """Proxy endpoint fetching live cosmetics catalogue from Makeup API."""
    brand = request.args.get("brand", None)
    product_type = request.args.get("product_type", None)
    try:
        limit = int(request.args.get("limit", 20))
    except (ValueError, TypeError):
        limit = 20
    limit = max(1, min(limit, 100))

    try:
        result = fetch_live_cosmetics(brand=brand, product_type=product_type, limit=limit)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "data_source": "Makeup API",
            "message": f"Server failed to fetch live cosmetics: {str(e)}",
            "products": []
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[*] Starting ROSEVELLE Recommender Server on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
