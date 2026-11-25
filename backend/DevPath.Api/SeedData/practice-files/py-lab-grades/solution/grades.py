def letter(score):
    """A for 90 and above, B for 80-89, C for 70-79, D for 60-69, F below 60.
    Raise ValueError for scores below 0 or above 100."""
    if score < 0 or score > 100:
        raise ValueError(f"score must be between 0 and 100, got {score}")
    if score >= 90:
        return "A"
    if score >= 80:
        return "B"
    if score >= 70:
        return "C"
    if score >= 60:
        return "D"
    return "F"


def report(scores):
    """One line per student, in the order given: "Sara: 92 (A)"."""
    return [f"{name}: {score} ({letter(score)})" for name, score in scores.items()]
