# {
#   "intent": "CLI for Guardian prototype: simulate scenarios, show stored bundles, and verify bundles",
#   "author_id": "SizweNgwenya-FleetCore",
#   "timestamp": "2025-09-26T21:10:00Z",
#   "commit_hash": "REPLACE_WITH_GIT_COMMIT",
#   "rationale": "User-facing CLI to drive the Guardian microservice and inspect provenance-signed bundles",
#   "schema_version": "1.0.0"
# }

from __future__ import annotations
import argparse
import json
import os
import sys
from typing import Optional

import requests # type: ignore

from fcqx_provenance.provenance import ( # type: ignore
    InMemoryKeyStore,
    ProvenanceBuilder,
    LineageEntry,
    canonicalize,
    sha256_hex
)

DEFAULT_GUARDIAN_URL = os.environ.get("FCQX_GUARDIAN_URL", "http://localhost:8080")

def simulate_remote(guardian_url: str, scenario: str, context: Optional[dict] = None) -> dict:
    url = f"{guardian_url.rstrip('/')}/simulate"
    payload = {"scenario": scenario, "context": context or {}}
    try:
        resp = requests.post(url, json=payload, timeout=15)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print("Simulation failed:", e)
        return {}

def fetch_alert(guardian_url: str, bundle_id: str) -> dict:
    url = f"{guardian_url.rstrip('/')}/alerts/{bundle_id}"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print("Fetch failed:", e)
        return {}

def verify_local_bundle(bundle_obj: dict) -> bool:
    ks = InMemoryKeyStore()
    pb = ProvenanceBuilder(ks)
    try:
        entries = bundle_obj.get("bundle", {}).get("entries", [])
        for ent in entries:
            entry_dict = ent.get("entry")
            sig = ent.get("signature")
            entry_obj = LineageEntry(
                entry_id=entry_dict.get("entry_id"),
                module_header=entry_dict.get("module_header"),
                step_type=entry_dict.get("step_type"),
                payload=entry_dict.get("payload"),
                seed=entry_dict.get("seed"),
                created_at=entry_dict.get("created_at")
            )
            if not pb.verify_signature(entry_obj, sig):
                print("❌ Signature failed for entry_id:", entry_obj.entry_id)
                return False

        bundle_sig = bundle_obj.get("bundle_signature", {})
        computed = sha256_hex(canonicalize({
            "bundle": bundle_obj.get("bundle", {}),
            "bundle_signature": bundle_sig
        }))
        expected = bundle_sig.get("bundle_hash", "")
        if computed != expected:
            print("❌ Bundle hash mismatch")
            print("Computed:", computed)
            print("Expected:", expected)
            return False

        return True
    except Exception as e:
        print("Verification error:", e)
        return False

def show_bundle_pretty(bundle_obj: dict) -> None:
    print(json.dumps(bundle_obj, indent=2, sort_keys=True))

def main(argv=None):
    parser = argparse.ArgumentParser(prog="fcqx-alert", description="Guardian CLI: simulate, fetch, verify alert bundles")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sim = sub.add_parser("simulate", help="Trigger a remote simulation on Guardian microservice")
    sim.add_argument("--url", default=DEFAULT_GUARDIAN_URL, help="Guardian service URL")
    sim.add_argument("--scenario", default="robbery_high_conf", help="Simulation scenario name")
    sim.add_argument("--context", default="{}", help="JSON string for additional context")

    fetch = sub.add_parser("fetch", help="Fetch a stored alert bundle by ID")
    fetch.add_argument("bundle_id", help="Bundle ID to fetch")
    fetch.add_argument("--url", default=DEFAULT_GUARDIAN_URL, help="Guardian service URL")

    verify = sub.add_parser("verify", help="Verify a local bundle JSON file")
    verify.add_argument("path", help="Path to bundle JSON file")

    args = parser.parse_args(argv)

    if args.cmd == "simulate":
        try:
            ctx = json.loads(args.context)
        except Exception:
            print("⚠️ Invalid context JSON; using empty context")
            ctx = {}
        print(f"🚀 Simulating '{args.scenario}' on {args.url} ...")
        result = simulate_remote(args.url, args.scenario, ctx)
        show_bundle_pretty(result)
        sys.exit(0)

    if args.cmd == "fetch":
        result = fetch_alert(args.url, args.bundle_id)
        if result:
            print("📦 Fetched bundle:")
            show_bundle_pretty(result)
            sys.exit(0)
        else:
            sys.exit(2)

    if args.cmd == "verify":
        if not os.path.exists(args.path):
            print("❌ File not found:", args.path)
            sys.exit(2)
        with open(args.path, "r", encoding="utf-8") as f:
            bundle_obj = json.load(f)
        ok = verify_local_bundle(bundle_obj)
        print("✅ Verification result:", "OK" if ok else "FAILED")
        sys.exit(0 if ok else 3)

if __name__ == "__main__":
    main()