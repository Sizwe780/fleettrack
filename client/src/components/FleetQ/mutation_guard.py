import json

def validate_mutation_depth(current_depth, max_depth):
    if current_depth >= max_depth:
        return False
    return True