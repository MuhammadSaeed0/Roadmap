import json
import os
import requests

# JSON text <-> Python objects; keep Arabic readable with ensure_ascii=False
data = json.loads('{"question": "ما هو الـ API؟", "tags": ["web", "http"]}')
print(data["tags"][0])
print(json.dumps(data, ensure_ascii=False, indent=2))

# HTTP with a timeout, errors as exceptions, and the key from the environment
response = requests.post(
    "https://api.example.com/v1/answers",
    json={"question": data["question"]},
    headers={"Authorization": f"Bearer {os.environ['API_KEY']}"},
    timeout=30,
)
response.raise_for_status()
print(response.json().get("answer", "(no answer)"))
