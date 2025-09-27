from causal_reactor.reactor import CausalReactor
from impossibility_index.index import ImpossibilityIndex
from quantum_sim.simulator import QuantumSim

def test_trace_and_forecast():
    index = ImpossibilityIndex()
    reactor = CausalReactor()
    index.add_constraint("fusion", {
        "known_blockers": ["plasma instability", "containment"],
        "domain": "energy"
    })
    trace = reactor.trace_constraint(index.get_constraint("fusion"))
    assert "plasma instability" in trace

    forecast = reactor.forecast_emergence("energy", {})
    assert forecast["estimated_year"] >= 2025

def test_quantum_sim_prediction():
    sim = QuantumSim()
    result = sim.predict("fusion breakthrough")
    assert 0.6 <= result["probability"] <= 0.99