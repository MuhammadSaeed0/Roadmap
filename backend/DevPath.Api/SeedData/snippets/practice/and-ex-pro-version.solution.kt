data class VersionInfo(val name: String, val code: Int)

private val TAG = Regex("""^v(\d+)\.(\d+)\.(\d+)(?:-rc(\d+))?$""")

fun versionInfo(tag: String): VersionInfo {
    val m = requireNotNull(TAG.matchEntire(tag)) { "Malformed tag: $tag" }
    val (major, minor, patch) = m.destructured.toList().take(3).map(String::toInt)
    val rc = m.groupValues[4].takeIf { it.isNotEmpty() }?.toInt()
    require(minor < 100 && patch < 100) { "minor and patch must be < 100" }
    require(rc == null || rc in 1..98) { "rc must be 1..98" }
    val code = ((major * 100 + minor) * 100 + patch) * 100 + (rc ?: 99)
    return VersionInfo(tag.removePrefix("v"), code)
}
