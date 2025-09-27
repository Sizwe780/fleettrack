# {
#  "intent": "Deterministic detector stubs (audio, motion) and a lightweight fusion engine for the Guardian prototype",
#  "author_id": "SizweNgwenya-FleetCore",
#  "timestamp": "2025-09-26T19:50:00Z",
#  "commit_hash": "REPLACE_WITH_GIT_COMMIT",
#  "rationale": "Provide deterministic, seed-driven detector stubs that produce explainable features and risk scores for alerts",
#  "schema_version": "1.0.0"
# }

from __future__ import annotations
import math
import time
import uuid
from dataclasses import dataclass, asdict
from typing import Dict, Any, List, Optional

from fcqx_provenance.provenance import ModuleHeader, ProvenanceBuilder, InMemoryKeyStore, now_iso

# Module header instance
MODULE_HEADER = ModuleHeader(
    intent="Deterministic detector stubs and fusion engine for Guardian",
    author_id="SizweNgwenya-FleetCore",
    timestamp=now_iso(),
    commit_hash="REPLACE_WITH_GIT_COMMIT",
    rationale="Edge detector stubs and fusion harness to generate reproducible alert payloads"
)

# ---- Simple deterministic audio detector stub ----
@dataclass
class AudioStub:
    id: str
    sample_rate: int
    frame_ms: int
    provenance_seed: int

    @staticmethod
    def make(sample_rate: int = 16000, frame_ms: int = 100, provenance_seed: int = 0) -> "AudioStub":
        return AudioStub(id=str(uuid.uuid4()), sample_rate=sample_rate, frame_ms=frame_ms, provenance_seed=provenance_seed)

    def analyze(self, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        ctx = context or {}
        # Deterministic pseudo-features derived from seed + context
        s = int(self.provenance_seed) ^ hash(f"{ctx.get('scenario','')}")
        # Simple deterministic indicators
        shout_score = ((s >> 3) & 0xFF) / 255.0  # 0..1
        glass_break_score = ((s >> 11) & 0x7F) / 127.0
        loudness = 30 + ((s >> 7) & 0x3F)  # dB approximation
        features = {
            "shout_score": round(shout_score, 3),
            "glass_break_score": round(glass_break_score, 3),
            "loudness_db": int(loudness)
        }
        # Heuristic label
        likely_event = "none"
        if shout_score > 0.7 or glass_break_score > 0.6:
            likely_event = "aggressive_audio"
        return {"source": "audio_stub", "features": features, "likely_event": likely_event, "seed": self.provenance_seed}

# ---- Simple deterministic motion detector stub ----
@dataclass
class MotionStub:
    id: str
    sampling_hz: int
    provenance_seed: int

    @staticmethod
    def make(sampling_hz: int = 50, provenance_seed: int = 0) -> "MotionStub":
        return MotionStub(id=str(uuid.uuid4()), sampling_hz=sampling_hz, provenance_seed=provenance_seed)

    def analyze(self, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        ctx = context or {}
        s = int(self.provenance_seed) ^ (hash(ctx.get("location","")) & 0xFFFFFFFF)
        accel_spike = ((s >> 5) & 0xFF) / 255.0
        orientation_change = ((s >> 13) & 0x3F) / 63.0
        sustained_motion = ((s >> 2) & 0x1F) / 31.0
        features = {
            "accel_spike": round(accel_spike, 3),
            "orientation_change": round(orientation_change, 3),
            "sustained_motion": round(sustained_motion, 3)
        }
        likely_event = "none"
        if accel_spike > 0.6 and sustained_motion > 0.4:
            likely_event = "struggle_or_fall"
        elif orientation_change > 0.8:
            likely_event = "sudden_movement"
        return {"source": "motion_stub", "features": features, "likely_event": likely_event, "seed": self.provenance_seed}

# ---- Fusion engine: deterministic weighted fusion with explainable top features ----
class FusionEngine:
    def __init__(self, keystore: Optional[InMemoryKeyStore] = None, module_header: Optional[ModuleHeader] = None):
        self.keystore = keystore or InMemoryKeyStore()
        self.pb = ProvenanceBuilder(self.keystore)
        self.header = module_header or MODULE_HEADER

    def fuse(self, sensor_outputs: List[Dict[str, Any]], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Deterministic fusion that:
        - combines normalized feature signals into a risk score [0,1]
        - extracts top-3 contributing features with scores
        - returns provenance-ready alert payload (includes seeds and model_version placeholder)
        """
        ctx = context or {}
        # Collect flat feature map
        flat_features: Dict[str, float] = {}
        seeds: Dict[str, int] = {}
        for out in sensor_outputs:
            src = out.get("source", "unknown")
            seeds[src] = out.get("seed", 0)
            feats = out.get("features", {})
            for k, v in feats.items():
                # Normalize numeric features heuristically into 0..1
                if isinstance(v, (int, float)):
                    # Heuristic normalizers
                    if "db" in k or "loudness" in k:
                        nv = min(1.0, max(0.0, (v - 30) / 70.0))
                    else:
                        nv = float(v)
                    flat_features[f"{src}.{k}"] = round(float(nv), 4)

        # Deterministic weighting based on seeds and feature name hashing
        score_acc = 0.0
        weight_sum = 0.0
        contributions: List[Dict[str, Any]] = []
        for fname, fval in sorted(flat_features.items()):
            # derive stable weight
            seed_comp = sum(seeds.values()) & 0xFFFFFFFF
            name_hash = abs(hash(fname)) & 0xFFFF
            weight = ((name_hash ^ seed_comp) % 97) / 100.0  # 0..0.96
            contrib = float(weight) * float(fval)
            score_acc += contrib
            weight_sum += weight
            contributions.append({"feature": fname, "weight": round(weight,4), "value": round(float(fval),4), "contrib": round(contrib,4)})

        # Final risk score normalized into 0..1
        risk_score = 0.0
        if weight_sum > 0:
            risk_score = min(1.0, score_acc / (weight_sum if weight_sum > 0 else 1.0))
        # Determine top-3 contributors
        top = sorted(contributions, key=lambda x: x["contrib"], reverse=True)[:3]
        # Simple decision label
        label = "low"
        if risk_score > 0.75:
            label = "high"
        elif risk_score > 0.4:
            label = "medium"

        alert_payload = {
            "alert_id": str(uuid.uuid4()),
            "created_at": now_iso(),
            "context": ctx,
            "risk_score": round(risk_score, 4),
            "risk_label": label,
            "top_contributors": top,
            "feature_map": flat_features,
            "seeds": seeds,
            "model_version": "fusion-v0.1"
        }
        return alert_payload