class App : Application() {
    override fun onCreate() {
        super.onCreate()
        runBlocking { RemoteConfig.fetchAndActivate() }                 // network on startup
        val countries = assets.open("countries.json").bufferedReader().readText()   // 2 MB on Main
        Countries.load(Json.decodeFromString(countries))
        AnalyticsSdk.init(this); AdsSdk.init(this); ChatSdk.init(this)
    }
}

@Composable
fun FeedScreen(vm: FeedViewModel) {
    val state by vm.state.collectAsStateWithLifecycle()
    if (state.loadingFromNetwork) FullScreenSpinner() else ArticleList(state.articles)
}
