#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Instagram Trending Content Search Script
Searches for trending content hooks, hashtags, and content patterns
on Instagram across multiple relevant keyword categories.
"""

import json
import urllib.parse
from datetime import datetime
import time
import csv
import os

try:
    import requests
except ImportError:
    print("Need to install requests: pip3 install requests")
    exit(1)


API_KEY = "9ab9d4694amsh1cdb56bbc9770a9p1eca1bjsnccf01daa8b1b"
BASE_URL = "https://instagram-looter2.p.rapidapi.com"

headers = {
    "x-rapidapi-key": API_KEY,
    "x-rapidapi-host": "instagram-looter2.p.rapidapi.com"
}

session = requests.Session()
session.headers.update(headers)


def search_hashtags(query):
    """Search hashtags by keyword"""
    try:
        url = f"{BASE_URL}/search?query={urllib.parse.quote(query)}&select=hashtags"
        resp = session.get(url, timeout=30)
        if resp.status_code == 200:
            return resp.json()
        return {}
    except Exception as e:
        print(f"  Error searching hashtags for '{query}': {e}")
        return {}


def get_hashtag_content(name):
    """Get posts under a specific hashtag"""
    try:
        url = f"{BASE_URL}/hashtag?name={urllib.parse.quote(name)}"
        resp = session.get(url, timeout=30)
        if resp.status_code == 200:
            return resp.json()
        return {}
    except Exception as e:
        return {}


def extract_hashtag_info(hashtag_data, keyword):
    """Extract useful info from hashtag search results"""
    results = []
    try:
        # Try to get hashtag results
        hashtags = hashtag_data.get('hashtags', [])
        for h in hashtags:
            name = h.get('name', '')
            media_count = h.get('media_count', 0)
            if name:
                results.append({
                    'keyword': keyword,
                    'hashtag': f'#{name}',
                    'media_count': media_count,
                    'platform': 'Instagram'
                })
    except Exception as e:
        pass
    return results


def format_count(n):
    """Format large numbers"""
    if n >= 1_000_000:
        return f"{n/1_000_000:.1f}M"
    elif n >= 1_000:
        return f"{n/1_000:.1f}K"
    return str(n)


# Keywords for trending content categories
keywords = [
    # Content hooks
    "viral", "trending", "trending2025", "viralreels",
    # Business/marketing
    "socialmediamarketing", "contentcreator", "digitalmarketing",
    "businessgrowth", "entrepreneur", "smallbusiness",
    # Engagement hooks
    "howto", "tips", "lifehack", "motivation", "success",
    # Lifestyle
    "lifestyle", "foodie", "fitness", "fashion",
    # Instagram features
    "reels", "reelsinstagram", "instagramreels", "instagood",
    # Seasonal/timely
    "summer2025", "summervibes", "mondaymotivation", "weekendvibes",
    # Trending topics
    "AI", "chatgpt", "productivity", "sidehustle",
    # Community
    "community", "behindthescenes", "storytime", "GRWM",
]

print("=" * 60)
print("INSTAGRAM TRENDING CONTENT RESEARCH")
print("=" * 60)
print(f"Searching {len(keywords)} keyword categories...")
print()

all_hashtag_results = []
hashtag_seen = set()

for i, keyword in enumerate(keywords, 1):
    print(f"[{i}/{len(keywords)}] Searching: {keyword}...", end=" ")
    try:
        data = search_hashtags(keyword)
        extracted = extract_hashtag_info(data, keyword)
        count = 0
        for item in extracted:
            tag = item['hashtag'].lower()
            if tag not in hashtag_seen:
                hashtag_seen.add(tag)
                all_hashtag_results.append(item)
                count += 1
        print(f"found {count} new hashtags")
    except Exception as e:
        print(f"error: {e}")
    
    # Rate limit protection
    time.sleep(0.4)

print()
print(f"Total unique hashtags found: {len(all_hashtag_results)}")

# Sort by media count
all_hashtag_results.sort(key=lambda x: x.get('media_count', 0), reverse=True)

# Save CSV
output_path = r"D:\Coding Folder\dailystack\dailystack-frontend\ig_trending_hashtags.csv"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['keyword', 'hashtag', 'media_count', 'platform'])
    writer.writeheader()
    for r in all_hashtag_results:
        writer.writerow(r)

print(f"Results saved to: {output_path}")
print()
print("TOP 30 HASHTAGS BY MEDIA COUNT:")
print("-" * 60)
for i, r in enumerate(all_hashtag_results[:30], 1):
    mc = r.get('media_count', 0)
    print(f"{i:2d}. {r['hashtag']:<30s} {format_count(mc):>10s} posts  (via: {r['keyword']})")
