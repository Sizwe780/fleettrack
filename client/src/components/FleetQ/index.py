from typing import Dict, List

class ImpossibilityIndex:
    def __init__(self):
        self.constraints: Dict[str, Dict] = {}

    def add_constraint(self, constraint_id: str, data: Dict):
        self.constraints[constraint_id] = data

    def get_constraint(self, constraint_id: str) -> Dict:
        return self.constraints.get(constraint_id, {})

    def list_all(self) -> List[str]:
        return list(self.constraints.keys())