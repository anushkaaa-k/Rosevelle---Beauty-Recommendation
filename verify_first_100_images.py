import os
import json
import pandas as pd
from data_loader import load_and_clean_cosmetics_df, get_dataset_summary

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "data", "real_cosmetics_ecommerce.csv")
MAPPING_PATH = os.path.join(BASE_DIR, "data", "first_100_products_mapping.json")

print("=======================================================")
print("[*] VERIFYING FIRST 100 UNIQUE PRODUCTS IMAGE MAPPING")
print("=======================================================")

# 1. Check mapping file
with open(MAPPING_PATH, "r", encoding="utf-8") as f:
    mapping_100 = json.load(f)

assert len(mapping_100) == 100, f"Expected 100 items in mapping, got {len(mapping_100)}"
print(f"[OK] first_100_products_mapping.json contains exactly {len(mapping_100)} unique products.")

first_100_keys = set([item["key"] for item in mapping_100] + [item["sku"] for item in mapping_100 if item.get("sku")])

# 2. Check loaded dataset
df = load_and_clean_cosmetics_df()
print(f"[OK] Loaded dataset records count: {len(df)} (Must be 8,164)")
assert len(df) == 8164, f"Record count changed! Expected 8164, got {len(df)}"

# 3. Analyze image URL distribution across unique products
df["product_key"] = df.apply(lambda r: str(r.get("sku", "")).strip() if str(r.get("sku", "")).strip() and str(r.get("sku", "")).strip() != "nan" else f"{r.get('Product Name', '')}_{r.get('Variant Name', '')}", axis=1)

grouped = df.groupby("product_key").agg({
    "image_url": "first",
    "Product Name": "first",
    "Variant Name": "first"
}).reset_index()

with_images = grouped[grouped["image_url"].astype(str).str.len() > 0]
without_images = grouped[grouped["image_url"].astype(str).str.len() == 0]

print(f"[OK] Total unique product items in dataset: {len(grouped)}")
print(f"[OK] Unique products WITH assigned image URLs: {len(with_images)}")
print(f"[OK] Unique products WITHOUT image URLs (display 'Image unavailable'): {len(without_images)}")

assert len(with_images) == 100, f"Expected exactly 100 unique products with images, got {len(with_images)}"
assert len(without_images) == (len(grouped) - 100), f"Expected {len(grouped) - 100} products without images, got {len(without_images)}"

# 4. Verify local image files existence
for idx, row in with_images.iterrows():
    rel_path = row["image_url"].lstrip('/')
    full_path = os.path.join(BASE_DIR, rel_path)
    assert os.path.exists(full_path), f"Missing image file at: {full_path}"
    assert os.path.getsize(full_path) > 1000, f"Image file empty at: {full_path}"

print(f"[OK] Verified all 100 image files exist on disk and are valid JPG photographs.")

# 5. Check dataset summary statistics
summary = get_dataset_summary()
stats = summary["real_cosmetics_dataset"]
print(f"[OK] Dataset summary badge: '{stats['dataset_badge']}'")
print(f"[OK] Product images available statistic: {stats['product_images_available']}")
assert stats['product_images_available'] == 100, "product_images_available in summary is not 100"

print("\n=======================================================")
print("[SUCCESS] ALL FIRST 100 UNIQUE PRODUCT MAPPINGS VERIFIED!")
print("=======================================================")
