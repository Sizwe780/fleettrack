"""
FleetCoreDashboard — Cognition Visualization Interface  
Author: Sizwe Ngwenya  
Purpose: Visualize collapse vectors, mutation forks, veto triggers, and predictive insights across domains.
"""

import matplotlib.pyplot as plt
import numpy as np
import json

# 🔹 Vector Plotter
def plot_collapse_vector(vector, title="Collapse Vector"):
    plt.figure(figsize=(10, 4))
    plt.plot(vector, marker='o', linestyle='-', color='blue')
    plt.title(title)
    plt.xlabel("Index")
    plt.ylabel("Amplitude")
    plt.grid(True)
    plt.tight_layout()
    plt.show()

# 🔹 Mutation Fork Visualizer
def visualize_mutation_forks(fork_list):
    plt.figure(figsize=(12, 6))
    for i, fork in enumerate(fork_list):
        plt.plot(fork, label=f"Fork {i}", linestyle='--')
    plt.title("Mutation Forks")
    plt.xlabel("Index")
    plt.ylabel("Amplitude")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.show()

# 🔹 Insight Score Distribution
def plot_insight_scores(insights):
    scores = [i["payload"]["insight_score"] for i in insights]
    plt.figure(figsize=(8, 4))
    plt.hist(scores, bins=10, color='green', edgecolor='black')
    plt.title("Insight Score Distribution")
    plt.xlabel("Score")
    plt.ylabel("Frequency")
    plt.tight_layout()
    plt.show()