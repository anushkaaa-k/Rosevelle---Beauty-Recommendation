import os
import re
import json
import pandas as pd
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "data", "real_cosmetics_ecommerce.csv")
IMG_DIR = os.path.join(BASE_DIR, "static", "images", "products")
os.makedirs(IMG_DIR, exist_ok=True)

df = pd.read_csv(CSV_PATH)

def sanitize(text):
    clean = re.sub(r'[^a-zA-Z0-9]', '_', str(text))
    return re.sub(r'_+', '_', clean).strip('_')

# Track unique products in order of appearance
first_100_unique = []
seen_skus = set()

for _, row in df.iterrows():
    sku = str(row.get("sku", "")).strip()
    p_name = str(row.get("Product Name", "")).strip()
    var_name = str(row.get("Variant Name", "")).strip()
    cat = str(row.get("Category 2", "")).strip()
    
    key = sku if sku and sku != "nan" else f"{p_name}_{var_name}"
    
    if key not in seen_skus:
        seen_skus.add(key)
        first_100_unique.append({
            "key": key,
            "sku": sku,
            "product_name": p_name,
            "variant_name": var_name,
            "category": cat,
            "sanitized": sanitize(key),
            "sanitized_name": sanitize(p_name)
        })
        if len(first_100_unique) == 100:
            break

print(f"Total unique products found: {len(seen_skus)}")
print(f"First 100 unique products extracted: {len(first_100_unique)}")

# Save mapping metadata JSON
mapping_file = os.path.join(BASE_DIR, "data", "first_100_products_mapping.json")
with open(mapping_file, "w", encoding="utf-8") as f:
    json.dump(first_100_unique, f, indent=2)

print(f"Saved mapping metadata to {mapping_file}")
