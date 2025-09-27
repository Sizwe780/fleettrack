from fastapi import FastAPI
from impossibility_index.index import ImpossibilityIndex
from causal_reactor.reactor import CausalReactor
from quantum_sim.simulator import QuantumSim
from intent_anticipation.anticipator import IntentAnticipator
from provenance.builder import ProvenanceBuilder

app = FastAPI()
index = ImpossibilityIndex()
reactor = CausalReactor()
sim = QuantumSim()
anticipator = IntentAnticipator()
prov = ProvenanceBuilder()

@app.post("/add_constraint")
def add_constraint(payload: dict):
    index.add_constraint(payload["constraint_id"], payload)
    return {"status": "added"}

@app.get("/trace/{constraint_id}")
def trace(constraint_id: str):
    constraint = index.get_constraint(constraint_id)
    return {"trace": reactor.trace_constraint(constraint)}

@app.get("/forecast/{domain}")
def forecast(domain: str):
    return reactor.forecast_emergence(domain, context={})

@app.get("/simulate/{scenario}")
def simulate(scenario: str):
    return sim.predict(scenario)

@app.get("/anticipate")
def anticipate(query: str):
    return {"intent": anticipator.anticipate(query)}

@app.post("/sign")
def sign(data: dict):
    sig = prov.sign(data)
    return {"signature": sig}