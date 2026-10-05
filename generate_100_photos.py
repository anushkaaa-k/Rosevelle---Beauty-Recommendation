import os
import re
import json
import requests
import pandas as pd
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASE_DIR, "static", "images", "products")
os.makedirs(IMG_DIR, exist_ok=True)

MAPPING_FILE = os.path.join(BASE_DIR, "data", "first_100_products_mapping.json")
with open(MAPPING_FILE, "r", encoding="utf-8") as f:
    first_100 = json.load(f)

print(f"Loaded {len(first_100)} unique products from mapping.")

def sanitize(text):
    clean = re.sub(r'[^a-zA-Z0-9]', '_', str(text))
    return re.sub(r'_+', '_', clean).strip('_')

# Reliable category photo URLs to seed high quality luxury cosmetics imagery
CAT_SEEDS = {
    "Lips": [
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&auto=format&fit=crop"
    ],
    "Nails": [
        "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&auto=format&fit=crop"
    ],
    "Eyes": [
        "https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1560700146-76a084c892b1?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?w=600&auto=format&fit=crop"
    ],
    "Face": [
        "https://images.unsplash.com/photo-1590159763121-7c9df3121905?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1608248597309-45da1e076418?w=600&auto=format&fit=crop"
    ]
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def generate_custom_product_photo(index, sku, p_name, var_name, category, target_path):
    """Generates a high-res individual photo for product key."""
    img = Image.new('RGB', (600, 600), color='#FFF9F2')
    draw = ImageDraw.Draw(img)
    
    # Category color themes
    if category == "Lips":
        bg_accent = (245, 215, 218)
        prod_fill = (165, 30, 50)
        border_col = (100, 30, 43)
    elif category == "Nails":
        bg_accent = (240, 210, 230)
        prod_fill = (140, 40, 95)
        border_col = (100, 30, 43)
    elif category == "Eyes":
        bg_accent = (220, 225, 235)
        prod_fill = (35, 35, 45)
        border_col = (100, 30, 43)
    else: # Face / Skincare
        bg_accent = (245, 230, 215)
        prod_fill = (185, 135, 95)
        border_col = (100, 30, 43)
        
    # Luxury outer frame & inner white container
    draw.rectangle([(30, 30), (570, 570)], outline=border_col, width=3)
    draw.rectangle([(40, 40), (560, 560)], fill='#FFFFFF')
    
    # Distinct product background accent shape
    draw.ellipse([(140, 110), (460, 430)], fill=bg_accent)
    draw.ellipse([(190, 160), (410, 380)], fill=prod_fill)
    
    # Soft product highlight overlay
    draw.ellipse([(230, 180), (330, 260)], fill=(255, 255, 255, 120))
    
    # Index badge tag
    draw.rectangle([(50, 50), (220, 90)], fill='#641E2B')
    
    try:
        font_large = ImageFont.truetype("arial.ttf", 22)
        font_sub = ImageFont.truetype("arial.ttf", 15)
        font_tag = ImageFont.truetype("arial.ttf", 14)
    except Exception:
        font_large = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_tag = ImageFont.load_default()
        
    draw.text((135, 70), f"PRODUCT #{index}", fill='#FFF9F2', font=font_tag, anchor='mm')
    
    # Product Title & SKU Text Labels
    draw.text((300, 460), "ROSEVELLE", fill='#641E2B', font=font_large, anchor='mm')
    draw.text((300, 495), f"{p_name}", fill='#352329', font=font_sub, anchor='mm')
    draw.text((300, 525), f"SKU: {sku} | {var_name}", fill='#8A6E76', font=font_sub, anchor='mm')
    
    img.save(target_path, "JPEG", quality=95)
    print(f"[GEN] Created photo for Product #{index}: {sku} -> {os.path.basename(target_path)}")

# Build photos for all 100 unique products
success_count = 0
for idx, item in enumerate(first_100, 1):
    key = item["key"]
    sku = item["sku"]
    p_name = item["product_name"]
    var_name = item["variant_name"]
    category = item["category"]
    sanitized_key = item["sanitized"]
    sanitized_sku = sanitize(sku) if sku else ""
    sanitized_name = item["sanitized_name"]
    
    target_path = os.path.join(IMG_DIR, f"{sanitized_key}.jpg")
    
    # Generate high quality specific image card with PIL for deterministic exact mapping
    generate_custom_product_photo(idx, sku, p_name, var_name, category, target_path)
    
    # Also save under sku sanitized name if different
    if sanitized_sku and sanitized_sku != sanitized_key:
        sku_path = os.path.join(IMG_DIR, f"{sanitized_sku}.jpg")
        generate_custom_product_photo(idx, sku, p_name, var_name, category, sku_path)
        
    success_count += 1

print(f"\n[SUCCESS] Generated 100 deterministic product photographs in {IMG_DIR}!")
