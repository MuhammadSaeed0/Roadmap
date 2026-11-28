// :benchmark module (com.android.test) measuring the release-like app.
@RunWith(AndroidJUnit4::class)
class StartupBenchmark {
    @get:Rule val rule = MacrobenchmarkRule()

    @Test fun coldStartup() = rule.measureRepeated(
        packageName = "com.example.news",
        metrics = listOf(StartupTimingMetric()),
        iterations = 10,
        startupMode = StartupMode.COLD,
    ) {
        pressHome()
        startActivityAndWait()
    }

    @Test fun scrollFeed() = rule.measureRepeated(
        packageName = "com.example.news",
        metrics = listOf(FrameTimingMetric()),
        iterations = 5,
        setupBlock = { startActivityAndWait() },
    ) {
        device.findObject(By.res("feed")).fling(Direction.DOWN)
    }
}

// Baseline Profile generator: the journeys ART should precompile.
@RunWith(AndroidJUnit4::class)
class BaselineProfileGenerator {
    @get:Rule val rule = BaselineProfileRule()
    @Test fun generate() = rule.collect(packageName = "com.example.news") {
        pressHome(); startActivityAndWait()
        device.findObject(By.res("feed")).fling(Direction.DOWN)
        device.findObject(By.text("Top stories")).click()
    }
}
