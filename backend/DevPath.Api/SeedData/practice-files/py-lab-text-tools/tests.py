from text_tools import word_count, top_words

def test_count():
    """word_count splits on any whitespace"""
    assert word_count("one  two\nthree") == 3
    assert word_count("") == 0

def test_top():
    """top_words returns the most common words first"""
    assert top_words("the model reads the prompt and the model writes", 2) == [("the", 3), ("model", 2)]

def test_ties_and_case():
    """Ties are sorted A-Z and case is ignored by default"""
    assert top_words("b a B A c", 2) == [("a", 2), ("b", 2)]

def test_keyword_only():
    """ignore_case must be passed by name"""
    assert top_words("A a", 2, ignore_case=False) == [("A", 1), ("a", 1)]
    try:
        top_words("A a", 2, False)
    except TypeError:
        return
    assert False, "ignore_case should be keyword-only (put it after *)"
