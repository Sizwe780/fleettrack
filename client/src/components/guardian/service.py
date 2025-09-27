# {
#  "intent": "Guardian microservice: simulate scenarios, run detectors, fuse signals, and emit signed alert bundles",
#  "author_id": "SizweNgwenya-FleetCore",
#  "timestamp": "2025-09-26T20:10:00Z",
#  "commit_hash": "REPLACE_WITH_GIT_COMMIT",
#  "rationale": "HTTP service to drive deterministic simulations and produce provenance-signed alert bundles for FleetCoreQuantumX pilots",
#  "schema_version": "1.0.0"
# }

from __future__ import annotations
import os
import json
import time
from typing import Dict, Any
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel

from fcqx_provenance.provenance import InMemoryKeyStore, ModuleHeader, now_iso
from guardian.detectors import AudioStub, MotionStub, FusionEngine, MODULE_HEADER as DETECTOR_HEADER
from guardian.bundler import AlertBundler, MODULE_HEADER as BUNDLER_HEADER

STORAGE_DIR = os.environ.get("FCQX_GUARDIAN_STORAGE", "/tmp/fcqx_guardian")
os.makedirs(STORAGE_DIR, exist_ok=True)

app = FastAPI(title="Fcqx Guardian Microservice", version="0.1.0")

# Pydantic models
class SimulateRequest(BaseModel):
    scenario: str
    context: Dict[str, Any] = {}

class AlertIngest(BaseModel):
    bundle: Dict[str, Any]
    bundle_signature: Dict[str, Any]

# Instantiate components
keystore = InMemoryKeyStore()
bundler = AlertBundler(keystore=keystore, module_header=BUNDLER_HEADER)
fusion = FusionEngine(keystore=keystore, module_header=DETECTOR_HEADER)

def _store_alert_bundle(bundle_obj: Dict[str, Any]) -> str:
    bid = bundle_obj["bundle"]["bundle_id"]
    path = os.path.join(STORAGE_DIR, f"alert_{bid}.json")
    with open(path, "w", encoding="utf-8") as f:
        f.write(json.dumps(bundle_obj, separators=(",", ":"), sort_keys=True))
    return bid

@app.get("/health")
async def health():
    return {"status": "ok", "time": int(time.time())}

@app.post("/simulate")
async def simulate(req: SimulateRequest, request: Request):
    """
    Simulate a deterministic scenario (e.g., robbery_high_conf) using seed-driven detectors,
    fuse outputs, create a signed alert bundle, and return it.
    """
    scenario = req.scenario or "demo"
    ctx = req.context or {}
    # Derive a lightweight provenance-influencing seed from scenario + timestamp
    # Use bundler.pb.derive_seed for determinism
    header = ModuleHeader(
        intent="guardian_simulation",
        author_id="SizweNgwenya-FleetCore",
        timestamp=now_iso(),
        commit_hash="REPLACE_WITH_COMMIT",
        rationale=f"simulate:{scenario}"
    )
    seed = bundler.pb.derive_seed(header, {"scenario": scenario, **ctx})
    # Instantiate deterministic stubs with derived seed
    audio = AudioStub.make(sample_rate=16000, frame_ms=100, provenance_seed=seed)
    motion = MotionStub.make(sampling_hz=50, provenance_seed=seed)
    audio_out = audio.analyze({"scenario": scenario, **ctx})
    motion_out = motion.analyze({"scenario": scenario, **ctx})

    # Fusion to produce alert payload
    alert_payload = fusion.fuse([audio_out, motion_out], context={"scenario": scenario, **ctx})

    # Add contextual hints for demo scenarios
    if scenario.lower().startswith("robbery"):
        alert_payload["scenario_hint"] = "robbery_pattern_detected"
    elif scenario.lower().startswith("fall"):
        alert_payload["scenario_hint"] = "medical_fall_detected"

    # Produce signed alert bundle
    bundle_obj = bundler.create_signed_alert_bundle(alert_payload, context={"scenario": scenario, **ctx}, metadata={"source": "simulator"})
    # Store locally for prototype
    bundle_id = _store_alert_bundle(bundle_obj)
    return {"status": "simulated", "bundle_id": bundle_id, "bundle": bundle_obj["bundle"], "bundle_signature": bundle_obj["bundle_signature"]}

@app.post("/alert")
async def ingest_alert(alert_in: AlertIngest):
    """
    Accept externally produced alert bundles (signed). Verify and store.
    """
    bundle_obj = {"bundle": alert_in.bundle, "bundle_signature": alert_in.bundle_signature}
    ok = bundler.verify_alert_bundle(bundle_obj)
    if not ok:
        raise HTTPException(status_code=400, detail="bundle verification failed")
    bid = _store_alert_bundle(bundle_obj)
    return {"status": "stored", "bundle_id": bid}

@app.get("/alerts/{bundle_id}")
async def get_alert(bundle_id: str):
    path = os.path.join(STORAGE_DIR, f"alert_{bundle_id}.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="bundle not found")
    with open(path, "r", encoding="utf-8") as f:
        stored = json.loads(f.read())
    return stored