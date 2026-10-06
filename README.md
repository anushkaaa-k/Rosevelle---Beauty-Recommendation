# ROSEVELLE — Luxury Cosmetics Recommender & Data Analytics Engine

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0+-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Live API](https://img.shields.io/badge/Live_API-Makeup_REST_API-2e7d32?style=for-the-badge)](https://makeup-api.herokuapp.com/api/v1/products.json)

**ROSEVELLE** is a modern luxury cosmetics analytics and personalized recommendation engine. Operating in dual execution modes (**LIVE API DATA Mode** powered by Makeup API and **LOCAL DATASET Mode** powered by an authentic Real Cosmetics E-Commerce Dataset), the platform delivers personalized recommendations, empirical metric evaluations, market basket association rule mining (Apriori), customer segmentation (K-Means RFM), multidimensional sales OLAP slicing & dicing, and predictive behavioral decision tree classification.

---

## 📌 Data Architecture Overview

| Layer | Source | Scope & Use Case | Records / Scale |
| :--- | :--- | :--- | :--- |
| **LIVE PRODUCT CATALOGUE** | **Makeup REST API** (`https://makeup-api.herokuapp.com/api/v1/products.json`) | Fresh live cosmetics product catalogue, images, brands, and categories | 931 Real Cosmetics Products |
| **HISTORICAL TRANSACTION ANALYTICS** | **Real Cosmetics E-Commerce Dataset** (`data/real_cosmetics_ecommerce.csv`) | Core transaction analytics, recommendations, Apriori, RFM, OLAP & decision tree | ~8,164 records, 2,012 customers, 2,217 orders |

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run Flask application
python app.py
```

Dashboard is served at `http://127.0.0.1:5000`.

---

## 🧪 Testing

```bash
python -m unittest test_app.py
```
