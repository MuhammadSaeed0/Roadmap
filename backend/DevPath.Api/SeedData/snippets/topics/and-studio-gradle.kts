// app/build.gradle.kts
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.example.notes"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.notes"
        minSdk = 24          // oldest Android version that can install the app
        targetSdk = 35       // the version whose behaviour the app is tested against
        versionCode = 1
        versionName = "1.0"
    }
}

dependencies {
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.material3)
    implementation(libs.coil.compose)          // version comes from gradle/libs.versions.toml
    testImplementation(libs.junit)
}
