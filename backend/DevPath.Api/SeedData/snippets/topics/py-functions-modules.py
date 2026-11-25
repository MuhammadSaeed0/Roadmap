# helpers.py
def average(values, *, digits=1):
    """Average of the values, rounded; keyword-only digits."""
    values = list(values)
    return round(sum(values) / len(values), digits) if values else 0

def min_max(values):
    return min(values), max(values)          # several values come back as a tuple

# main.py
from helpers import average, min_max

if __name__ == "__main__":                   # runs only when started directly, not when imported
    scores = [72, 95, 88, 64]
    low, high = min_max(scores)
    print(average(scores), low, high)

# Terminal: one environment per project
#   python -m venv .venv
#   .venv\Scripts\activate          (Windows)   source .venv/bin/activate   (macOS/Linux)
#   pip install requests python-dotenv
#   pip freeze > requirements.txt
