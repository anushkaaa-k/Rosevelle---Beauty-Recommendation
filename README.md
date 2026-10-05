# ROSEVELLE — Amazon Reviews 2023 & E-Commerce Recommendation Analytics Engine

**Project Type**: Full-Stack Web Application & Data Analytics Engine  
**Tech Stack**: Python Flask REST Backend, Pandas, Scikit-Learn, Vanilla JavaScript (ES6+), Modern CSS3 Luxury Theme, Chart.js  

---

## 📌 Project Overview

**ROSEVELLE** is a modern recommendation and e-commerce analytics web application designed around the official **Amazon Reviews 2023 (`All_Beauty`)** dataset. It demonstrates real collaborative filtering, matrix factorization, and content-based recommendation algorithms evaluated on actual Amazon review records, alongside a separate, clearly labelled synthetic cosmetics order dataset for Market Basket Analysis (Apriori), Customer RFM Segmentation (K-Means), and Multidimensional Sales OLAP Cubes.

---

## 📊 Dataset Architecture & Implementation Specifications

### 1. Primary Real-World Recommendation Dataset
- **Source**: Official Amazon Reviews 2023 dataset (*McAuley Lab, UCSD / Julian McAuley et al., 2023*).
- **Category**: `All_Beauty` (Cosmetics, Skincare, Haircare, Beauty Products).
- **Subset Strategy**: To prevent high memory overhead during local development, a manageable, reproducible subset is sampled while strictly preserving schema fidelity, stable identifiers (`user_id`, `parent_asin`), ratings, timestamps, product titles, prices, descriptions, and feature lists.

#### Official Schemas:
- **Review Schema (`reviews_subset.json`)**:
  - `user_id`: Stable anonymized customer identifier (e.g., `"AGY_USER_101"`)
  - `parent_asin`: Stable product item identifier (e.g., `"B000143526"`)
  - `rating`: Customer star evaluation rating float (`1.0` to `5.0`)
  - `title`: Review summary headline text
  - `text`: Full review body content
  - `timestamp`: Review creation timestamp (Unix epoch milliseconds)
  - `helpful_vote`: Upvote count from Amazon community
  - `verified_purchase`: Boolean flag (`True` / `False`)

- **Product Metadata Schema (`metadata_subset.json`)**:
  - `parent_asin`: Stable item identifier matching reviews
  - `title`: Full product title string (e.g., *"CeraVe Hydrating Facial Cleanser"*)
  - `main_category`: Product category (`"All Beauty"`)
  - `store`: Brand store name (e.g., *"CeraVe"*, *"The Ordinary"*, *"La Roche-Posay"*)
  - `price`: Retail catalog price string / float ($USD)
  - `average_rating`: Aggregate customer rating score
  - `rating_number`: Total review count
  - `categories`: Taxonomy category list `["Beauty & Personal Care", "Skin Care", ...]`
  - `features`: Key bullet points list
  - `description`: Product narrative description list
  - `details`: Dict of structured product attributes (Item Form, Skin Type, Volume)

---

### 2. Synthetic Cosmetics Order Dataset
- **Label & Badge**: `[SYNTHETIC-ORDER-DATASET]` / `Synthetic Cosmetics Basket Orders`
- **Purpose**: Market Basket Analysis (Apriori), Customer RFM Segmentation, and Multidimensional Sales OLAP Cubes.
- **Explicit Disclaimer**: Review records contain zero checkout basket history and represent individual post-purchase feedback. Synthetic transactions simulate multi-item shopping checkout baskets (`order_id`, `customer_id`, `order_timestamp`, `channel`, `store_location`, `items`, `total_amount`) to enable association rule mining without making false claims about review data.
- **Distinguishability**: Real and synthetic datasets are clearly labelled with explicit visual badges and banners throughout the UI, backend REST APIs, code comments, and documentation.

---

## ⚡ Algorithm Implementations & Analytics Engines

### 1. Recommendation Engines (Real Amazon Data)
- **User-Based Collaborative Filtering**: Computes cosine similarity across user rating vectors to predict unrated item scores.
- **Item-Based Collaborative Filtering**: Computes item-item rating similarity matrix.
- **Matrix Factorization (Truncated SVD)**: Decomposes User-Item matrix into latent factor components ($R \approx U \cdot \Sigma \cdot V^T$).
- **Content-Based Filtering (TF-IDF)**: Builds term frequency-inverse document frequency vectors from product titles, features, stores, and descriptions to compute cosine similarity against user preference profiles.
- **Hybrid Recommender**: Blends SVD rating predictions and TF-IDF content similarity scores:
  $$\text{Blended Score} = 0.6 \cdot \text{Score}_{\text{SVD}} + 0.4 \cdot \text{Score}_{\text{TF-IDF}}$$

