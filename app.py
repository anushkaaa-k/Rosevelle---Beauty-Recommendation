"""
Beauty Recommender & E-Commerce Analytics Flask Server.

Provides REST API endpoints for:
1. Dataset Explorer & Schema Inspection (Real Cosmetics E-Commerce Dataset ~8,164 records)
2. Recommender System Engines & Dynamic Metric Evaluations (SVD, User-CF, Item-CF, Content TF-IDF, Hybrid)
3. Apriori Market Basket Analysis (Support, Confidence, Lift, Conviction)
4. Customer RFM Segmentation & K-Means Clustering (Silhouette Analysis, Personas)
5. Multidimensional Sales OLAP Operations (Slice, Dice, Roll-up, Drill-down, Pivots)
6. Decision Tree Behavioral Classification & Prediction Form
"""

import os
from flask import Flask, render_template, request, jsonify

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
    predict_customer_behavior
)

app = Flask(__name__, static_folder="static", template_folder="templates")

# Initialize dataset loader and recommendation engine
initialize_datasets_if_missing()
recommender_engine = RecommenderEngine()


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
        "version": "2.0.0",
        "datasets_ready": True
    }), 200


@app.route("/api/dataset-explorer", methods=["GET"])
def dataset_explorer():
    """Returns dataset schemas, field descriptions, statistics, and disclaimers."""
    try:
        summary = get_dataset_summary()
        return jsonify(summary), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch dataset summary", "message": str(e)}), 500


@app.route("/api/dataset-records", methods=["GET"])
def get_dataset_records():
    """
    Returns paginated, filtered sample records from real cosmetics dataset.
    Query params:
    - dataset: 'cosmetics_orders' | 'cosmetics_customers' | 'cosmetics_products'
    - page: int (default: 1)
    - limit: int (default: 10)
    - search: string filter
    """
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    search_query = request.args.get("search", "").lower().strip()

    try:
        df = load_and_clean_cosmetics_df()
        dataset_label = "Real Cosmetics E-Commerce Dataset (~8,164 records)"

        if search_query:
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

        # Format records cleanly
        records = []
        for _, row in paginated_df.iterrows():
            records.append({
                "Date": row["Date"],
                "Order Id": row["Order Id"],
                "Order Status": row["Order Status"],
                "Customer Code": row["Customer Code"],
                "City": row["City"],
                "State": row["State"],
                "Zone": row["Zone"],
                "Product Name": row["Product Name"],
                "Category 2": row["Category 2"],
                "Order quantity": int(row["Order quantity"]),
                "Gross amount": float(row["Gross amount"]),
                "Variant Name": row["Variant Name"],
                "Skin Tones": row["Skin Tones"]
            })

        return jsonify({
            "status": "success",
            "dataset": "real_cosmetics_ecommerce",
            "dataset_label": dataset_label,
            "page": page,
            "limit": limit,
            "total_records": total_records,
            "total_pages": (total_records + limit - 1) // limit if limit > 0 else 1,
            "records": records
        }), 200

    except Exception as e:
        return jsonify({"error": "Failed to query dataset records", "message": str(e)}), 500


@app.route("/api/recommend", methods=["POST"])
def get_recommendations():
    """
    Main Recommendation API Endpoint.
    JSON payload:
    {
        "user_id": "CUST-0001",
        "algorithm": "hybrid" | "svd" | "user_cf" | "item_cf" | "content_tfidf",
        "top_k": 5
    }
    """
    if not request.is_json:
        return jsonify({"error": "Bad Request", "message": "Content-Type must be application/json"}), 400

    payload = request.get_json() or {}
    user_id = payload.get("user_id", "CUST-0001")
    algorithm = payload.get("algorithm", "hybrid").lower().strip()
    top_k = int(payload.get("top_k", 5))

    try:
        if algorithm == "svd":
            recommendations = recommender_engine.recommend_svd(user_id, top_k=top_k)
            algo_name = "Matrix Factorization (Truncated SVD)"
        elif algorithm == "user_cf":
            recommendations = recommender_engine.recommend_user_collaborative(user_id, top_k=top_k)
            algo_name = "User-Based Collaborative Filtering (Cosine Similarity)"
        elif algorithm == "item_cf":
            recommendations = recommender_engine.recommend_item_collaborative(user_id, top_k=top_k)
            algo_name = "Item-Based Collaborative Filtering (Item Cosine Similarity)"
        elif algorithm == "content_tfidf":
            recommendations = recommender_engine.recommend_content_based(user_id, top_k=top_k)
            algo_name = "Content-Based Filtering (Metadata TF-IDF)"
        else:  # hybrid
            recommendations = recommender_engine.recommend_hybrid(user_id, top_k=top_k)
            algo_name = "Hybrid Recommender (SVD Matrix Factorization + Content TF-IDF)"

        return jsonify({
            "status": "success",
            "dataset_origin": "Real Cosmetics E-Commerce Dataset (~8,164 records)",
            "user_id": user_id,
            "algorithm": algorithm,
            "algorithm_name": algo_name,
            "top_k": top_k,
            "recommendations": recommendations
        }), 200

    except Exception as e:
        return jsonify({"error": "Recommendation error", "message": str(e)}), 500


