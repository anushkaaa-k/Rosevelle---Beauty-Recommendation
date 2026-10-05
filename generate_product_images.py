"""
Generates polished, high-resolution SVG product assets for ROSEVELLE catalog products.
Ensures every ASIN item has a stable local fallback image matching the luxury maroon-and-cream palette.
"""

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASE_DIR, "static", "images", "products")
os.makedirs(IMG_DIR, exist_ok=True)

PRODUCT_SVG_TEMPLATES = {
    "fallback": {
        "filename": "fallback_cosmetics.svg",
        "title": "Beauty Product",
        "brand": "Luxury Cosmetics",
        "color": "#641E2B",
        "accent": "#C5A46D",
        "type": "jar"
    },
    "B000143526": {
        "filename": "B000143526.svg",
        "title": "Hydrating Cleanser",
        "brand": "CeraVe",
        "color": "#641E2B",
        "accent": "#B98283",
        "type": "bottle"
    },
    "B0009V1YR8": {
        "filename": "B0009V1YR8.svg",
        "title": "Niacinamide 10%",
        "brand": "The Ordinary",
        "color": "#352329",
        "accent": "#C5A46D",
        "type": "dropper"
    },
    "B001MA0QY2": {
        "filename": "B001MA0QY2.svg",
        "title": "Lash Sensational",
        "brand": "Maybelline",
        "color": "#641E2B",
        "accent": "#B98283",
        "type": "mascara"
    },
    "B003V21W3I": {
        "filename": "B003V21W3I.svg",
        "title": "Revitalift Serum",
        "brand": "L'Oreal Paris",
        "color": "#641E2B",
        "accent": "#C5A46D",
        "type": "dropper"
    },
    "B004D248KC": {
        "filename": "B004D248KC.svg",
        "title": "2% BHA Liquid",
        "brand": "Paula's Choice",
        "color": "#352329",
        "accent": "#B98283",
        "type": "bottle"
    },
    "B00551GBWC": {
        "filename": "B00551GBWC.svg",
        "title": "Anthelios SPF 60",
        "brand": "La Roche-Posay",
        "color": "#641E2B",
        "accent": "#C5A46D",
        "type": "tube"
    },
    "B007MT6J1E": {
        "filename": "B007MT6J1E.svg",
        "title": "Soft Matte Lip",
        "brand": "NYX Makeup",
        "color": "#641E2B",
        "accent": "#B98283",
        "type": "lipstick"
    },
    "B008630WNE": {
        "filename": "B008630WNE.svg",
        "title": "Hydro Boost Gel",
        "brand": "Neutrogena",
        "color": "#352329",
        "accent": "#C5A46D",
        "type": "jar"
    },
    "B00B4UYN6S": {
        "filename": "B00B4UYN6S.svg",
        "title": "No. 3 Perfector",
        "brand": "Olaplex",
        "color": "#641E2B",
        "accent": "#C5A46D",
        "type": "bottle"
    },
    "B00E7Q299S": {
        "filename": "B00E7Q299S.svg",
        "title": "Snail 96 Essence",
        "brand": "COSRX",
        "color": "#352329",
        "accent": "#B98283",
        "type": "pump"
    },
    "B01N2G7N1W": {
        "filename": "B01N2G7N1W.svg",
        "title": "Soft Pinch Blush",
        "brand": "Rare Beauty",
        "color": "#641E2B",
        "accent": "#B98283",
        "type": "dropper"
    },
    "B079F5S5W2": {
        "filename": "B079F5S5W2.svg",
        "title": "Bum Bum Cream",
        "brand": "Sol de Janeiro",
        "color": "#641E2B",
        "accent": "#C5A46D",
        "type": "jar"
    }
}


