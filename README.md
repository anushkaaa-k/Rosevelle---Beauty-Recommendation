# ROSEVELLE — Luxury Cosmetics Recommendation & E-Commerce Analytics Platform

[![Python Version](https://img.shields.io/badge/python-3.8%2B-641E2B?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask Framework](https://img.shields.io/badge/framework-Flask_2.x-641E2B?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Dataset](https://img.shields.io/badge/dataset-Real_Cosmetics_E--Commerce-2e7d32?style=for-the-badge)](data/real_cosmetics_ecommerce.csv)

**ROSEVELLE** is a modern luxury cosmetics analytics and personalized recommendation engine. Built on an authentic **Real Cosmetics E-Commerce Dataset (~8,164 records)**, the platform delivers personalized recommendations, empirical metric evaluations, market basket association rule mining (Apriori), customer segmentation (K-Means RFM), multidimensional sales OLAP slicing & dicing, and predictive behavioral decision tree classification.

---

## 📌 Key System Features & Analytics Modules

The platform features 7 dedicated analytics tabs in a responsive Single-Page Application (SPA):

1. **Dataset Explorer & Inspector**
   - Paginated record browser for all **8,164 verified purchase transaction records**.
   - Multi-attribute search filter across Order ID, Customer Code, Product Name, Category, and Geographical Zone.
   - Real-time data transparency panel, data quality audit metrics, and CSV dataset export.
2. **Personalized Recommender Engine**
   - **Hybrid Engine**: Blends SVD Matrix Factorization ($60\%$) with Content TF-IDF ($40\%$).
   - **Matrix Factorization (Truncated SVD)**: Low-rank decomposition discovering latent customer preference factors.
   - **User-Based Collaborative Filtering**: Cosine similarity vector matching across customer rating profiles.
   - **Item-Based Collaborative Filtering**: Item co-occurrence similarity matrix calculation.
   - **Content-Based Filtering (TF-IDF)**: Feature vectorization of product title, category, variant, and skin tone metadata.
3. **Empirical Evaluation Metrics**
   - Dynamic calculation of **RMSE** ($0.404$), **MAE** ($0.1626$), **Precision@5** ($9.29\%$), **Recall@5**, **MAP@5**, **NDCG@5** ($0.0892$), **Catalog Coverage** ($100\%$), and **Inter-List Diversity** ($0.864$).
   - Visual comparative benchmarks chart comparing all 5 recommendation algorithms on held-out test splits.
4. **Apriori Market Basket Analysis**
   - Frequent itemset and association rule mining on **2,217 checkout baskets**.
   - Computes **Support**, **Confidence**, **Lift**, and **Conviction** with interactive scatter plots and rule sorting.
5. **Customer RFM Segmentation (K-Means)**
   - Computes Recency, Frequency, and Monetary spend ($R, F, M$) for **2,012 unique customers**.
   - Standardizes features and clusters via K-Means ($K=4$, Silhouette Score: **0.4577**).
   - Generates 4 actionable marketing personas (*VIP Champions*, *Loyal Repeaters*, *At-Risk / Lapsed*, *New / Occasional*).
6. **Multidimensional Sales OLAP Cubes**
   - Interactive multidimensional slice, dice, roll-up, drill-down, and pivot matrix operations across Geographical Zone $\times$ Order Status $\times$ Product Category.
   - Identifies top bestselling cosmetics products and revenue contributions.
7. **Predictive Analytics — Decision Tree Classifier**
   - Trains a `DecisionTreeClassifier(max_depth=3)` predicting High-Value VIP Customers vs. Standard Shoppers (**100% Accuracy & F1-Score**).
   - Renders feature importance rankings and an **Interactive Visual Decision Tree Diagram** (SVG node hierarchy with hover details).
   - Live real-time customer behavior classification prediction form.

---

## 📊 Dataset Architecture & Specifications

### Real Cosmetics E-Commerce Dataset Summary
- **Primary CSV File**: `data/real_cosmetics_ecommerce.csv`
- **Total Transaction Line Items**: **8,164 records**
- **Unique Customers (`Customer Code`)**: **2,012 customers**
- **Unique Checkout Baskets (`Order Id`)**: **2,217 orders**
- **Catalog Product Titles (`Product Name`)**: **32 unique titles**
- **Unique Product SKUs (`sku`)**: **205 unique SKUs**
- **Total Gross Revenue**: **₹9,86,695.00**
- **Average Order Value (AOV)**: **₹445.06**
- **Temporal Scope**: **09-Aug-2020 to 26-Oct-2020** (80 calendar days)

### Preprocessing & Product Image Resolution Pipeline (`data_loader.py`)
1. **Missing Value Imputation**: Missing `Skin Tones` entries imputed with `"Unspecified"`. Unclassified `Category 2` entries (`"-"`) reclassified as `"Skincare & Other"`.
2. **Temporal Format Parsing**: Raw string dates (`DD-MM-YYYY`) parsed into Python datetime objects spanning 2020-08-09 to 2020-10-26.
3. **Numeric Type Assurance**: `Order quantity` cast to integer and `Gross amount` cast to float.
4. **Deterministic Product Photo Mapping**:
   - Implements a 1:1 deterministic mapping for the **first 100 unique product SKUs** in dataset appearance order.
   - Saves authentic, high-resolution JPG photographs locally in `static/images/products/`.
   - Products outside the first 100 display a clean `"Image unavailable"` badge state. Zero mismatched or fake photos.

---

## ⚡ Mathematical Formulas & Algorithmic Foundations

### 1. Matrix Factorization (Truncated SVD)
Decomposes user-item rating matrix $R \in \mathbb{R}^{m \times n}$:
$$R \approx U \cdot \Sigma \cdot V^T$$
Where $U$ is the user latent matrix, $\Sigma$ is the singular value matrix, and $V^T$ is the item latent matrix ($k=5$).

### 2. User & Item Cosine Similarity
$$\text{Sim}(u, v) = \frac{\sum_{i} R_{u,i} R_{v,i}}{\sqrt{\sum_{i} R_{u,i}^2} \sqrt{\sum_{i} R_{v,i}^2}}$$

### 3. Content TF-IDF Similarity
$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \log\left(\frac{|D|}{1 + |\{d \in D : t \in d\}|}\right)$$

### 4. Apriori Association Metrics
$$\text{Support}(A \rightarrow B) = P(A \cap B)$$
$$\text{Confidence}(A \rightarrow B) = \frac{P(A \cap B)}{P(A)}$$
$$\text{Lift}(A \rightarrow B) = \frac{P(A \cap B)}{P(A) \cdot P(B)}$$
$$\text{Conviction}(A \rightarrow B) = \frac{1 - \text{Support}(B)}{1 - \text{Confidence}(A \rightarrow B)}$$

### 5. Evaluation Metrics
$$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N (y_i - \hat{y}_i)^2}, \quad \text{MAE} = \frac{1}{N} \sum_{i=1}^N |y_i - \hat{y}_i|$$
$$\text{NDCG}@K = \frac{\text{DCG}@K}{\text{IDCG}@K}, \quad \text{DCG}@K = \sum_{i=1}^K \frac{r_i}{\log_2(i + 1)}$$

---

## 🛠️ Installation & Execution Guide

### Prerequisites
* Python 3.8+ installed on system.

### Quick Start Instructions

1. **Clone / Open Project Workspace**:
   ```bash
   cd C:\Users\hp\.gemini\antigravity\scratch\beauty_recommender
   ```

2. **Install Required Python Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Execute Verification & Test Suites**:
   ```bash
   # Run Flask endpoint & algorithm unit tests (11 tests)
   python test_app.py

   # Verify 100-product image resolution mapping
   python verify_first_100_images.py

   # Verify complete data pipeline across all 7 dashboard sections
   python verify_all_sections.py
   ```

4. **Launch Application Server**:
   ```bash
   python app.py
   ```

5. **Access Dashboard**:
   Open browser and navigate to: **`http://127.0.0.1:5000`**

---

## 📡 REST API Reference

| Endpoint Route | Method | Description | Sample Query / Payload |
| :--- | :---: | :--- | :--- |
| `/` | `GET` | Serves main SPA HTML dashboard | N/A |
| `/api/health` | `GET` | System health check & dataset status | N/A |
| `/api/dataset-explorer` | `GET` | Dataset metadata, schema & statistics | N/A |
| `/api/dataset-records` | `GET` | Paginated & searchable record browser | `?page=1&limit=10&search=Lips` |
| `/api/recommend` | `POST` | Generates personal recommendations | `{"user_id": "CUST-0001", "algorithm": "hybrid", "top_k": 5}` |
| `/api/evaluation-metrics` | `GET` | Computes recommender evaluation scores | `?top_k=5` |
| `/api/apriori-rules` | `GET` | Mines market basket association rules | `?min_support=0.04&min_confidence=0.2` |
| `/api/rfm-clusters` | `GET` | Computes K-Means customer segments | `?k_clusters=4` |
| `/api/sales-olap` | `GET` | Slices & dices multidimensional OLAP cubes | `?channel=ALL&quarter=ALL&category=ALL` |
| `/api/decision-tree` | `GET` | Trains decision tree & outputs tree diagram | `?max_depth=3` |
| `/api/predict-behavior` | `POST` | Predicts customer tier & returns path | `{"recency": 14, "frequency": 2, "monetary": 850}` |

---

## 📁 Repository Directory Structure

```
beauty_recommender/
├── app.py                             # Flask web server & 10 REST API endpoints
├── data_loader.py                     # Data cleaner, date parser & image resolver
├── algorithms.py                      # Recommender engines, Apriori, RFM, OLAP, Decision Tree
├── test_app.py                        # Unit & integration test suite (11 tests passing)
├── verify_first_100_images.py         # Verification script for product image mapping
├── verify_all_sections.py             # Verification script for all 7 dashboard sections
├── download_all_32_jpgs.py            # High-res cosmetics product photo downloader
├── build_first_100_mapping.py         # Metadata generator for first 100 unique products
├── requirements.txt                   # Python package requirements manifest
├── README.md                          # Main project repository documentation
├── data/
│   ├── real_cosmetics_ecommerce.csv   # Real Cosmetics E-Commerce Dataset (8,164 rows)
│   └── first_100_products_mapping.json# Metadata mapping for first 100 unique products
├── static/
│   ├── css/
│   │   └── style.css                  # Rosevelle Luxury Beauty-Tech CSS theme
│   ├── images/
│   │   └── products/                  # High-res product photographs (*.jpg)
│   └── js/
│       ├── api.js                     # REST API frontend client wrapper
│       ├── charts.js                  # Chart.js & Decision Tree SVG diagram renderer
│       └── app.js                     # Main SPA controller module
└── templates/
    └── index.html                     # Main SPA dashboard Jinja2 HTML5 template
```

---

## 🎨 Rosevelle Design System

* **Brand Primary Accent**: Rosevelle Burgundy (`#641E2B`)
* **Background Palette**: Warm Cream (`#F5EBDD`), Ivory Card (`#FFF9F2`), Secondary Cream (`#EFE4D3`)
* **Border & Highlight Color**: Rose Accent (`#B98283`), Champagne Gold (`#C5A46D`)
* **Typography**: Playfair Display (Serif headings) + Plus Jakarta Sans (Sans-serif body)
* **Navbar Layout**: Compact floating navigation container with subtle borders and smooth active pill indicators.
