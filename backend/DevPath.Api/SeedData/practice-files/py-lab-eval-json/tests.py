import json
from evaluation import parse_results, summary, to_json

DATA = '[{"id": 1, "score": 5, "answer": "مرحبًا"}, {"id": 2, "score": 2}, {"id": 3, "score": 4, "answer": "ok"}]'

def test_parse():
    """Missing answers become None"""
    results = parse_results(DATA)
    assert len(results) == 3
    assert results[1]["answer"] is None, "item 2 has no answer"

def test_summary():
    """Summary counts, averages and lists failures"""
    assert summary(parse_results(DATA)) == {"count": 3, "average": 3.67, "failed": [2]}

def test_empty():
    """An empty list does not crash"""
    assert summary([]) == {"count": 0, "average": 0, "failed": []}

def test_arabic_kept():
    """to_json keeps Arabic readable and stays valid JSON"""
    text = to_json({"answer": "مرحبًا"})
    assert "مرحبًا" in text, "use ensure_ascii=False"
    assert json.loads(text) == {"answer": "مرحبًا"}
