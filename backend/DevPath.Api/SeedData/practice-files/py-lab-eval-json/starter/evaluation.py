import json


def parse_results(text):
    """Parse a JSON array of {"id", "score", "answer"?}. Items without "answer" get answer None."""
    return []


def summary(results, threshold=3):
    """{"count": n, "average": mean score rounded to 2, "failed": ids with score below threshold, in order}."""
    return {}


def to_json(summary_dict):
    """Pretty JSON (indent=2) that keeps Arabic text as it is."""
    return ""