def build_svg(info):
    brand = info["brand"]
    title = info["title"]
    color = info["color"]
    accent = info["accent"]
    ptype = info["type"]

    # Silhouette shapes based on type
    if ptype == "bottle":
        shape_path = f"""
        <rect x="110" y="90" width="80" height="150" rx="16" fill="{color}" />
        <rect x="130" y="60" width="40" height="30" rx="4" fill="{accent}" />
        <rect x="120" y="130" width="60" height="70" rx="4" fill="#FFF9F2" />
        <text x="150" y="155" font-family="'Playfair Display', serif" font-size="11" font-weight="bold" fill="{color}" text-anchor="middle">{brand[:10]}</text>
        <text x="150" y="175" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" fill="#352329" text-anchor="middle">{title[:12]}</text>
        """
    elif ptype == "dropper":
        shape_path = f"""
        <rect x="115" y="100" width="70" height="130" rx="12" fill="{color}" />
        <rect x="135" y="65" width="30" height="35" rx="3" fill="#FFF9F2" />
        <circle cx="150" cy="50" r="14" fill="{accent}" />
        <rect x="125" y="130" width="50" height="65" rx="3" fill="#FFF9F2" />
        <text x="150" y="155" font-family="'Playfair Display', serif" font-size="10" font-weight="bold" fill="{color}" text-anchor="middle">{brand[:10]}</text>
        <text x="150" y="172" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" fill="#352329" text-anchor="middle">{title[:12]}</text>
        """
    elif ptype == "jar":
        shape_path = f"""
        <rect x="95" y="120" width="110" height="100" rx="14" fill="{color}" />
        <rect x="90" y="95" width="120" height="25" rx="6" fill="{accent}" />
        <rect x="110" y="145" width="80" height="50" rx="4" fill="#FFF9F2" />
        <text x="150" y="168" font-family="'Playfair Display', serif" font-size="11" font-weight="bold" fill="{color}" text-anchor="middle">{brand[:10]}</text>
        <text x="150" y="185" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" fill="#352329" text-anchor="middle">{title[:12]}</text>
        """
    elif ptype == "tube":
        shape_path = f"""
        <path d="M 100,220 L 115,80 L 185,80 L 200,220 Z" fill="{color}" />
        <rect x="115" y="60" width="70" height="20" rx="4" fill="{accent}" />
        <rect x="120" y="110" width="60" height="70" rx="3" fill="#FFF9F2" />
        <text x="150" y="140" font-family="'Playfair Display', serif" font-size="10" font-weight="bold" fill="{color}" text-anchor="middle">{brand[:10]}</text>
        <text x="150" y="160" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" fill="#352329" text-anchor="middle">{title[:12]}</text>
        """
    else:  # lipstick / mascara / pump
        shape_path = f"""
        <rect x="120" y="90" width="60" height="140" rx="8" fill="{color}" />
        <rect x="125" y="55" width="50" height="35" rx="4" fill="{accent}" />
        <rect x="130" y="120" width="40" height="80" rx="3" fill="#FFF9F2" />
        <text x="150" y="150" font-family="'Playfair Display', serif" font-size="9" font-weight="bold" fill="{color}" text-anchor="middle">{brand[:8]}</text>
        <text x="150" y="170" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" fill="#352329" text-anchor="middle">{title[:10]}</text>
        """

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFF9F2" />
          <stop offset="100%" stop-color="#F5EBDD" />
        </radialGradient>
      </defs>
      <rect width="300" height="300" rx="16" fill="url(#bgGlow)" stroke="#B98283" stroke-width="2" />
      <circle cx="150" cy="150" r="100" fill="none" stroke="{accent}" stroke-width="1" stroke-dasharray="4,4" />
      {shape_path}
    </svg>"""

    return svg


def generate_all_images():
    for key, info in PRODUCT_SVG_TEMPLATES.items():
        filepath = os.path.join(IMG_DIR, info["filename"])
        svg_content = build_svg(info)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(svg_content)
        print(f"[+] Generated product image: {info['filename']}")


if __name__ == "__main__":
    generate_all_images()
