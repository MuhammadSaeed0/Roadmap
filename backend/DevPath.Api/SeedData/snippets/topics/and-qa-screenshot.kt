// Compose Preview Screenshot Testing: previews in src/screenshotTest become tests.
@Preview(name = "Light", showBackground = true)
@Preview(name = "Dark", uiMode = Configuration.UI_MODE_NIGHT_YES, showBackground = true)
@Preview(name = "Arabic RTL", locale = "ar", showBackground = true)
@Preview(name = "Large font", fontScale = 2f, showBackground = true)
annotation class ScreenshotVariants

@ScreenshotVariants
@Composable
fun OrderCardScreenshot() {
    AppTheme {
        OrderCard(order = Order(id = "A1", title = "Blue mug x2", total = "24.00", status = OrderStatus.Shipped))
    }
}

// ./gradlew updateDebugScreenshotTest      -> records reference images
// ./gradlew validateDebugScreenshotTest    -> fails in CI when pixels change
