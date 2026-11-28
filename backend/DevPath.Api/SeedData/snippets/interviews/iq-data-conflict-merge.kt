data class Note(val id: String, val title: String, val body: String, val version: Long)
data class Merge(val note: Note, val conflict: Boolean)

// Challenge: three-way merge of a note edited locally and remotely since `base`.
fun merge(base: Note, local: Note, remote: Note): Merge {
    fun <T> pick(b: T, l: T, r: T): Pair<T, Boolean> = when {
        l == r -> l to false
        l == b -> r to false          // only remote changed
        r == b -> l to false          // only local changed
        else -> r to true             // both changed differently
    }
    val (title, titleConflict) = pick(base.title, local.title, remote.title)
    val (body, bodyConflict) = pick(base.body, local.body, remote.body)
    val mergedBody = if (bodyConflict) "${remote.body}\n\n--- your offline edit ---\n${local.body}" else body
    return Merge(
        note = remote.copy(title = title, body = mergedBody, version = maxOf(local.version, remote.version) + 1),
        conflict = titleConflict || bodyConflict,
    )
}
