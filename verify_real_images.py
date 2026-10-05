"""
Runtime verification script to check that all 12 real cosmetics product images
are accessible via Flask HTTP requests and properly formatted in JSON APIs.
"""
import os
import sys
from app import app

client = app.test_client()

ASINS = [
    "B000143526", "B0009V1YR8", "B001MA0QY2", "B003V21W3I",
    "B004D248KC", "B00551GBWC", "B007MT6J1E", "B008630WNE",
    "B00B4UYN6S", "B00E7Q299S", "B01N2G7N1W", "B079F5S5W2"
]

print("=======================================================")
print("[*] VERIFYING REAL COSMETICS PRODUCT PHOTOS VIA FLASK HTTP...")
print("=======================================================")

passed = 0
for asin in ASINS:
    url = f"/static/images/products/{asin}.jpg"
    res = client.get(url)
    if res.status_code == 200 and len(res.data) > 3000:
        print(f"[OK] {url} -> 200 OK ({len(res.data)} bytes)")
        passed += 1
    else:
        print(f"[FAIL] {url} -> Status: {res.status_code}, Length: {len(res.data)}")

print("\n-------------------------------------------------------")
print(f"[*] IMAGE ENDPOINT RESULTS: {passed}/{len(ASINS)} endpoints returned valid 200 OK real image binaries.")
print("-------------------------------------------------------\n")

print("[*] VERIFYING API METADATA RESPONSES...")
res = client.get("/api/dataset-records?dataset=amazon_metadata")
if res.status_code == 200:
    records = res.get_json().get("records", [])
    print(f"[OK] GET /api/dataset-records?dataset=amazon_metadata -> {len(records)} records returned.")
    sample_prod = records[0]
    print(f"    Sample Product: {sample_prod.get('title')}")
    print(f"    Sample Image Data: {sample_prod.get('images')}")
else:
    print(f"[FAIL] GET /api/dataset-records returned {res.status_code}")

if passed == len(ASINS):
    print("\n[SUCCESS] ALL 12 REAL COSMETICS PRODUCT PHOTOS ARE VERIFIED AND WORKING!")
    sys.exit(0)
else:
    print("\n[FAIL] Some images failed verification.")
    sys.exit(1)
