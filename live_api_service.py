"""
Legacy Live API Service (Deprecated).
Replaced by live_cosmetics_service.py for Makeup API integration.
"""

def fetch_live_beauty_products(*args, **kwargs):
    from live_cosmetics_service import fetch_live_cosmetics
    return fetch_live_cosmetics(*args, **kwargs)
