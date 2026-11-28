// app/build.gradle.kts: signing comes from the environment, never from the repo
android {
    signingConfigs {
        create("upload") {
            storeFile = System.getenv("UPLOAD_KEYSTORE_PATH")?.let(::file)
            storePassword = System.getenv("UPLOAD_KEYSTORE_PASSWORD")
            keyAlias = System.getenv("UPLOAD_KEY_ALIAS")
            keyPassword = System.getenv("UPLOAD_KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("upload")   // Google re-signs with the app signing key
            isMinifyEnabled = true
        }
    }
}

// Create the upload key once (keep it and the passwords in a password manager):
// keytool -genkeypair -v -keystore upload.jks -alias upload -keyalg RSA -keysize 4096 -validity 9125
// Build the bundle Play needs:      ./gradlew :app:bundleRelease
// Fingerprints for Firebase/Maps:   Play Console > Test and release > App integrity > App signing
