// core/data/build.gradle.kts
plugins { id("devpath.android.library") }
android { namespace = "dev.path.core.data" }
dependencies { implementation(libs.androidx.room.runtime) }

// build-logic/convention/src/main/kotlin/AndroidLibraryConventionPlugin.kt
class AndroidLibraryConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) = with(target) {
        pluginManager.apply("com.android.library")
        pluginManager.apply("org.jetbrains.kotlin.android")
        val libs = extensions.getByType<VersionCatalogsExtension>().named("libs")
        extensions.configure<LibraryExtension> {
            compileSdk = 35
            defaultConfig { minSdk = 24 }
            compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
            lint { abortOnError = true }
        }
        extensions.configure<KotlinAndroidProjectExtension> { jvmToolchain(17) }
        dependencies { add("implementation", libs.findLibrary("kotlinx-coroutines-android").get()) }
    }
}

// build-logic/convention/build.gradle.kts
// plugins { `kotlin-dsl` }
// dependencies { compileOnly(libs.android.gradlePlugin); compileOnly(libs.kotlin.gradlePlugin) }
// gradlePlugin { plugins { register("androidLibrary") {
//     id = "devpath.android.library"; implementationClass = "AndroidLibraryConventionPlugin" } } }
