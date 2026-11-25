from grades import letter, report

def test_boundaries():
    """Each letter starts at its boundary"""
    assert letter(90) == "A", "90 is an A"
    assert letter(89) == "B", "89 is a B"
    assert letter(60) == "D", "60 is a D"
    assert letter(59) == "F", "59 is an F"

def test_invalid():
    """Scores outside 0-100 raise ValueError"""
    for bad in (-1, 101):
        try:
            letter(bad)
        except ValueError:
            continue
        assert False, f"letter({bad}) should raise ValueError"

def test_report():
    """report keeps the order and formats each line"""
    assert report({"Sara": 92, "Omar": 71}) == ["Sara: 92 (A)", "Omar: 71 (C)"]
