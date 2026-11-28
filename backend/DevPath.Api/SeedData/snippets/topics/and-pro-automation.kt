// app/build.gradle.kts: versions from git tags like v3.2.0
fun gitTag(): String = providers.exec { commandLine("git", "describe", "--tags", "--abbrev=0") }
    .standardOutput.asText.get().trim().removePrefix("v")

val versionNameFromTag = gitTag()                                     // "3.2.0"
val (major, minor, patch) = versionNameFromTag.split(".").map(String::toInt)

android {
    defaultConfig {
        versionName = versionNameFromTag
        versionCode = major * 10_000 + minor * 100 + patch          // 30200, always increasing
    }
}

plugins { id("com.github.triplet.play") version "3.12.1" }
play {
    serviceAccountCredentials.set(file(System.getenv("PLAY_SERVICE_ACCOUNT_JSON") ?: "missing.json"))
    track.set("internal")
    defaultToAppBundles.set(true)
    releaseStatus.set(com.github.triplet.gradle.androidpublisher.ReleaseStatus.COMPLETED)
}
// Release notes: app/src/main/play/release-notes/en-US/default.txt and ar/default.txt
// Upload:  ./gradlew publishReleaseBundle
// Promote: ./gradlew promoteArtifact --from-track internal --promote-track production --user-fraction 0.1
