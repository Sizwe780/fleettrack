"""
GenesisChain — Immutable Cognition Ledger  
Author: Sizwe Ngwenya  
Purpose: Record collapse vectors, mutations, and insights in a cryptographically linked chain of sovereign cognition.
"""

import datetime, hashlib, json
from QuantumSim import generate_collapse_vector, log_quantum_event
from ArchitectSignature import embed_authorship

# 🔹 Genesis Block
def create_genesis_block(seed):
    collapse_vector = generate_collapse_vector(seed)
    payload = {
        "index": 0,
        "seed": seed,
        "collapse_vector": collapse_vector,
        "previous_hash": "0" * 64,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    signed = embed_authorship(payload, context="GenesisChain")
    block_hash = hashlib.sha256(json.dumps(signed).encode()).hexdigest()
    block = {**signed, "block_hash": block_hash}
    log_quantum_event("genesis_block_created", block)
    return block

# 🔹 Chain Builder
def build_genesis_chain(seed, length=10):
    chain = []
    previous_hash = "0" * 64
    for i in range(length):
        collapse_vector = generate_collapse_vector(seed + str(i))
        payload = {
            "index": i,
            "seed": seed + str(i),
            "collapse_vector": collapse_vector,
            "previous_hash": previous_hash,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        signed = embed_authorship(payload, context="GenesisChain")
        block_hash = hashlib.sha256(json.dumps(signed).encode()).hexdigest()
        block = {**signed, "block_hash": block_hash}
        chain.append(block)
        previous_hash = block_hash
        log_quantum_event("genesis_chain_block_created", block)
    return chain

def append_to_genesis(insight):
    entry = {
        "concept": insight["concept"],
        "timestamp": insight["timestamp"],
        "hash": hashlib.sha256(json.dumps(insight).encode()).hexdigest()
    }
    with open("genesis_chain.log", "a") as chain:
        chain.write(json.dumps(entry) + "\n")

        