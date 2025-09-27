"""
SaaSInterface — Subscription Tier Management  
Author: Sizwe Ngwenya  
Purpose: Define, enforce, and audit access to sovereign cognition modules via subscription tiers.
"""

import datetime, hashlib, json

# 🔹 Tier Definitions
SUBSCRIPTION_TIERS = {
    "Free": {
        "access": ["collapse_vector", "decoherence_simulation"],
        "rate_limit": 100,
        "audit_level": "basic"
    },
    "Pro": {
        "access": ["collapse_vector", "decoherence_simulation", "entanglement_propagation", "mutation_registry"],
        "rate_limit": 1000,
        "audit_level": "enhanced"
    },
    "Sovereign": {
        "access": "ALL",
        "rate_limit": "UNLIMITED",
        "audit_level": "institutional"
    }
}

TIERS = {
    "free": ["general_cognition"],
    "pro": ["economic_modeling", "theoretical_physics"],
    "enterprise": ["biomedical", "probabilistic", "causal_discovery"]
}

def check_access(user_tier, domain):
    return domain in TIERS.get(user_tier, [])

# 🔹 Subscription Validator
def validate_subscription(user_id, tier, module):
    access = SUBSCRIPTION_TIERS.get(tier, {}).get("access", [])
    allowed = module in access or access == "ALL"
    audit = {
        "user_id": user_id,
        "tier": tier,
        "module": module,
        "access_granted": allowed,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "hash": hashlib.sha256((user_id + tier + module).encode()).hexdigest()
    }
    with open("subscription_audit.log", "a") as log:
        log.write(json.dumps(audit) + "\n")
    return allowed