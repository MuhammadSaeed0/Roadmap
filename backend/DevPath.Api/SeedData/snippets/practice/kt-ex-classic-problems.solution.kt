fun twoSum(numbers: List<Int>, target: Int): Pair<Int, Int>? {
    val seen = HashMap<Int, Int>()
    numbers.forEachIndexed { i, n ->
        seen[target - n]?.let { return it to i }
        seen[n] = i
    }
    return null
}

fun groupAnagrams(words: List<String>): List<List<String>> =
    words.groupBy { it.lowercase().toCharArray().sorted().joinToString("") }.values.toList()

fun mergeIntervals(intervals: List<Pair<Int, Int>>): List<Pair<Int, Int>> {
    intervals.forEach { (s, e) -> require(s <= e) { "Invalid interval $s..$e" } }
    val merged = mutableListOf<Pair<Int, Int>>()
    for (current in intervals.sortedBy { it.first }) {
        val last = merged.lastOrNull()
        if (last != null && current.first <= last.second) merged[merged.lastIndex] = last.first to maxOf(last.second, current.second)
        else merged += current
    }
    return merged
}
