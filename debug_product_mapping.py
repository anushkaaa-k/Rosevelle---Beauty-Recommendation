import os
import json
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "data", "real_cosmetics_ecommerce.csv")
IMG_DIR = os.path.join(BASE_DIR, "static", "images", "products")

df = pd.read_csv(CSV_PATH)

print("==================================================")
print("PRODUCT MAPPING DIAGNOSTIC REPORT")
print("==================================================")
print(f"Total Dataset Rows: {len(df)}")

unique_product_names = df["Product Name"].drop_duplicates().tolist()
print(f"Total Unique Product Names: {len(unique_product_names)}")

skus_exist = "sku" in df.columns
if skus_exist:
    unique_skus = df["sku"].drop_duplicates().tolist()
    print(f"Total Unique SKUs: {len(unique_skus)}")

print("\n--- FIRST UNIQUE PRODUCTS IN DATASET (ORDER OF APPEARANCE) ---")
# Build unique products by Product Name first
unique_products_by_name = []
for p in unique_product_names:
    sub = df[df["Product Name"] == p]
    count = len(sub)
    first_sku = sub["sku"].iloc[0] if skus_exist and not pd.isna(sub["sku"].iloc[0]) else "N/A"
    unique_products_by_name.append({
        "product_name": p,
        "sku": first_sku,
        "row_count": count
    })

print(f"First 10 Unique Product Names:")
for i, item in enumerate(unique_products_by_name[:10], 1):
    print(f" #{i}: Name='{item['product_name']}', First SKU='{item['sku']}', Transaction Rows={item['row_count']}")

# Check images in IMG_DIR
files_in_img_dir = os.listdir(IMG_DIR) if os.path.exists(IMG_DIR) else []
jpg_files = [f for f in files_in_img_dir if f.endswith(".jpg")]
print(f"\nJPG files found in static/images/products: {len(jpg_files)}")

# Check mapping by exact Product Name vs sanitized name
mapped_count = 0
missing_images = []
for p in unique_product_names:
    clean = p.replace(" ", "_").replace("&", "_").replace("-", "_")
    # Sanitize re pattern
    import re
    sanitized = re.sub(r'[^a-zA-Z0-9]', '_', p)
    sanitized = re.sub(r'_+', '_', sanitized).strip('_')
    
    jpg_name = f"{sanitized}.jpg"
    jpg_path = os.path.join(IMG_DIR, jpg_name)
    
    if os.path.exists(jpg_path) and os.path.getsize(jpg_path) > 1000:
        mapped_count += 1
    else:
        missing_images.append(p)

print(f"\nExact Product Name Image Mapping Status:")
print(f" - Total Unique Products: {len(unique_product_names)}")
print(f" - Successfully Mapped Images: {mapped_count} / {len(unique_product_names)}")
print(f" - Products with Missing Images: {len(missing_images)}")
if missing_images:
    print(f" Missing Products List: {missing_images}")
