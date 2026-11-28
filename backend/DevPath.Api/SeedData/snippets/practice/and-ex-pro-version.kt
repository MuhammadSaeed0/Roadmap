data class VersionInfo(val name: String, val code: Int)

fun versionInfo(tag: String): VersionInfo {
    TODO("parse vMAJOR.MINOR.PATCH with an optional -rcN")
}

fun main() {
    println(versionInfo("v3.2.1"))      // VersionInfo(name=3.2.1, code=3020199)
    println(versionInfo("v3.2.1-rc2"))  // VersionInfo(name=3.2.1-rc2, code=3020102)
}
