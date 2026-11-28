// build.gradle.kts (project)
plugins { id("com.google.gms.google-services") version "4.4.2" apply false }

// app/build.gradle.kts
plugins { id("com.google.gms.google-services") }
android {
    buildTypes {
        debug { applicationIdSuffix = ".debug" }          // registered in the dev Firebase project
    }
}
dependencies {
    implementation(platform("com.google.firebase:firebase-bom:33.7.0"))   // one version for all
    implementation("com.google.firebase:firebase-auth")
    implementation("com.google.firebase:firebase-firestore")
    implementation("com.google.firebase:firebase-appcheck-playintegrity")
    debugImplementation("com.google.firebase:firebase-appcheck-debug")
}
// app/src/debug/google-services.json   -> dev project
// app/src/release/google-services.json -> prod project

class App : Application() {
    override fun onCreate() {
        super.onCreate()
        Firebase.initialize(this)
        Firebase.appCheck.installAppCheckProviderFactory(
            if (BuildConfig.DEBUG) DebugAppCheckProviderFactory.getInstance()
            else PlayIntegrityAppCheckProviderFactory.getInstance()
        )
    }
}
