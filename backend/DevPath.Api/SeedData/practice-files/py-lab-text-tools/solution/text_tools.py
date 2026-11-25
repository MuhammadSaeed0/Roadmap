def word_count(text):
    """Number of words separated by whitespace."""
    return len(text.split())


def top_words(text, n=3, *, ignore_case=True):
    """The n most common words as (word, count) pairs, most common first, ties in A-Z order.
    With ignore_case, "The" and "the" are the same word (reported in lower case)."""
    counts = {}
    for word in text.split():
        key = word.lower() if ignore_case else word
        counts[key] = counts.get(key, 0) + 1
    return sorted(counts.items(), key=lambda pair: (-pair[1], pair[0]))[:n]
