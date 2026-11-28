android {
    defaultConfig {
        versionCode = 12            // must increase with every upload to Google Play
        versionName = "1.4.0"       // what users see
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"            // install debug and release side by side
        }
        release {
            isMinifyEnabled = true                    // R8 shrinks and obfuscates code
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    flavorDimensions += "environment"
    productFlavors {
        create("staging") {
            dimension = "environment"
            applicationIdSuffix = ".staging"
            buildConfigField("String", "API_URL", "\"https://staging.api.example.com/\"")
        }
        create("production") {
            dimension = "environment"
            buildConfigField("String", "API_URL", "\"https://api.example.com/\"")
        }
    }
    buildFeatures { buildConfig = true }
}
// ./gradlew bundleProductionRelease   -> app/build/outputs/bundle/productionRelease/app-production-release.aab