@app.route("/api/evaluation-metrics", methods=["GET"])
def get_evaluation_metrics():
    """Returns empirical evaluation metrics calculated on actual cosmetics dataset."""
    top_k = int(request.args.get("top_k", 5))
    try:
        eval_results = recommender_engine.evaluate_all_algorithms(top_k=top_k)
        return jsonify(eval_results), 200
    except Exception as e:
        return jsonify({"error": "Failed to calculate evaluation metrics", "message": str(e)}), 500


@app.route("/api/apriori-rules", methods=["GET"])
def get_apriori_rules():
    """Returns Apriori frequent itemsets and association rules computed on Real Cosmetics Baskets."""
    min_support = float(request.args.get("min_support", 0.04))
    min_confidence = float(request.args.get("min_confidence", 0.2))

    try:
        rules_result = run_apriori_market_basket(min_support=min_support, min_confidence=min_confidence)
        return jsonify(rules_result), 200
    except Exception as e:
        return jsonify({"error": "Apriori calculation error", "message": str(e)}), 500


@app.route("/api/rfm-clusters", methods=["GET"])
def get_rfm_clusters():
    """Returns Customer RFM Segmentation & K-Means Clusters from Real Cosmetics Data."""
    k_clusters = int(request.args.get("k_clusters", 4))
    try:
        rfm_result = run_customer_rfm_clustering(k_clusters=k_clusters)
        return jsonify(rfm_result), 200
    except Exception as e:
        return jsonify({"error": "RFM Clustering error", "message": str(e)}), 500


@app.route("/api/sales-olap", methods=["GET"])
def get_sales_olap():
    """Returns Multidimensional OLAP Cubes analysis from Real Cosmetics Data."""
    operation = request.args.get("operation", "summary")
    channel = request.args.get("channel", "ALL")
    quarter = request.args.get("quarter", "ALL")
    category = request.args.get("category", "ALL")

    try:
        olap_result = run_sales_olap_analysis(
            operation=operation,
            filter_channel=channel,
            filter_quarter=quarter,
            filter_category=category
        )
        return jsonify(olap_result), 200
    except Exception as e:
        return jsonify({"error": "OLAP analysis error", "message": str(e)}), 500


@app.route("/api/decision-tree", methods=["GET"])
def get_decision_tree():
    """Returns Decision Tree model performance metrics, feature importances, and rules."""
    max_depth = int(request.args.get("max_depth", 3))
    try:
        dt_result = run_decision_tree_analysis(max_depth=max_depth)
        return jsonify(dt_result), 200
    except Exception as e:
        return jsonify({"error": "Decision Tree calculation error", "message": str(e)}), 500


@app.route("/api/predict-behavior", methods=["POST"])
def predict_behavior():
    """Predicts customer behavior and returns decision path."""
    if not request.is_json:
        return jsonify({"error": "Bad Request", "message": "Content-Type must be application/json"}), 400

    payload = request.get_json() or {}
    try:
        recency = float(payload.get("recency", 14.0))
        frequency = float(payload.get("frequency", 2.0))
        monetary = float(payload.get("monetary", 650.0))
        avg_items = float(payload.get("avg_basket_items", 3.0))

        prediction_res = predict_customer_behavior(recency, frequency, monetary, avg_items)
        return jsonify(prediction_res), 200
    except Exception as e:
        return jsonify({"error": "Prediction error", "message": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[*] Starting ROSEVELLE Recommender Server on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
