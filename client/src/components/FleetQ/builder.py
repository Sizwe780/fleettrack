import hashlib
import json

class ProvenanceBuilder:
    def sign(self, data: Dict) -> str:
        canonical = json.dumps(data, sort_keys=True).encode("utf-8")
        return hashlib.sha256(canonical).hexdigest()

    def verify(self, data: Dict, signature: str) -> bool:
        return self.sign(data) == signature