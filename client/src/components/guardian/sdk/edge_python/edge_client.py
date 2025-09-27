# {
#  "intent": "Edge Python SDK client: build signed EventBundle using provenance primitives and POST to FleetTrack /v1/events",
#  "author_id": "SizweNgwenya-FleetCore",
#  "timestamp": "2025-09-26T20:40:00Z",
#  "commit_hash": "REPLACE_WITH_GIT_COMMIT",
#  "rationale": "Lightweight edge client to create canonical event bundles for FleetTrack ingestion and deterministic replay",
#  "schema_version": "1.0.0"
# }

from __future__ import annotations
import json
import time
import uuid
from typing import Dict, Any, Optional
import requests

from fcqx_provenance.provenance import ModuleHeader, InMemoryKeyStore, ProvenanceBuilder, now_iso, canonicalize, sha256_hex

SDK_MODULE_HEADER = ModuleHeader(
    intent="Edge SDK: produce signed EventBundle for FleetTrack",
    author_id="SizweNgwenya-FleetCore",
    timestamp=now_iso(),
    commit_hash="REPLACE_WITH_GIT_COMMIT",
    rationale="Edge client to produce deterministic, signed EventBundles for ingestion"
)

class EdgeClient:
    def __init__(self, server_url: str, keystore: Optional[InMemoryKeyStore] = None, module_header: Optional[ModuleHeader] = None):
        self.server_url = server_url.rstrip("/")
        self.keystore = keystore or InMemoryKeyStore()
        self.pb = ProvenanceBuilder(self.keystore)
        self.header = module_header or SDK_MODULE_HEADER

    def make_event_entry(self, event_payload: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Build and sign a single lineage entry for the event.
        Returns dict with 'entry' and 'signature' keys.
        """
        entry = self.pb.build_entry(self.header, step_type="edge_event", payload=event_payload, context=context)
        sig = self.pb.sign_entry(entry)
        return {"entry": json.loads(entry.to_canonical().decode("utf-8")), "signature": sig}

    def create_signed_bundle(self, entries: list, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create a canonical bundle structure expected by FleetTrack and Guardian:
        { "bundle": { bundle_id, created_at, metadata, entries: [...] }, "bundle_signature": {...} }
        """
        bundle = {
            "bundle_id": str(uuid.uuid4()),
            "created_at": now_iso(),
            "metadata": metadata or {},
            "entries": entries
        }
        blob = canonicalize(bundle)
        bundle_hash = sha256_hex(blob)
        bundle_signature = {"bundle_hash": bundle_hash, "signed_at": now_iso()}
        return {"bundle": bundle, "bundle_signature": bundle_signature}

    def post_bundle(self, bundle_obj: Dict[str, Any], timeout: int = 10) -> Dict[str, Any]:
        """
        Post the signed bundle to the FleetTrack ingestion endpoint.
        Expects endpoint: POST {server_url}/v1/events
        """
        url = f"{self.server_url}/v1/events"
        headers = {"Content-Type": "application/json"}
        resp = requests.post(url, json=bundle_obj, headers=headers, timeout=timeout)
        try:
            resp.raise_for_status()
        except Exception as e:
            raise RuntimeError(f"POST failed: {e}; response={resp.text}")
        return resp.json()

# Simple example CLI-style helper function
def send_demo_event(server_url: str = "http://localhost:8080", scenario: str = "edge_demo"):
    client = EdgeClient(server_url)
    payload = {
        "event_id": str(uuid.uuid4()),
        "created_at": now_iso(),
        "scenario": scenario,
        "device": {"id": "edge-demo-1", "platform": "python-sdk"},
        "sensors": {"audio_stub": {"loudness_db": 72}, "motion_stub": {"accel_spike": 0.8}}
    }
    entry = client.make_event_entry(payload, context={"scenario": scenario})
    bundle = client.create_signed_bundle([entry], metadata={"source": "edge_sdk", "scenario": scenario})
    resp = client.post_bundle(bundle)
    print("Posted bundle response:", resp)

if __name__ == "__main__":
    # Quick demo runner
    send_demo_event()