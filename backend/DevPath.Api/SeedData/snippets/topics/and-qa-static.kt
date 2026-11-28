// app/build.gradle.kts
android {
    lint {
        abortOnError = true
        warningsAsErrors = false
        baseline = file("lint-baseline.xml")            // legacy issues; shrink over time
        checkDependencies = true
        disable += "ObsoleteLintCustomCheck"
        error += listOf("MissingPermission", "UnspecifiedImmutableFlag", "HardcodedText")
    }
}

detekt {
    buildUponDefaultConfig = true
    config.setFrom(files("$rootDir/config/detekt.yml"))
    baseline = file("detekt-baseline.xml")
}

spotless {
    kotlin { target("**/*.kt"); ktlint() }
}

// CI step: ./gradlew lintRelease detekt spotlessCheck testDebugUnitTest koverXmlReport
