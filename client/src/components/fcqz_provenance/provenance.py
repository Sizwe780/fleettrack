import json
import hashlib
from datetime import datetime

TRACE_LOG = "fleettrack_provenance.log"

def hash_vector(vector):
    vector_str = ",".join([str(v) for v in vector])
    return hashlib.sha256(vector_str.encode()).hexdigest()

def emit_provenance(insight, seed):
    payload = insight.get("payload", {})
    trace = {
        "timestamp": datetime.utcnow().isoformat(),
        "seed": seed,
        "depth": payload.get("depth"),
        "score": payload.get("insight_score"),
        "veto": payload.get("veto_triggered"),
        "vector": payload.get("collapse_vector"),
        "vector_hash": hash_vector(payload.get("collapse_vector", [])),
    }

    with open(TRACE_LOG, "a") as f:
        f.write(json.dumps(trace) + "\n")

    return trace