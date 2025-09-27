"""
FleetCoreAPI — REST Interface for QuantumSim Modules  
Author: Sizwe Ngwenya  
Purpose: Expose sovereign cognition modules via secure, auditable API endpoints.
"""

import datetime
from flask import Flask, request, jsonify

# 🔹 Import modules from components/FleetQ
from components.FleetQ.QuantumSim import sovereign_collapse_loop
from components.FleetQ.TemporalInterferenceEngine import simulate_temporal_interference
from components.FleetQ.ChronoCollapse import simulate_chrono_collapse
from components.FleetQ.SaaSInterface import validate_subscription
from components.FleetQ.MonetizationAuditor import generate_insight_credit
from components.FleetQ.FleetTrackDaemon import run_fleettrack
from components.FleetQ.MutationAuditor import audit_mutation
from components.FleetQ.GenesisChain import build_genesis_chain
from components.FleetQ.AuditExport import export_trace_log

app = Flask(__name__)

# 🔹 API Metadata
API_VERSION = "1.0.0"
API_AUTHOR = "Sizwe Ngwenya"
API_TIMESTAMP = datetime.datetime.utcnow().isoformat()

# 🔹 Endpoint: Collapse Loop
@app.route("/collapse", methods=["POST"])
def collapse_loop():
    data = request.json
    seed = data.get("seed")
    user_id = data.get("user_id")
    tier = data.get("tier")

    if not validate_subscription(user_id, tier, "collapse_vector"):
        return jsonify({"error": "Access denied"}), 403

    result = sovereign_collapse_loop(seed)
    return jsonify(result)

# 🔹 Endpoint: Temporal Interference
@app.route("/temporal", methods=["POST"])
def temporal_interference():
    data = request.json
    seed = data.get("seed")
    user_id = data.get("user_id")
    tier = data.get("tier")

    if not validate_subscription(user_id, tier, "temporal_interference"):
        return jsonify({"error": "Access denied"}), 403

    result = simulate_temporal_interference(seed)
    return jsonify(result)

# 🔹 Endpoint: Chrono Collapse
@app.route("/chrono", methods=["POST"])
def chrono_collapse():
    data = request.json
    seed = data.get("seed")
    user_id = data.get("user_id")
    tier = data.get("tier")

    if not validate_subscription(user_id, tier, "chrono_collapse"):
        return jsonify({"error": "Access denied"}), 403

    result = simulate_chrono_collapse(seed)
    return jsonify(result)

# 🔹 Endpoint: Metadata
@app.route("/meta", methods=["GET"])
def metadata():
    return jsonify({
        "api_version": API_VERSION,
        "author": API_AUTHOR,
        "timestamp": API_TIMESTAMP,
        "modules": ["collapse", "temporal", "chrono", "fleettrack", "mint_credit", "mutation_audit", "genesis_chain", "log_export"],
        "access_model": "tiered",
        "audit": "institutional"
    })

# 🔹 Endpoint: Insight Credit Minting
@app.route("/api/mint_credit", methods=["POST"])
def mint_credit():
    data = request.json
    credit = generate_insight_credit(
        user_id=data["user_id"],
        insight_id=data["insight_id"],
        insight_payload=data["insight_payload"]
    )
    return jsonify(credit)

# 🔹 Endpoint: FleetTrack Predictive Supremacy
@app.route("/api/fleettrack", methods=["POST"])
def fleettrack():
    data = request.json
    result = run_fleettrack(data["seed"])
    return jsonify(result)

# 🔹 Endpoint: Mutation Audit
@app.route("/api/mutation_audit", methods=["POST"])
def mutation_audit():
    data = request.json
    audit = audit_mutation(data["original"], data["mutated"])
    return jsonify(audit)

# 🔹 Endpoint: GenesisChain Ledger
@app.route("/api/genesis_chain", methods=["POST"])
def genesis_chain():
    data = request.json
    seed = data.get("seed")
    length = data.get("length", 10)
    chain = build_genesis_chain(seed, length)
    return jsonify(chain)

# 🔹 Endpoint: Audit Log Export
@app.route("/api/log_export", methods=["GET"])
def log_export():
    report = export_trace_log()
    return jsonify(report)

# 🔹 Entrypoint
if __name__ == "__main__":
    app.run(debug=True)