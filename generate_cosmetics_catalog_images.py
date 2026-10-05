"""
Script to generate distinct, high-resolution SVG product artwork for all 32 products
in the Real Cosmetics E-Commerce Dataset (~8,164 records).
Saves images into static/images/products/ using sanitized product names and SKUs.
"""

import os
import re
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASE_DIR, "static", "images", "products")
os.makedirs(IMG_DIR, exist_ok=True)

CSV_PATH = os.path.join(BASE_DIR, "data", "real_cosmetics_ecommerce.csv")
df = pd.read_csv(CSV_PATH)

PRODUCT_DESIGNS = {
    "2 in 1 Matte + Gloss Lipcolour": {"type": "lipstick", "color": "#641E2B", "accent": "#C5A46D", "title": "2in1 Lipcolour", "brand": "ROSEVELLE"},
    "5 Toxic Free Nail Lacquer": {"type": "nail_polish", "color": "#B98283", "accent": "#C5A46D", "title": "Nail Lacquer", "brand": "ROSEVELLE"},
    "Always On Matte Lipstick": {"type": "lipstick", "color": "#641E2B", "accent": "#B98283", "title": "Matte Lipstick", "brand": "ROSEVELLE"},
    "Blemish free concealor": {"type": "wand", "color": "#C5A46D", "accent": "#641E2B", "title": "Concealer", "brand": "ROSEVELLE"},
    "Color Corrector Concealor Palette": {"type": "palette", "color": "#352329", "accent": "#C5A46D", "title": "Corrector Palette", "brand": "ROSEVELLE"},
    "Colour Rich Lipstick": {"type": "lipstick", "color": "#641E2B", "accent": "#C5A46D", "title": "Rich Lipstick", "brand": "ROSEVELLE"},
    "DIP & Go": {"type": "nail_polish", "color": "#B98283", "accent": "#352329", "title": "DIP & Go", "brand": "ROSEVELLE"},
    "Daily wear Concealor Foundation": {"type": "bottle", "color": "#C5A46D", "accent": "#641E2B", "title": "Foundation", "brand": "ROSEVELLE"},
    "Dual Effect M & E": {"type": "pen", "color": "#352329", "accent": "#C5A46D", "title": "Dual Effect", "brand": "ROSEVELLE"},
    "Extra Volume Supreme Mascara": {"type": "mascara", "color": "#641E2B", "accent": "#C5A46D", "title": "Supreme Mascara", "brand": "ROSEVELLE"},
    "Glimmer Loose pigments": {"type": "jar", "color": "#C5A46D", "accent": "#B98283", "title": "Loose Pigments", "brand": "ROSEVELLE"},
    "Insight Glitter Purse": {"type": "pouch", "color": "#641E2B", "accent": "#C5A46D", "title": "Glitter Purse", "brand": "ROSEVELLE"},
    "Insta Ready Highlighter": {"type": "compact", "color": "#C5A46D", "accent": "#641E2B", "title": "Highlighter", "brand": "ROSEVELLE"},
    "Intense Penliner": {"type": "pen", "color": "#352329", "accent": "#B98283", "title": "Intense Penliner", "brand": "ROSEVELLE"},
    "Liquid Illuminator": {"type": "dropper", "color": "#C5A46D", "accent": "#641E2B", "title": "Illuminator", "brand": "ROSEVELLE"},
    "Mini Power Matte Lipcolour": {"type": "lipstick", "color": "#641E2B", "accent": "#B98283", "title": "Mini Lipcolour", "brand": "ROSEVELLE"},
    "Mousse Foundation": {"type": "jar", "color": "#C5A46D", "accent": "#352329", "title": "Mousse Foundation", "brand": "ROSEVELLE"},
    "Perfect Liquid Sindoor": {"type": "wand", "color": "#641E2B", "accent": "#C5A46D", "title": "Liquid Sindoor", "brand": "ROSEVELLE"},
    "Power Matte Lipcolor": {"type": "lipstick", "color": "#641E2B", "accent": "#C5A46D", "title": "Power Matte", "brand": "ROSEVELLE"},
    "Power Puff compact & concealer": {"type": "compact", "color": "#C5A46D", "accent": "#352329", "title": "Power Compact", "brand": "ROSEVELLE"},
    "Prime It Up": {"type": "tube", "color": "#B98283", "accent": "#641E2B", "title": "Prime It Up", "brand": "ROSEVELLE"},
    "Primer Matte Lipstick": {"type": "lipstick", "color": "#641E2B", "accent": "#C5A46D", "title": "Primer Lipstick", "brand": "ROSEVELLE"},
    "Quick Nail Wipes - 30": {"type": "jar", "color": "#352329", "accent": "#B98283", "title": "Nail Wipes 30", "brand": "ROSEVELLE"},
    "Quick Nail Wipes - 40": {"type": "jar", "color": "#352329", "accent": "#C5A46D", "title": "Nail Wipes 40", "brand": "ROSEVELLE"},
    "Second Skin Drop foundation": {"type": "dropper", "color": "#C5A46D", "accent": "#641E2B", "title": "Drop Foundation", "brand": "ROSEVELLE"},
    "Skin Perfect Compact Powder": {"type": "compact", "color": "#C5A46D", "accent": "#B98283", "title": "Compact Powder", "brand": "ROSEVELLE"},
    "Stay All Day Eyeliner": {"type": "pen", "color": "#352329", "accent": "#C5A46D", "title": "Stay All Day", "brand": "ROSEVELLE"},
    "Stay Matte Foundation": {"type": "bottle", "color": "#C5A46D", "accent": "#641E2B", "title": "Stay Matte FD", "brand": "ROSEVELLE"},
    "Studio Nail Polish": {"type": "nail_polish", "color": "#B98283", "accent": "#C5A46D", "title": "Studio Polish", "brand": "ROSEVELLE"},
    "Ultra HD translucent powder": {"type": "jar", "color": "#FFF9F2", "accent": "#C5A46D", "title": "Ultra HD Powder", "brand": "ROSEVELLE"},
    "Voluminous Lash Mascara": {"type": "mascara", "color": "#641E2B", "accent": "#C5A46D", "title": "Lash Mascara", "brand": "ROSEVELLE"},
    "Wing It Eyeliner": {"type": "pen", "color": "#352329", "accent": "#B98283", "title": "Wing It Eyeliner", "brand": "ROSEVELLE"}
}


