class IntentAnticipator:
    def anticipate(self, query: str) -> str:
        if "impossible" in query:
            return "User seeks explanation for current scientific limits."
        return "User seeks predictive insight."