### 2. Empirical Evaluation Metrics
Empirically computed on an 80/20 train/test split of actual selected Amazon data:
- **Root Mean Squared Error (RMSE)**: $\sqrt{\frac{1}{N}\sum (y_i - \hat{y}_i)^2}$
- **Mean Absolute Error (MAE)**: $\frac{1}{N}\sum |y_i - \hat{y}_i|$
- **Precision@K & Recall@K**: Fraction of top-$K$ recommended items relevant to test preferences.
- **Mean Average Precision (MAP@K)** & **NDCG@K**: Discounted ranking order performance metrics.
- **Catalog Coverage**: Percentage of total catalog items recommended across users.

### 3. Apriori Market Basket Analysis (Synthetic Orders)
- **Frequent Itemset Generation**: Mines 1-itemsets and 2-itemsets meeting `min_support`.
- **Association Rule Derivation**: Calculates Support, Confidence, Lift, and Conviction:
  $$\text{Support}(A \rightarrow B) = P(A \cup B)$$
  $$\text{Confidence}(A \rightarrow B) = \frac{P(A \cup B)}{P(A)}$$
  $$\text{Lift}(A \rightarrow B) = \frac{P(A \cup B)}{P(A) \cdot P(B)}$$

### 4. Customer RFM Segmentation & K-Means
- **RFM Analysis**: Scores Recency (days since purchase), Frequency (order count), and Monetary value (total spend).
- **K-Means Clustering**: Clusters standardized RFM vectors ($K=3, 4, 5$) and evaluates cluster separation via Silhouette Score.

### 5. Sales OLAP Multidimensional Cubes
- **Dimensions**: Time (Quarter/Month), Category/Brand, Sales Channel, Store Location.
- **Operations**: Slice, Dice, Roll-up, Drill-down, and Channel vs Quarter Revenue Pivot Tables.

---

## 🛠️ Installation & Execution Guide

### Prerequisites
- Python 3.8+ installed on system.

### Steps to Run Locally

1. **Navigate to project folder**:
   ```bash
   cd C:\Users\hp\.gemini\antigravity\scratch\beauty_recommender
   ```

2. **Initialize / Generate Datasets**:
   ```bash
   python data_loader.py
   ```

3. **Run Unit & Integration Test Suite**:
   ```bash
   python test_app.py
   ```

4. **Start Flask Web Server**:
   ```bash
   python app.py
   ```

5. **Open Web Application**:
   Navigate browser to: `http://127.0.0.1:5000`

---

## 📡 API Reference & Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `GET /` | GET | Serves Single Page Application dashboard |
| `GET /api/health` | GET | System health & dataset readiness check |
| `GET /api/dataset-explorer` | GET | Schema metadata, field definitions, and statistics |
| `GET /api/dataset-records` | GET | Paginated record browser with search filter |
| `POST /api/recommend` | POST | Generates personal recommendations for selected algorithm |
| `GET /api/evaluation-metrics` | GET | Calculated empirical metrics (RMSE, MAE, Precision@K, NDCG@K) |
| `GET /api/apriori-rules` | GET | Mined association rules from synthetic order baskets |
| `GET /api/rfm-clusters` | GET | Customer RFM K-Means cluster profiles |
| `GET /api/sales-olap` | GET | Multidimensional sales aggregation & pivot matrices |

---

## 📁 Directory Structure

```
beauty_recommender/
├── app.py                  # Flask web server & REST API endpoints
├── data_loader.py          # Dataset sampler, schema inspector, and synthetic order generator
├── algorithms.py           # Recommender engines, metrics computation, Apriori, RFM, OLAP
├── test_app.py             # Unit and integration test suite (9 tests passing)
├── requirements.txt        # Python dependency manifest
├── README.md               # Complete project documentation & schema specifications
├── data/
│   ├── real_amazon_all_beauty/
│   │   ├── reviews_subset.json    # Real Amazon Reviews subset
│   │   └── metadata_subset.json   # Real Amazon Product Metadata subset
│   └── synthetic_cosmetics_orders/
│       └── orders_subset.json     # Synthetic cosmetics basket transactions
├── static/
│   ├── css/
│   │   └── style.css       # Modern Glassmorphic SaaS dark/light theme
│   └── js/
│       ├── api.js          # REST API client wrapper
│       ├── charts.js       # Chart.js visualization module
│       └── app.js          # Main SPA controller module
└── templates/
    └── index.html          # SPA dashboard HTML5 template
```

---

## 🎓 DAA & Viva Q&A Guide

1. **Why keep real reviews and synthetic transactions distinct?**  
   *Answer*: Amazon review records represent individual user ratings given post-purchase without basket checkout information. Generating association rules on individual reviews would produce false co-purchase insights. Therefore, real reviews are used for recommendations, while synthetic transaction baskets are used for Apriori market basket analysis.

2. **How does Matrix Factorization SVD work?**  
   *Answer*: Truncated SVD factorizes the user-item rating matrix $R \approx U \Sigma V^T$ to discover latent feature dimensions, overcoming sparsity issues in recommendation systems.

3. **How is NDCG@K calculated?**  
   *Answer*: NDCG@K normalizes DCG@K by the Ideal DCG@K, discounting hits at lower recommendation ranks using a logarithmic decay function:
   $$\text{DCG}@K = \sum_{i=1}^K \frac{r_i}{\log_2(i+1)}$$
