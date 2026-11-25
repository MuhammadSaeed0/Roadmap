# Blocks are indented; there are no braces, no semicolons and no declared types.
def describe(score: int) -> str:          # type hints are optional and only documentation
    if score >= 90:
        return "excellent"
    elif score >= 60:
        return "passed"
    else:
        return "try again"

name = input() or "friend"
for score in [95, 72, 40]:
    print(f"{name}: {score} -> {describe(score)}")

try:
    age = int("twenty")
except ValueError as error:
    print(f"Not a number: {error}")
