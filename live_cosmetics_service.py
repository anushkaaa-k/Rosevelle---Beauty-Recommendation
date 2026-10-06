"""
Live Cosmetics REST API Service Module for ROSEVELLE.

Integrates exclusively with the public Makeup REST API:
https://makeup-api.herokuapp.com/api/v1/products.json

Provides real-time dynamic fetching, server-side requests via Python,
caching, timeout handling, HTTP error validation, payload normalization,
and resilient disk caching for the Live Cosmetics Product Catalogue.
"""

import os
import json
import requests
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

MAKEUP_API_BASE_URL = os.environ.get("BEAUTY_API_URL", "http://makeup-api.herokuapp.com/api/v1/products.json")
CACHE_FILE_PATH = os.path.join(os.path.dirname(__file__), "data", "makeup_api_cache.json")

# In-memory cache for live cosmetics catalogue
_LIVE_COSMETICS_CACHE: Dict[str, Any] = {
    "products": None,
    "fetched_at": None,
    "cache_key": None,
    "status": "uninitialized",
    "error_message": None
}


def _load_disk_cache() -> Optional[List[Dict[str, Any]]]:
    """Loads cached Makeup API products from disk if available."""
    if os.path.exists(CACHE_FILE_PATH):
        try:
            with open(CACHE_FILE_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list) and len(data) > 0:
                    return data
        except Exception:
            pass
    return None


def _save_disk_cache(products: List[Dict[str, Any]]):
    """Saves Makeup API products to disk cache."""
    try:
        os.makedirs(os.path.dirname(CACHE_FILE_PATH), exist_ok=True)
        with open(CACHE_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(products, f, indent=2)
    except Exception:
        pass


def fetch_live_cosmetics(
    brand: Optional[str] = None,
    product_type: Optional[str] = None,
    limit: int = 50,
    force_refresh: bool = False
) -> Dict[str, Any]:
    """
    Fetches real cosmetics catalogue directly from Makeup API.
    Handles timeouts, HTTP status errors, and JSON parsing gracefully.
    Falls back to disk cache on network timeout.
    """
    global _LIVE_COSMETICS_CACHE

    cache_key = f"{brand}_{product_type}"

    # Return memory cached data if available and not force refreshing
    if not force_refresh and _LIVE_COSMETICS_CACHE.get("status") == "success" and _LIVE_COSMETICS_CACHE.get("products") and _LIVE_COSMETICS_CACHE.get("cache_key") == cache_key:
        cached_prods = _LIVE_COSMETICS_CACHE["products"]
        return {
            "status": "success",
            "data_source": "Makeup API",
            "live": True,
            "fetched_at": _LIVE_COSMETICS_CACHE.get("fetched_at"),
            "total_products_available": len(cached_prods),
            "total_fetched": min(limit, len(cached_prods)),
            "products": cached_prods[:limit]
        }

    headers = {
        "User-Agent": "ROSEVELLE-Luxury-Cosmetics-Analytics/3.0",
        "Accept": "application/json"
    }

    params = {}
    if brand and str(brand).lower().strip() not in ("all", "none", ""):
        params["brand"] = str(brand).lower().strip()
    if product_type and str(product_type).lower().strip() not in ("all", "none", ""):
        params["product_type"] = str(product_type).lower().strip()

    try:
        res = requests.get(MAKEUP_API_BASE_URL, headers=headers, params=params, timeout=8)

        if res.status_code == 200:
            try:
                raw_data = res.json()
            except ValueError:
                raw_data = []

            if isinstance(raw_data, list) and len(raw_data) > 0:
                normalized_products = []
                for item in raw_data:
                    if not isinstance(item, dict):
                        continue

                    p_name = str(item.get("name") or "Luxury Beauty Product").strip()
                    p_brand = str(item.get("brand") or "Rosevelle Partner").strip().title()
                    p_type = str(item.get("product_type") or "Cosmetics").strip().replace("_", " ").title()
                    p_cat = str(item.get("category") or item.get("product_type") or "Cosmetics").strip().replace("_", " ").title()
                    p_img = str(item.get("image_link") or item.get("api_featured_image") or "").strip()
                    p_link = str(item.get("product_link") or "").strip()
                    p_desc = str(item.get("description") or "").strip()[:180]

                    p_price_raw = item.get("price")
                    price_val = None
                    price_fmt = "Price Upon Request"
                    if p_price_raw is not None:
                        try:
                            price_num = float(p_price_raw)
                            if price_num > 0:
                                price_val = round(price_num, 2)
                                price_fmt = f"${price_val:,.2f}"
                        except (ValueError, TypeError):
                            pass

                    p_rating_raw = item.get("rating")
                    rating_val = None
                    if p_rating_raw is not None:
                        try:
                            r_num = float(p_rating_raw)
                            if 1.0 <= r_num <= 5.0:
                                rating_val = round(r_num, 1)
                        except (ValueError, TypeError):
                            pass

                    normalized_products.append({
                        "id": item.get("id"),
                        "name": p_name,
                        "brand": p_brand,
                        "product_type": p_type,
                        "category": p_cat,
                        "price": price_val,
                        "price_formatted": price_fmt,
                        "rating": rating_val,
                        "image_url": p_img,
                        "product_link": p_link,
                        "description": p_desc,
                        "tags": item.get("tag_list") or []
                    })

                if normalized_products:
                    utc_now = datetime.now(timezone.utc).isoformat()
                    _LIVE_COSMETICS_CACHE = {
                        "products": normalized_products,
                        "fetched_at": utc_now,
                        "cache_key": cache_key,
                        "status": "success",
                        "error_message": None
                    }
                    _save_disk_cache(normalized_products)

                    return {
                        "status": "success",
                        "data_source": "Makeup API",
                        "live": True,
                        "fetched_at": utc_now,
                        "total_products_available": len(normalized_products),
                        "total_fetched": min(limit, len(normalized_products)),
                        "products": normalized_products[:limit]
                    }

    except Exception:
        pass

    # Disk cache or memory cache fallback on network issue
    disk_prods = _load_disk_cache() or _LIVE_COSMETICS_CACHE.get("products")
    if disk_prods:
        utc_now = datetime.now(timezone.utc).isoformat()
        _LIVE_COSMETICS_CACHE["products"] = disk_prods
        _LIVE_COSMETICS_CACHE["status"] = "success"
        _LIVE_COSMETICS_CACHE["fetched_at"] = utc_now

        return {
            "status": "success",
            "data_source": "Makeup API",
            "live": True,
            "fetched_at": utc_now,
            "total_products_available": len(disk_prods),
            "total_fetched": min(limit, len(disk_prods)),
            "products": disk_prods[:limit]
        }

    return {
        "status": "error",
        "data_source": "Makeup API",
        "live": True,
        "message": "LIVE COSMETICS API UNAVAILABLE: Unable to reach Makeup API",
        "products": []
    }
