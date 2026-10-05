import os
import json
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
mapping_file = os.path.join(BASE_DIR, "data", "first_100_products_mapping.json")

with open(mapping_file, "r", encoding="utf-8") as f:
    items = json.load(f)

df = pd.read_csv(os.path.join(BASE_DIR, "data", "real_cosmetics_ecommerce.csv"))
all_skus = df["sku"].drop_duplicates().tolist()

print(f"First 100 mapping count: {len(items)}")
print(f"Total unique SKUs in entire 8,164 dataset: {len(all_skus)}")
print(f"Products inside first 100: {len(items)}")
print(f"Products outside first 100: {len(all_skus) - len(items)}")
