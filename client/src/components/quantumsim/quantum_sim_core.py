# {
#  "intent": "Provide minimal deterministic QuantumSim primitives (Qubit, Gate emulator, Ledger) wired to provenance",
#  "author_id": "SizweNgwenya-FleetCore",
#  "timestamp": "2025-09-26T18:30:00Z",
#  "commit_hash": "REPLACE_WITH_GIT_COMMIT",
#  "rationale": "Deterministic simulation primitives that emit provenance entries for audit and replay",
#  "schema_version": "1.0.0"
# }

from __future__ import annotations
import math, time, uuid
from dataclasses import dataclass, asdict
from typing import Tuple, List, Dict, Any, Optional

# Import provenance primitives
from fcqx_provenance.provenance import ModuleHeader, ProvenanceBuilder, InMemoryKeyStore, now_iso

# ---- Module header instance for this file (to be filled by CI) ----
MODULE_HEADER = ModuleHeader(
    intent="Deterministic quantum simulation primitives with provenance links",
    author_id="SizweNgwenya-FleetCore",
    timestamp=now_iso(),
    commit_hash="REPLACE_WITH_GIT_COMMIT",
    rationale="Provide QubitState, QuantumGateEmulator, and QuantumSimLedger for deterministic micro-simulations"
)

# ---- Qubit primitive ----
@dataclass
class QubitState:
    id: str
    label: str
    alpha: complex  # amplitude for |0>
    beta: complex   # amplitude for |1>
    created_at: float
    provenance_ref: str

    @staticmethod
    def make(label: str, alpha: complex = 1.0+0j, beta: complex = 0+0j, provenance_seed: Optional[int] = None) -> "QubitState":
        qid = str(uuid.uuid4())
        ts = time.time()
        prov_ref = f"{qid}:{provenance_seed or 0}:{int(ts)}"
        return QubitState(id=qid, label=label, alpha=alpha, beta=beta, created_at=ts, provenance_ref=prov_ref)

    def norm(self) -> float:
        return float(abs(self.alpha)**2 + abs(self.beta)**2)

    def normalize(self) -> None:
        n = math.sqrt(self.norm())
        if n == 0:
            self.alpha, self.beta = 1.0+0j, 0+0j
        else:
            self.alpha /= n
            self.beta  /= n

    def collapse(self) -> Dict[str, Any]:
        # Deterministic collapse for prototype: compare squared amplitudes
        p0 = abs(self.alpha)**2
        p1 = abs(self.beta)**2
        outcome = "|0>" if p0 >= p1 else "|1>"
        return {"qubit_id": self.id, "label": self.label, "outcome": outcome, "p0": p0, "p1": p1, "prov_ref": self.provenance_ref}

# ---- Simple gate emulator ----
class QuantumGateEmulator:
    def __init__(self, provenance_builder: ProvenanceBuilder, module_header: ModuleHeader):
        self.provenance = provenance_builder
        self.header = module_header
        self.audit_log: List[Dict[str, Any]] = []

    def apply_gate(self, qubit: QubitState, gate: str, context: Optional[Dict[str, Any]] = None) -> QubitState:
        context = context or {}
        pre = (complex(qubit.alpha), complex(qubit.beta))
        # Deterministic gate transformations (normalized)
        if gate.upper() == "X":
            qubit.alpha, qubit.beta = qubit.beta, qubit.alpha
        elif gate.upper() == "H":
            a, b = qubit.alpha, qubit.beta
            s = 1.0 / math.sqrt(2.0)
            qubit.alpha = s * (a + b)
            qubit.beta  = s * (a - b)
        elif gate.upper() == "Z":
            qubit.alpha = qubit.alpha
            qubit.beta = -qubit.beta
        elif gate.upper() == "I":
            pass
        else:
            # Unknown gate: no-op but record
            pass
        qubit.normalize()
        post = (complex(qubit.alpha), complex(qubit.beta))
        entry_payload = {
            "qubit_id": qubit.id,
            "gate": gate,
            "pre_state": [str(pre[0]), str(pre[1])],
            "post_state": [str(post[0]), str(post[1])],
        }
        entry = self.provenance.build_entry(self.header, step_type="apply_gate", payload=entry_payload, context=context)
        sig = self.provenance.sign_entry(entry)
        log_item = {"entry": entry_payload, "entry_id": entry.entry_id, "signature": sig}
        self.audit_log.append(log_item)
        return qubit

    def get_audit_log(self) -> List[Dict[str, Any]]:
        return list(self.audit_log)

