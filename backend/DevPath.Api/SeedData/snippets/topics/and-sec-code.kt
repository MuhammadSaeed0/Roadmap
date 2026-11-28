// app/build.gradle.kts
android {
    buildTypes {
        release {
            isMinifyEnabled = true          // R8: shrink + obfuscate
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
}

// Never: BuildConfig.NUTRITION_SECRET in the app. Instead, call your backend:
interface BackendApi {
    @POST("nutrition/search")
    suspend fun search(@Body q: SearchRequest, @Header("X-Integrity") integrityToken: String): List<FoodDto>
}

// Play Integrity: request a token bound to this action, verify it on the server.
suspend fun integrityToken(context: Context, action: String): String {
    val nonce = Base64.encodeToString(sha256("$action:${UUID.randomUUID()}"), Base64.URL_SAFE or Base64.NO_WRAP)
    val response = IntegrityManagerFactory.create(context)
        .requestIntegrityToken(IntegrityTokenRequest.builder().setNonce(nonce).build())
        .await()
    return response.token()          // the server decodes it with Google and checks the verdicts
}
