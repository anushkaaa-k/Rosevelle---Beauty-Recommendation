import os
import json
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "data", "real_cosmetics_ecommerce.csv")
REAL_DATA_DIR = os.path.join(BASE_DIR, "data", "real_amazon_all_beauty")
METADATA_PATH = os.path.join(REAL_DATA_DIR, "metadata_subset.json")

df = pd.read_csv(CSV_PATH)
print("Columns:", list(df.columns))
print(f"Unique 'Product Name' count: {df['Product Name'].nunique()}")
print(f"Unique 'sku' count: {df['sku'].nunique() if 'sku' in df.columns else 'None'}")
print(f"Unique 'Variant Name' count: {df['Variant Name'].nunique() if 'Variant Name' in df.columns else 'None'}")

if 'Variant Name' in df.columns:
    df['product_id_variant'] = df['Product Name'].astype(str) + " - " + df['Variant Name'].astype(str)
    print(f"Unique (Product Name + Variant Name) count: {df['product_id_variant'].nunique()}")

if 'sku' in df.columns:
    print(f"Unique (Product Name + sku) count: {df.groupby(['Product Name', 'sku']).ngroups}")

# List first 100 unique product keys in order of occurrence in dataset
first_100_by_sku = list(df['sku'].drop_duplicates().head(100))
print(f"First 100 SKUs count: {len(first_100_by_sku)}")
first_100_by_name = list(df['Product Name'].drop_duplicates().head(100))
print(f"First 100 Product Names count: {len(first_100_by_name)}")

