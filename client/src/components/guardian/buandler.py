# {
#  "intent": "Produce signed Alert bundles for Guardian microservice using provenance primitives",
#  "author_id": "SizweNgwenya-FleetCore",
#  "timestamp": "2025-09-26T19:30:00Z",
#  "commit_hash": "REPLACE_WITH_GIT_COMMIT",
#  "rationale": "Wrap provenance builder to create alert bundles with deterministic seeds, top features, and signatures",
#  "schema_version": "1.0.0"
# }

from __future__ import annotations
import json
import time
import uuid
from typing import Dict, Any, List, Optional

from fcqx_provenance.provenance import ModuleHeader, ProvenanceBuilder, InMemoryKeyStore, now_iso, canonicalize, sha256_hex

# Module header instance for bundler
MODULE_HEADER = ModuleHeader(
    intent="Create signed alert bundles for Guardian microservice",
    author_id="SizweNgwenya-FleetCore",
    timestamp=now_iso(),
    commit_hash="REPLACE_WITH_GIT_COMMIT",
    rationale="Alert bundler that packages detection outputs into provenance-signed bundles"
)

class AlertBundler:
    def __init__(self, keystore: Optional[InMemoryKeyStore] = None, module_header: Optional[ModuleHeader] = None):
        self.keystore = keystore or InMemoryKeyStore()
        self.pb = ProvenanceBuilder(self.keystore)
        self.header = module_header or MODULE_HEADER

    def make_alert_entry(self, alert_payload: Dict[str, Any], context: Optional[Dict[str, Any]] = None):
        """
        Build a lineage entry for an alert (single step) and return the LineageEntry object and signature bundle.
        """
        entry = self.pb.build_entry(self.header, step_type="alert", payload=alert_payload, context=context)
        sig = self.pb.sign_entry(entry)
        return entry, sig

    def create_signed_alert_bundle(self, alert_payload: Dict[str, Any], context: Optional[Dict[str, Any]] = None, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create a canonical signed bundle for an alert including:
        - bundle metadata (tenant, module, model_version)
        - entries: list with single alert entry and signature
        - bundle signature (server-side hash for storage)
        """
        entry = self.pb.build_entry(self.header, step_type="alert", payload=alert_payload, context=context)
        sig = self.pb.sign_entry(entry)
        bundle = {
            "bundle_id": str(uuid.uuid4()),
            "created_at": now_iso(),
            "metadata": metadata or {},
            "module_header": json.loads(self.header.as_canonical().decode("utf-8")),
            "entries": [
                {
                    "entry": json.loads(entry.to_canonical().decode("utf-8")),
                    "signature": sig
                }
            ]
        }
        bundle_blob = canonicalize(bundle)
        bundle_hash = sha256_hex(bundle_blob)
        bundle_signature = {"bundle_hash": bundle_hash, "signed_at": now_iso()}
        return {"bundle": bundle, "bundle_signature": bundle_signature}

    def verify_alert_bundle(self, bundle_obj: Dict[str, Any]) -> bool:
        """
        Verify signatures for all entries inside an alert bundle.
        """
        entries = bundle_obj.get("bundle", {}).get("entries", [])
        for ent in entries:
            entry_dict = ent.get("entry")
            sig = ent.get("signature")
            # Reconstruct minimal LineageEntry-like object for verification using the same canonicalization
            from fcqx_provenance.provenance import LineageEntry
            entry_obj = LineageEntry(
                entry_id=entry_dict.get("entry_id"),
                module_header=entry_dict.get("module_header"),
                step_type=entry_dict.get("step_type"),
                payload=entry_dict.get("payload"),
                seed=entry_dict.get("seed"),
                created_at=entry_dict.get("created_at")
            )
            ok = self.pb.verify_signature(entry_obj, sig)
            if not ok:
                return False
        # Optionally verify bundle hash matches
        computed = sha256_hex(canonicalize({"bundle": bundle_obj["bundle"], "bundle_signature": bundle_obj["bundle_signature"]}))
        if computed != bundle_obj["bundle_signature"].get("bundle_hash", ""):
            # Bundle signature mismatch is acceptable at prototype if orchestration adds server-side signature later,
            # but return False for strict verification.
            return False
        return True