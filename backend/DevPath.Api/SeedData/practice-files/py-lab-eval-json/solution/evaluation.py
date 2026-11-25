import json


def parse_results(text):
    """Parse a JSON array of {"id", "score", "answer"?}. Items without "answer" get answer None."""
    return [{"id": item["id"], "score": item["score"], "answer": item.get("answer")} for item in json.loads(text)]


def summary(results, threshold=3):
    """{"count": n, "average": mean score rounded to 2, "failed": ids with score below threshold, in order}."""
    scores = [r["score"] for r in results]
    return {
        "count": len(results),
        "average": round(sum(scores) / len(scores), 2) if scores else 0,
        "failed": [r["id"] for r in results if r["score"] < threshold],
    }


def to_json(summary_dict):
    """Pretty JSON (indent=2) that keeps Arabic text as it is."""
    return json.dumps(summary_dict, ensure_ascii=False, indent=2)
