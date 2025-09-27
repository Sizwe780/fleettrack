# {
#  "intent": "Unit tests for Guardian alert pipeline: detectors -> fusion -> bundling -> verification -> replay",
#  "author_id": "SizweNgwenya-FleetCore",
#  "timestamp": "2025-09-26T21:40:00Z",
#  "commit_hash": "REPLACE_WITH_GIT_COMMIT",
#  "rationale": "Ensure deterministic behavior, signature verification, and end-to-end simulated alert flow",
#  "schema_version": "1.0.0"
# }

from __future__ import annotations
import json
import os
import tempfile
from typing import Any, Dict

import pytest
from fastapi.testclient import TestClient

from fcqx_provenance.provenance import InMemoryKeyStore, ProvenanceBuilder, ModuleHeader, now_iso, canonicalize, sha256_hex
from guardian.service import app as guardian_app
from guardian.bundler import AlertBundler
from guardian.detectors import AudioStub, MotionStub, FusionEngine, MODULE_HEADER as DETECTOR_HEADER

client = TestClient(guardian_app)

@pytest.fixture
def keystore():
    return InMemoryKeyStore()

def test_provenance_seed_determinism(keystore):
    pb = ProvenanceBuilder(keystore)
    header = ModuleHeader(intent="test_seed", author_id="t", timestamp=now_iso(), commit_hash="c", rationale="r")
    s1 = pb.derive_seed(header, {"scenario": "alpha"})
    s2 = pb.derive_seed(header, {"scenario": "alpha"})
    assert s1 == s2
    s3 = pb.derive_seed(header, {"scenario": "beta"})
    assert s1 != s3

def test_audio_motion_stubs_and_fusion(keystore):
    pb = ProvenanceBuilder(keystore)
    header = DETECTOR_HEADER
    # derive seed and create stubs
    seed = pb.derive_seed(header, {"scenario": "robbery_high_conf"})
    audio = AudioStub.make(provenance_seed=seed)
    motion = MotionStub.make(provenance_seed=seed)
    a_out = audio.analyze({"scenario": "robbery_high_conf"})
    m_out = motion.analyze({"scenario": "robbery_high_conf"})
    # ensure outputs have expected keys
    assert "features" in a_out and "likely_event" in a_out
    assert "features" in m_out and "likely_event" in m_out
    fusion = FusionEngine(keystore=keystore, module_header=header)
    alert = fusion.fuse([a_out, m_out], context={"scenario": "robbery_high_conf"})
    assert "risk_score" in alert and "top_contributors" in alert
    assert 0.0 <= alert["risk_score"] <= 1.0

def test_bundler_create_and_verify(keystore):
    bundler = AlertBundler(keystore=keystore)
    # synthetic alert payload
    payload = {"alert_id": "test-1", "risk_score": 0.9, "risk_label": "high"}
    bundle = bundler.create_signed_alert_bundle(payload, context={"scenario": "unit_test"}, metadata={"env": "test"})
    # Basic structure checks
    assert "bundle" in bundle and "bundle_signature" in bundle
    assert len(bundle["bundle"]["entries"]) == 1
    # verify using bundler API
    ok = bundler.verify_alert_bundle(bundle)
    assert ok is True

def test_guardian_simulate_endpoint_roundtrip(tmp_path: Any):
    # Call /simulate to produce a signed bundle
    resp = client.post("/simulate", json={"scenario": "robbery_high_conf", "context": {"unit": "test"}})
    assert resp.status_code == 200
    body = resp.json()
    assert body.get("status") == "simulated"
    bundle_id = body.get("bundle_id")
    assert bundle_id is not None
    # Fetch stored bundle via /alerts/{bundle_id}
    get_resp = client.get(f"/alerts/{bundle_id}")
    assert get_resp.status_code == 200
    stored = get_resp.json()
    # stored should contain bundle and bundle_signature
    assert "bundle" in stored and "bundle_signature" in stored
    bundle_obj = {"bundle": stored["bundle"], "bundle_signature": stored["bundle_signature"]}
    # Verify entries signatures using a local ProvenanceBuilder instance
    # Note: bundler.verify_alert_bundle uses its own keystore; emulate explicit verification here
    from guardian.bundler import AlertBundler
    bundler = AlertBundler()
    assert bundler.verify_alert_bundle(bundle_obj) is True

def test_replay_seeds_present_in_fleettrack_style():
    # Reuse simulate endpoint to generate a bundle
    resp = client.post("/simulate", json={"scenario": "robbery_high_conf", "context": {"unit": "replay_test"}})
    assert resp.status_code == 200
    body = resp.json()
    bundle = body.get("bundle")
    # Ensure entries include seed field inside entry payload
    entries = bundle.get("entries", [])
    assert len(entries) == 1
    entry = entries[0]["entry"]
    # The entry payload should have a seed present
    assert "seed" in entry and entry["seed"] is not None

def test_bundle_hash_consistency_with_canonicalization(keystore):
    pb = ProvenanceBuilder(keystore)
    header = ModuleHeader(intent="hash_test", author_id="x", timestamp=now_iso(), commit_hash="c", rationale="r")
    e = pb.build_entry(header, "step", {"a": 1}, context={"k": "v"})
    sig = pb.sign_entry(e)
    bundle = {"bundle": {"bundle_id": "b1", "created_at": now_iso(), "metadata": {}, "entries": [{"entry": json.loads(e.to_canonical().decode("utf-8")), "signature": sig}]}, "bundle_signature": {"bundle_hash": "tmp"}}
    computed = sha256_hex(canonicalize(bundle))
    # Ensure computing twice yields same value
    computed2 = sha256_hex(canonicalize(bundle))
    assert computed == computed2