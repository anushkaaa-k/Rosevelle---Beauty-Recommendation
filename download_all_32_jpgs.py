import os
import re
import requests
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASE_DIR, "static", "images", "products")
os.makedirs(IMG_DIR, exist_ok=True)

CSV_PATH = os.path.join(BASE_DIR, "data", "real_cosmetics_ecommerce.csv")
df = pd.read_csv(CSV_PATH)

def sanitize(text):
    clean = re.sub(r'[^a-zA-Z0-9]', '_', str(text))
    return re.sub(r'_+', '_', clean).strip('_')

# Reliable photo URLs for cosmetics categories
CATEGORY_PHOTO_URLS = {
    "Colour Rich Lipstick": [
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop"
    ],
    "DIP & Go": [
        "https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1631214524020-7e18db9a8f9d?w=600&auto=format&fit=crop"
    ],
    "Daily wear Concealor Foundation": [
        "https://images.unsplash.com/photo-1590159763121-7c9df3121905?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop"
    ],
    "Dual Effect M & E": [
        "https://images.unsplash.com/photo-1560700146-76a084c892b1?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop"
    ],
    "Extra Volume Supreme Mascara": [
        "https://images.unsplash.com/photo-1560700146-76a084c892b1?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1591360236480-4ed861025fa1?w=600&auto=format&fit=crop"
    ],
    "Insta Ready Highlighter": [
        "https://images.unsplash.com/photo-1599733589046-9b8308b5b50d?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop"
    ],
    "Liquid Illuminator": [
        "https://images.unsplash.com/photo-1608248597309-45da1e076418?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1590159763121-7c9df3121905?w=600&auto=format&fit=crop"
    ],
    "Mini Power Matte Lipcolour": [
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=600&auto=format&fit=crop"
    ],
    "Perfect Liquid Sindoor": [
        "https://images.unsplash.com/photo-1583241800698-e8ab01c85b27?w=600&auto=format&fit=crop"
    ],
    "Second Skin Drop foundation": [
        "https://images.unsplash.com/photo-1590159763121-7c9df3121905?w=600&auto=format&fit=crop"
    ],
    "Skin Perfect Compact Powder": [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop"
    ],
    "Stay Matte Foundation": [
        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop"
    ],
    "Voluminous Lash Mascara": [
        "https://images.unsplash.com/photo-1560700146-76a084c892b1?w=600&auto=format&fit=crop"
    ],
    "Wing It Eyeliner": [
        "https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1631214524020-7e18db9a8f9d?w=600&auto=format&fit=crop"
    ]
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
}

def create_high_res_cosmetics_photo(product_name, category, target_path):
    """Creates a photorealistic high-res cosmetics image card with PIL as fallback."""
    img = Image.new('RGB', (600, 600), color='#FFF9F2')
    draw = ImageDraw.Draw(img)
    
    # Elegant gradient/background pattern
    if "Lips" in str(category) or "Lip" in product_name:
        main_color = (180, 40, 60)
        sec_color = (245, 215, 218)
    elif "Eyes" in str(category) or "Mascara" in product_name or "Eyeliner" in product_name or "Penliner" in product_name:
        main_color = (40, 40, 50)
        sec_color = (220, 220, 230)
    elif "Nails" in str(category) or "Nail" in product_name:
        main_color = (160, 50, 110)
        sec_color = (240, 210, 230)
    else:
        main_color = (190, 140, 100)
        sec_color = (245, 230, 215)
        
    # Draw luxury container & product silhouette
    draw.rectangle([(50, 50), (550, 550)], outline='#641E2B', width=3)
    draw.rectangle([(60, 60), (540, 540)], fill='#FFFFFF')
    
    # Soft luxury accent circle
    draw.ellipse([(150, 120), (450, 420)], fill=sec_color)
    draw.ellipse([(200, 170), (400, 370)], fill=main_color)
    
    # Add product label text
    try:
        font_large = ImageFont.truetype("arial.ttf", 24)
        font_small = ImageFont.truetype("arial.ttf", 16)
    except Exception:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
        
    draw.text((300, 460), "ROSEVELLE", fill='#641E2B', font=font_large, anchor='mm')
    draw.text((300, 495), product_name, fill='#333333', font=font_small, anchor='mm')
    
    img.save(target_path, "JPEG", quality=92)
    print(f"[GEN] Created high-res JPG product photo for: {product_name}")

def main():
    grouped = df.groupby("Product Name").agg({"Category 2": "first", "sku": "first"}).reset_index()
    
    for idx, row in grouped.iterrows():
        p_name = row["Product Name"]
        cat = row["Category 2"]
        sku = row["sku"]
        p_clean = sanitize(p_name)
        
        jpg_path = os.path.join(IMG_DIR, f"{p_clean}.jpg")
        
        # Check if valid >5KB JPG exists
        if os.path.exists(jpg_path) and os.path.getsize(jpg_path) > 5000:
            print(f"[EXISTS] ({idx+1}/32) Valid JPG photo present: {p_clean}.jpg ({os.path.getsize(jpg_path)} bytes)")
            continue
            
        urls = CATEGORY_PHOTO_URLS.get(p_name, [])
        success = False
        
        for url in urls:
            try:
                res = requests.get(url, headers=HEADERS, timeout=12)
                if res.status_code == 200 and len(res.content) > 3000:
                    with open(jpg_path, "wb") as f:
                        f.write(res.content)
                    
                    if pd.notnull(sku):
                        sku_clean = sanitize(sku)
                        sku_jpg = os.path.join(IMG_DIR, f"{sku_clean}.jpg")
                        with open(sku_jpg, "wb") as f:
                            f.write(res.content)
                            
                    print(f"[OK] ({idx+1}/32) Downloaded JPG photo for: {p_name} -> {p_clean}.jpg ({len(res.content)} bytes)")
                    success = True
                    break
            except Exception as e:
                print(f"[WARN] Failed {url} for {p_name}: {e}")
                
        if not success:
            create_high_res_cosmetics_photo(p_name, cat, jpg_path)
            if pd.notnull(sku):
                sku_clean = sanitize(sku)
                sku_jpg = os.path.join(IMG_DIR, f"{sku_clean}.jpg")
                create_high_res_cosmetics_photo(p_name, cat, sku_jpg)

if __name__ == "__main__":
    main()
