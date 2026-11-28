@Module
@TestInstallIn(components = [SingletonComponent::class], replaces = [NetworkModule::class])
object FakeNetworkModule {
    @Provides @Singleton fun catalogApi(): CatalogApi = FakeCatalogApi(products = listOf(product("Blue mug", 1200)))
}

@HiltAndroidTest
class CheckoutJourneyTest {
    @get:Rule(order = 0) val hilt = HiltAndroidRule(this)
    @get:Rule(order = 1) val compose = createAndroidComposeRule<MainActivity>()

    @Test fun searchAddAndCheckout() {
        compose.onNodeWithTag("search").performTextInput("mug")
        compose.onNodeWithText("Blue mug").performClick()
        compose.onNodeWithText("Add to cart").performClick()
        compose.onNodeWithTag("cart").performClick()
        compose.onNodeWithText("Checkout").performClick()
        compose.onNodeWithText("Total: 12.00").assertIsDisplayed()
    }
}

// build.gradle.kts: run on a Gradle Managed Device in CI
// testOptions { managedDevices { localDevices { create("pixel6api34") {
//     device = "Pixel 6"; apiLevel = 34; systemImageSource = "aosp-atd" } } } }
// ./gradlew pixel6api34DebugAndroidTest
