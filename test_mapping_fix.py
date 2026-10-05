import os
import re
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "data", "real_cosmetics_ecommerce.csv")
IMG_DIR = os.path.join(BASE_DIR, "static", "images", "products")

df = pd.read_csv(CSV_PATH)

def sanitize(text):
    clean = re.sub(r'[^a-zA-Z0-9]', '_', str(text))
    return re.sub(r'_+', '_', clean).strip('_')

# Target first 100 unique product keys in order of appearance
unique_keys = []
seen = set()
for _, r in df.iterrows():
    p_name = str(r["Product Name"]).strip()
    sku = str(r.get("sku", "")).strip() if "sku" in df.columns else ""
    key = sku if sku and sku != "nan" else p_name
    if key not in seen:
        seen.add(key)
        unique_keys.append(key)

target_first_100 = set(unique_keys[:100])
target_first_100_names = set(df[df["sku"].isin(target_first_100)]["Product Name"].unique())

print(f"Target first 100 SKUs count: {len(target_first_100)}")
print(f"Target Product Names covered by first 100 SKUs: {len(target_first_100_names)}")

def resolve_image(p_name, sku):
    clean_p = sanitize(p_name)
    clean_s = sanitize(sku) if sku else ""
    
    # Check if SKU is in first 100 or Product Name is in target
    if (sku and sku in target_first_100) or (p_name in target_first_100_names):
        # 1. Check product name JPG
        path_p = os.path.join(IMG_DIR, f"{clean_p}.jpg")
        if os.path.exists(path_p) and os.path.getsize(path_p) > 1000:
            return f"/static/images/products/{clean_p}.jpg"
            
        # 2. Check SKU JPG
        if clean_s:
            path_s = os.path.join(IMG_DIR, f"{clean_s}.jpg")
            if os.path.exists(path_s) and os.path.getsize(path_s) > 1000:
                return f"/static/images/products/{clean_s}.jpg"
                
    return ""

df["image_url"] = df.apply(lambda r: resolve_image(r["Product Name"], r.get("sku", "")), axis=1)

mapped_rows = len(df[df["image_url"] != ""])
unmapped_rows = len(df[df["image_url"] == ""])

print(f"\nRESULTS:")
print(f" - Total dataset records: {len(df)}")
print(f" - Transaction rows with product photograph: {mapped_rows} / {len(df)} ({mapped_rows/len(df)*100:.1f}%)")
print(f" - Transaction rows with 'Image unavailable': {unmapped_rows} / {len(df)}")

print("\nSample Rows:")
for idx, r in df.head(10).iterrows():
    print(f" Row #{idx+1}: Product='{r['Product Name']}', SKU='{r.get('sku','')}' -> image_url='{r['image_url']}'")
