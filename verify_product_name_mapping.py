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

print("==================================================")
print("PRODUCT NAME & SKU MAPPING VERIFICATION")
print("==================================================")

# 1. Extract first 100 unique SKUs/Product Keys in appearance order
unique_skus_in_order = []
seen_skus = set()
for _, r in df.iterrows():
    sku = str(r.get("sku", "")).strip()
    p_name = str(r.get("Product Name", "")).strip()
    key = sku if sku and sku != "nan" else p_name
    if key not in seen_skus:
        seen_skus.add(key)
        unique_skus_in_order.append(key)

first_100_skus = set(unique_skus_in_order[:100])
print(f"Total Unique Product SKUs/Keys in dataset: {len(unique_skus_in_order)}")
print(f"First 100 Unique Product SKUs targeted: {len(first_100_skus)}")

# 2. Extract all 32 Unique Product Names
unique_product_names = df["Product Name"].drop_duplicates().tolist()
print(f"Total Unique Product Names: {len(unique_product_names)}")

# 3. Test resolution function
def resolve_image(p_name, sku):
    clean_p = sanitize(p_name)
    clean_sku = sanitize(sku) if sku else ""
    
    # Priority 1: Check by Product Name JPG
    jpg_p_path = os.path.join(IMG_DIR, f"{clean_p}.jpg")
    if os.path.exists(jpg_p_path) and os.path.getsize(jpg_p_path) > 1000:
        return f"/static/images/products/{clean_p}.jpg"
        
    # Priority 2: Check by SKU JPG (if in first 100)
    if sku in first_100_skus or clean_sku in first_100_skus:
        jpg_sku_path = os.path.join(IMG_DIR, f"{clean_sku}.jpg")
        if os.path.exists(jpg_sku_path) and os.path.getsize(jpg_sku_path) > 1000:
            return f"/static/images/products/{clean_sku}.jpg"
            
    return ""

df["resolved_img"] = df.apply(lambda r: resolve_image(r["Product Name"], r.get("sku", "")), axis=1)

rows_with_img = len(df[df["resolved_img"] != ""])
rows_without_img = len(df[df["resolved_img"] == ""])

print(f"\nTransaction Rows Results:")
print(f" - Total Transaction Rows: {len(df)}")
print(f" - Rows WITH product photograph: {rows_with_img} / {len(df)} ({rows_with_img/len(df)*100:.1f}%)")
print(f" - Rows WITH 'Image unavailable': {rows_without_img} / {len(df)}")

print("\nBreakdown by Unique Product Name:")
for p in unique_product_names:
    sub = df[df["Product Name"] == p]
    img = sub["resolved_img"].iloc[0]
    has_img = "YES (" + img + ")" if img else "NO (Image unavailable)"
    print(f" - '{p}': {len(sub)} rows -> {has_img}")
