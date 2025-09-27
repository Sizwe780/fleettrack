"""
InsightCredits — Cognition Monetization Engine  
Author: Sizwe Ngwenya  
Purpose: Tokenize sovereign insights for licensing, resale, and institutional access.
"""

import datetime, hashlib, json

# 🔹 Credit Generator
def generate_insight_credit(insight_payload, user_id):
    timestamp = datetime.datetime.utcnow().isoformat()
    credit_id = hashlib.sha256((json.dumps(insight_payload) + user_id + timestamp).encode()).hexdigest()
    credit = {
        "credit_id": credit_id,
        "user_id": user_id,
        "insight": insight_payload,
        "timestamp": timestamp,
        "license": "Sovereign Insight v1.0"
    }
    with open("insight_credits.log", "a") as log:
        log.write(json.dumps(credit) + "\n")
    return credit