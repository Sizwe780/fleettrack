"""
AuditExport — Institutional Trace Report Generator  
Author: Sizwe Ngwenya  
Purpose: Export quantum trace logs for institutional review and compliance.
"""

import json
import datetime

# 🔹 Export Trace Log
def export_trace_log(filename="quantum_trace.log"):
    try:
        with open(filename, "r") as log:
            entries = [json.loads(line) for line in log.readlines()]
        report = {
            "entry_count": len(entries),
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "entries": entries
        }
        return report
    except Exception as e:
        return {"error": str(e), "timestamp": datetime.datetime.utcnow().isoformat()}