def build_product_svg(info):
    brand = info.get("brand", "ROSEVELLE")
    title = info.get("title", "Cosmetics")
    color = info.get("color", "#641E2B")
    accent = info.get("accent", "#C5A46D")
    ptype = info.get("type", "jar")

    if ptype == "lipstick":
        shape = f"""
        <rect x="120" y="95" width="60" height="135" rx="8" fill="{color}" />
        <rect x="125" y="60" width="50" height="35" rx="4" fill="{accent}" />
        <path d="M 130 60 L 170 60 L 150 25 Z" fill="{color}" />
        <rect x="130" y="125" width="40" height="75" rx="3" fill="#FFF9F2" />
        <text x="150" y="150" font-family="'Playfair Display', serif" font-size="9" font-weight="bold" fill="{color}" text-anchor="middle">{brand}</text>
        <text x="150" y="170" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" fill="#352329" text-anchor="middle">{title[:12]}</text>
        """
    elif ptype == "nail_polish":
        shape = f"""
        <rect x="110" y="120" width="80" height="100" rx="12" fill="{color}" />
        <rect x="130" y="55" width="40" height="65" rx="5" fill="{accent}" />
        <rect x="120" y="140" width="60" height="60" rx="4" fill="#FFF9F2" />
        <text x="150" y="165" font-family="'Playfair Display', serif" font-size="10" font-weight="bold" fill="{color}" text-anchor="middle">{brand}</text>
        <text x="150" y="185" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" fill="#352329" text-anchor="middle">{title[:12]}</text>
        """
    elif ptype == "compact" or ptype == "palette":
        shape = f"""
        <circle cx="150" cy="155" r="75" fill="{color}" stroke="{accent}" stroke-width="4" />
        <circle cx="150" cy="155" r="55" fill="#FFF9F2" />
        <text x="150" y="152" font-family="'Playfair Display', serif" font-size="11" font-weight="bold" fill="{color}" text-anchor="middle">{brand}</text>
        <text x="150" y="170" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" fill="#352329" text-anchor="middle">{title[:14]}</text>
        """
    elif ptype == "dropper":
        shape = f"""
        <rect x="115" y="105" width="70" height="125" rx="12" fill="{color}" />
        <rect x="135" y="70" width="30" height="35" rx="3" fill="#FFF9F2" />
        <circle cx="150" cy="52" r="15" fill="{accent}" />
        <rect x="125" y="130" width="50" height="65" rx="3" fill="#FFF9F2" />
        <text x="150" y="155" font-family="'Playfair Display', serif" font-size="10" font-weight="bold" fill="{color}" text-anchor="middle">{brand}</text>
        <text x="150" y="172" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" fill="#352329" text-anchor="middle">{title[:12]}</text>
        """
    elif ptype == "mascara" or ptype == "wand":
        shape = f"""
        <rect x="125" y="85" width="50" height="145" rx="10" fill="{color}" />
        <rect x="130" y="45" width="40" height="40" rx="5" fill="{accent}" />
        <rect x="132" y="115" width="36" height="85" rx="3" fill="#FFF9F2" />
        <text x="150" y="150" font-family="'Playfair Display', serif" font-size="9" font-weight="bold" fill="{color}" text-anchor="middle">{brand}</text>
        <text x="150" y="170" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" fill="#352329" text-anchor="middle">{title[:10]}</text>
        """
    elif ptype == "pen":
        shape = f"""
        <rect x="135" y="55" width="30" height="180" rx="6" fill="{color}" />
        <polygon points="150,250 142,235 158,235" fill="{accent}" />
        <rect x="138" y="90" width="24" height="100" rx="2" fill="#FFF9F2" />
        <text x="150" y="135" font-family="'Playfair Display', serif" font-size="8" font-weight="bold" fill="{color}" text-anchor="middle" transform="rotate(-90 150 135)">{brand}</text>
        """
    elif ptype == "pouch":
        shape = f"""
        <path d="M 80,110 Q 150,80 220,110 L 230,210 Q 150,230 70,210 Z" fill="{color}" stroke="{accent}" stroke-width="3" />
        <rect x="100" y="130" width="100" height="60" rx="6" fill="#FFF9F2" />
        <text x="150" y="158" font-family="'Playfair Display', serif" font-size="12" font-weight="bold" fill="{color}" text-anchor="middle">{brand}</text>
        <text x="150" y="176" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" fill="#352329" text-anchor="middle">{title[:14]}</text>
        """
    else:  # jar or bottle
        shape = f"""
        <rect x="105" y="115" width="90" height="110" rx="14" fill="{color}" />
        <rect x="95" y="90" width="110" height="25" rx="6" fill="{accent}" />
        <rect x="115" y="135" width="70" height="60" rx="4" fill="#FFF9F2" />
        <text x="150" y="160" font-family="'Playfair Display', serif" font-size="11" font-weight="bold" fill="{color}" text-anchor="middle">{brand}</text>
        <text x="150" y="178" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" fill="#352329" text-anchor="middle">{title[:14]}</text>
        """

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFF9F2" />
          <stop offset="100%" stop-color="#F5EBDD" />
        </radialGradient>
      </defs>
      <rect width="300" height="300" rx="16" fill="url(#bgGlow)" stroke="#B98283" stroke-width="2" />
      <circle cx="150" cy="150" r="105" fill="none" stroke="{accent}" stroke-width="1.5" stroke-dasharray="4,4" />
      {shape}
    </svg>"""


def sanitize_filename(name):
    clean = re.sub(r'[^a-zA-Z0-9]', '_', str(name))
    clean = re.sub(r'_+', '_', clean).strip('_')
    return clean


def main():
    print("[*] Generating distinct luxury SVG assets for all 32 products...")
    
    # 1. Fallback image
    fallback_info = {"brand": "ROSEVELLE", "title": "Cosmetics Item", "color": "#641E2B", "accent": "#C5A46D", "type": "jar"}
    fallback_path = os.path.join(IMG_DIR, "fallback_cosmetics.svg")
    with open(fallback_path, "w", encoding="utf-8") as f:
        f.write(build_product_svg(fallback_info))
    print(f"[+] Saved fallback: fallback_cosmetics.svg")

    # 2. Iterate through products
    grouped = df.groupby("Product Name").agg({"sku": "first", "Category 2": "first"}).reset_index()

    for _, row in grouped.iterrows():
        p_name = row["Product Name"]
        sku = row["sku"]
        info = PRODUCT_DESIGNS.get(p_name, {"brand": "ROSEVELLE", "title": p_name[:12], "color": "#641E2B", "accent": "#C5A46D", "type": "jar"})

        svg_content = build_product_svg(info)

        # Save by sanitized product name
        name_clean = sanitize_filename(p_name)
        file_name = os.path.join(IMG_DIR, f"{name_clean}.svg")
        with open(file_name, "w", encoding="utf-8") as f:
            f.write(svg_content)

        # Save by SKU if available
        if pd.notnull(sku):
            sku_clean = sanitize_filename(sku)
            sku_path = os.path.join(IMG_DIR, f"{sku_clean}.svg")
            with open(sku_path, "w", encoding="utf-8") as f:
                f.write(svg_content)

        print(f"[+] Saved asset for: {p_name} -> {name_clean}.svg")

    print("[SUCCESS] ALL 32 PRODUCT IMAGE ASSETS GENERATED!")


if __name__ == "__main__":
    main()
