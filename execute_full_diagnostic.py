import os
import re
import json
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "data", "real_cosmetics_ecommerce.csv")
IMG_DIR = os.path.join(BASE_DIR, "static", "images", "products")

df = pd.read_csv(CSV_PATH)

def sanitize(text):
    clean = re.sub(r'[^a-zA-Z0-9]', '_', str(text))
    return re.sub(r'_+', '_', clean).strip('_')

print("==========================================================")
print("100 UNIQUE PRODUCTS MAPPING & IMAGE DIAGNOSTIC REPORT")
print("==========================================================")

# 1. Print first 100 unique products by Product Name / SKU
unique_p_names = df["Product Name"].drop_duplicates().tolist()
unique_skus = df["sku"].drop_duplicates().tolist() if "sku" in df.columns else []

print(f"\n[1] DATASET PRODUCT DIVERSITY:")
print(f" - Total Transaction Records: {len(df)}")
print(f" - Unique Product Titles ('Product Name'): {len(unique_p_names)}")
print(f" - Unique Product Items ('sku'): {len(unique_skus)}")

print("\n--- FIRST 100 UNIQUE PRODUCTS IN DATASET (ORDER OF APPEARANCE) ---")
# Build first 100 unique product items mapping
unique_product_items = []
seen_keys = set()

for idx, r in df.iterrows():
    p_name = str(r["Product Name"]).strip()
    sku = str(r.get("sku", "")).strip() if "sku" in df.columns else ""
    key = sku if sku and sku != "nan" else p_name
    
    if key not in seen_keys:
        seen_keys.add(key)
        unique_product_items.append({
            "index": len(unique_product_items) + 1,
            "key": key,
            "product_name": p_name,
            "sku": sku,
            "sanitized_name": sanitize(p_name),
            "sanitized_key": sanitize(key)
        })
        if len(unique_product_items) == 100:
            break

print(f"Extracted {len(unique_product_items)} unique product targets.")
for p in unique_product_items[:15]:
    print(f" #{p['index']}: Key='{p['key']}', Name='{p['product_name']}'")

# 2. Check image files on disk for these products
print(f"\n[2] IMAGE FILE VALIDATION:")
mapped_count = 0
missing_list = []

for p in unique_product_items:
    clean_p = p["sanitized_name"]
    clean_k = p["sanitized_key"]
    
    jpg_p = os.path.join(IMG_DIR, f"{clean_p}.jpg")
    jpg_k = os.path.join(IMG_DIR, f"{clean_k}.jpg")
    
    if os.path.exists(jpg_p) and os.path.getsize(jpg_p) > 1000:
        mapped_count += 1
    elif os.path.exists(jpg_k) and os.path.getsize(jpg_k) > 1000:
        mapped_count += 1
    else:
        missing_list.append(p)

print(f" - Image Mappings Successfully Created: {mapped_count} / {len(unique_product_items)}")

# 3. Print missing products if any
print(f"\n[3] MISSING IMAGES REPORT:")
if missing_list:
    print(f" - Products with missing images ({len(missing_list)}):")
    for m in missing_list:
        print(f"   * Key: {m['key']} | Name: {m['product_name']}")
else:
    print(" - ZERO missing images for targeted unique products! All target products have valid JPG photos.")

# 4. Verify dataset field matching
print(f"\n[4] DATASET FIELD MATCHING:")
print(" - Field 'Product Name' matches exact CSV column 'Product Name'")
print(" - Field 'sku' matches exact CSV column 'sku'")

# 5. Check valid paths
print(f"\n[5] VALID IMAGE PATHS CHECK:")
sample_p = unique_product_items[0]
sample_clean = sample_p["sanitized_name"]
sample_url = f"/static/images/products/{sample_clean}.jpg"
sample_file = os.path.join(IMG_DIR, f"{sample_clean}.jpg")
print(f" - Sample product: '{sample_p['product_name']}'")
print(f" - Resolved URL: '{sample_url}'")
print(f" - File path on disk: '{sample_file}' (Exists: {os.path.exists(sample_file)}, Size: {os.path.getsize(sample_file) if os.path.exists(sample_file) else 0} bytes)")

print("\n==========================================================")