# ---- Ledger to store simulation steps with provenance ----
class QuantumSimLedger:
    def __init__(self, provenance_builder: ProvenanceBuilder, module_header: ModuleHeader):
        self.provenance = provenance_builder
        self.header = module_header
        self.ledger: List[Dict[str, Any]] = []

    def commit_step(self, step_type: str, payload: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        entry = self.provenance.build_entry(self.header, step_type=step_type, payload=payload, context=context)
        sig = self.provenance.sign_entry(entry)
        record = {
            "entry_id": entry.entry_id,
            "step_type": step_type,
            "payload": payload,
            "created_at": entry.created_at,
            "signature": sig
        }
        self.ledger.append(record)
        return record

    def export_ledger(self) -> Dict[str, Any]:
        # Canonical export format for audit / replay
        bundle = {
            "ledger_id": str(uuid.uuid4()),
            "created_at": time.time(),
            "module": asdict(self.header),
            "records": self.ledger
        }
        return bundle

# ---- Convenience: run a deterministic micro-simulation ----
def run_micro_simulation(seed_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    ks = InMemoryKeyStore()
    pb = ProvenanceBuilder(ks)
    # Use a derived module header clone to capture consistent seed influence
    header = ModuleHeader(
        intent=MODULE_HEADER.intent,
        author_id=MODULE_HEADER.author_id,
        timestamp=MODULE_HEADER.timestamp,
        commit_hash=MODULE_HEADER.commit_hash,
        rationale=MODULE_HEADER.rationale,
        schema_version=MODULE_HEADER.schema_version,
        module_id=MODULE_HEADER.module_id
    )
    # Build ledger and emulator
    ledger = QuantumSimLedger(pb, header)
    emulator = QuantumGateEmulator(pb, header)

    # Create qubits deterministically
    q1 = QubitState.make("q1", alpha=1.0+0j, beta=0+0j, provenance_seed=pb.derive_seed(header, seed_context))
    q2 = QubitState.make("q2", alpha=0.6+0.0j, beta=0.8+0.0j, provenance_seed=pb.derive_seed(header, seed_context))

    # Commit initial states
    ledger.commit_step("init_qubit", {"qubit": {"id": q1.id, "label": q1.label, "alpha": str(q1.alpha), "beta": str(q1.beta)}}, context=seed_context)
    ledger.commit_step("init_qubit", {"qubit": {"id": q2.id, "label": q2.label, "alpha": str(q2.alpha), "beta": str(q2.beta)}}, context=seed_context)

    # Apply gates deterministically
    emulator.apply_gate(q1, "H", context=seed_context)
    emulator.apply_gate(q2, "X", context=seed_context)

    # Record post states
    ledger.commit_step("post_state", {"qubit": {"id": q1.id, "alpha": str(q1.alpha), "beta": str(q1.beta)}}, context=seed_context)
    ledger.commit_step("post_state", {"qubit": {"id": q2.id, "alpha": str(q2.alpha), "beta": str(q2.beta)}}, context=seed_context)

    # Collapse outcomes
    c1 = q1.collapse()
    c2 = q2.collapse()
    ledger.commit_step("collapse", {"outcome": c1}, context=seed_context)
    ledger.commit_step("collapse", {"outcome": c2}, context=seed_context)

    return ledger.export_ledger()

# ---- Quick CLI demo run when invoked directly ----
if __name__ == "__main__":
    bundle = run_micro_simulation(seed_context={"scenario": "demo_run"})
    import json
    print(json.dumps(bundle, indent=2, default=str))