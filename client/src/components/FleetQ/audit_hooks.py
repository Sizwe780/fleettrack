import hashlib, json, datetime

def log_event(event_type, payload):
    timestamp = datetime.datetime.utcnow().isoformat()
    entry = {
        "timestamp": timestamp,
        "event": event_type,
        "payload": payload,
        "hash": hashlib.sha256((event_type + json.dumps(payload)).encode()).hexdigest()
    }
    with open("audit_trail.log", "a") as log:
        log.write(json.dumps(entry) + "\n")